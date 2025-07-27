from typing import List, TypedDict, Annotated
import operator
import os
from langchain_core.messages import BaseMessage, ToolMessage
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END, START
from langgraph.graph.message import add_messages

### ???

# --- Agent State ---
# This is the state that will be passed between nodes in the graph.
class AgentState(TypedDict):
    messages: Annotated[list, add_messages]


# --- Tools ---
# Define the tools the agent can use. For now, just a web search.
web_search_tool = DuckDuckGoSearchRun()
tools = [web_search_tool]


# --- Model ---
# Define the LLM. We'll bind the tools to it so it knows when to call them.
model = ChatOpenAI(temperature=0, streaming=True).bind_tools(tools)


# --- Nodes ---
# These are the functions that will be executed as nodes in our graph.

def should_continue(state: AgentState) -> str:
    """
    This function decides the next step. If the LLM has generated a response with
    tool calls, we'll execute the tools. Otherwise, we end the conversation.
    """
    last_message = state["messages"][-1]
    if not last_message.tool_calls:
        return "end"
    return "tools"

def call_model(state: AgentState):
    """
    This is the primary node that calls the LLM with the current conversation state.
    """
    response = model.invoke(state["messages"])
    return {"messages": [response]}

def call_tools(state: AgentState):
    """
    This node executes any tool calls requested by the LLM. The results of these
    tool calls are then added back to the conversation history.
    """
    last_message = state["messages"][-1]
    tool_messages = []
    for tool_call in last_message.tool_calls:
        tool_name = tool_call["name"]
        if tool_name == "duckduckgo_search":
            result = web_search_tool.invoke(tool_call["args"]["query"])
            tool_messages.append(ToolMessage(content=result, tool_call_id=tool_call["id"]))
    
    return {"messages": tool_messages}


# --- Graph Definition ---
def get_graph():
    # Here, we wire up the nodes into a state machine.
    workflow = StateGraph(AgentState)
   
    workflow.add_node("agent", call_model)
    workflow.add_node("tools", call_tools)

    workflow.set_entry_point("agent")

    # Add conditional logic for routing
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            "end": END,
        },
    )

    # Any time the tools are called, we loop back to the agent to process the results
    workflow.add_edge(START, "agent")
    workflow.add_edge("tools", "agent")

    # Compile the graph into a runnable application
    return workflow.compile() 


graph = get_graph()
