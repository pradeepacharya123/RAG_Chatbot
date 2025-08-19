import os
import chromadb
from openai import OpenAI

chroma_client = chromadb.Client()
collection = chroma_client.create_collection("documents")

groq_client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROQ_API_KEY")
)

def embed_documents(title, content):
    vector = groq_client.embeddings.create(
        model="text-embedding-3-large",
        input=content
    ).data[0].embedding

    collection.add(
        documents=[content],
        metadatas=[{"title": title}],
        embeddings=[vector]
    )
