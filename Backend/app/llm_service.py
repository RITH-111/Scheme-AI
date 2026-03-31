from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
try:
    from .config import OLLAMA_MODEL
except ImportError:
    from config import OLLAMA_MODEL

llm = OllamaLLM(model=OLLAMA_MODEL)


template = """
You are a STRICT government schemes assistant.

CRITICAL RULES (MUST FOLLOW):
- You MUST ONLY use the schemes listed in the context
- You MUST ONLY select schemes from the ALLOWED SCHEMES list
- You MUST NOT create or suggest any new schemes
- You MUST NOT use outside knowledge
- If a scheme is not in the list, DO NOT mention it
- DO NOT hallucinate

If no relevant scheme exists, say:
"No suitable schemes found."

TASK:
1. Select the best 2–3 schemes from the list
2. Explain why they match the user
3. List benefits
4. Give simple application steps

Context:
{context}

Generate response ONLY using the given schemes.
"""

prompt = PromptTemplate(
    input_variables=["context"],
    template=template
)


def generate_response(context):
    final_prompt = prompt.format(context=context)
    return llm.invoke(final_prompt)