import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

# Load environment variables

def demo_simple_llm_call():
    """Demo a simple LLM call with LangChain"""
    
    # Initialize the LLM
    llm = ChatOpenAI(
        model="gpt-3.5-turbo",
        temperature=0.7,
        api_key=os.getenv("OPENAI_API_KEY")
    )
    
    # Simple string input
    response = llm.invoke("What is the capital of France?")
    print(f"Simple question response: {response.content}")
    
    # Using messages format
    messages = [
        SystemMessage(content="You are a helpful assistant that provides concise answers."),
        HumanMessage(content="Explain what Python is in one sentence.")
    ]
    
    response = llm.invoke(messages)
    print(f"Messages format response: {response.content}")
    
    return response

def demo_streaming_llm_call():
    """Demo streaming LLM call with LangChain"""
    
    llm = ChatOpenAI(
        model="gpt-3.5-turbo",
        temperature=0.7,
        api_key=os.getenv("OPENAI_API_KEY")
    )
    
    print("Streaming response:")
    for chunk in llm.stream("Tell me a short joke about programming"):
        print(chunk.content, end="", flush=True)
    print("\n")

def demo_batch_llm_call():
    """Demo batch LLM calls with LangChain"""
    
    llm = ChatOpenAI(
        model="gpt-3.5-turbo",
        temperature=0.7,
        api_key=os.getenv("OPENAI_API_KEY")
    )
    
    questions = [
        "What is 2+2?",
        "What is the largest planet?",
        "What programming language is known for 'batteries included'?"
    ]
    
    responses = llm.batch(questions)
    
    for i, response in enumerate(responses):
        print(f"Q{i+1}: {questions[i]}")
        print(f"A{i+1}: {response.content}\n")

if __name__ == "__main__":
    print("=== LangChain LLM Demo ===\n")
    
    # Run the demos
    demo_simple_llm_call()
    print("\n" + "="*50 + "\n")
    
    demo_streaming_llm_call()
    print("\n" + "="*50 + "\n")
    
    demo_batch_llm_call()


