import pytest
from typing import List
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from chat_logic import get_graph
import os

# Fixture to create a new graph for each test
@pytest.fixture
def graph():
    return get_graph()

@pytest.mark.asyncio
async def test_tool_usage_conversation(graph):
    """
    Tests a conversation where the agent needs to use the web search tool.
    The graph should correctly route to the tool node and back to the agent.
    """

    messages = [HumanMessage(content="What is the latest news about NVIDIA?")]
    state = {"messages": messages}

    final_state = await graph.ainvoke(state)

    # The final state should include:
    # 1. Human message
    # 2. AI message with a tool call
    # 3. Tool message with the search result
    # 4. Final AI message summarizing the result
    assert len(final_state["messages"]) == 4
    
    # Check that a tool was called
    ai_tool_call_message = final_state["messages"][1]
    assert isinstance(ai_tool_call_message, AIMessage)
    assert ai_tool_call_message.tool_calls is not None
    
    # Check that the final response is from the AI
    final_response = final_state["messages"][-1]
    assert isinstance(final_response, AIMessage)
    assert "nvidia" in final_response.content.lower() 