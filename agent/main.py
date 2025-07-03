# Import relevant functionality
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_react_agent, AgentExecutor
from langchain_core.tools import Tool
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.tracers.checkpoint import MemorySaver
from Walmart_Cyber.backend import wrapper

# List of tools
tools = [detect_bot, check_transaction_risk, simulate_merkle_chain]

#init model
model = init_chat_model("gemini-2.0-flash", model_provider="google_genai")

#bind_tools
model_with_tools = model.bind_tools(tools)

#create_agent
agent = create_tool_calling_agent(llm=model_with_tools, tools=tools)

memory = MemorySaver()

agent_executor = AgentExecutor(agent=agent, tools=tools, checkpointer=memory)

query = "help"
response = agent_executor.invoke({"input":query})




# model = init_chat_model("gemini-2.0-flash", model_provider="google_genai")
# model_with_tools = model.bind_tools(tools)
# agent = create_tool_calling_agent(llm=)
# # Create the agent
# memory = MemorySaver()
# query = "What should i do?"
# response = model_with_tools.invoke([{"role":"user". "content": query}])
