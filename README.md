<<<<<<< HEAD
# AI-Powered RAG Chatbot using Django and Groq

A Retrieval-Augmented Generation (RAG) chatbot built with **Django REST Framework**.  
It extracts content from uploaded documents, stores them in **ChromaDB**, generates embeddings using **SentenceTransformers**, and uses **Groq (LLaMA-based)** models to answer user queries based on the stored knowledge.

---

 ✅ Key Features

- Intelligent responses based on your uploaded data (PDFs / text chunks)
- Embedding and similarity search using `sentence_transformers` + ChromaDB
- Groq LLM used to generate answers
- Does not reveal raw document or source (no “PDF” mentioned)
- Smart greetings & polite responses:
  - `"Hello! How can I help you today?"`
  - `"Happy to assist!"`
- Includes clean fallback: `"I'm not sure based on the available data."`




 ▶️ Local Setup Instructions

```bash
git clone <your-repo-url>
cd <project-folder>

# Create virtual environment
python -m venv env
# Activate it:
#  • On Windows:
env\Scripts\activate
#  • On Mac/Linux:
source env/bin/activate

# Install required libraries
pip install -r requirements.txt

# Create a .env file (in the root folder) with your API key:
GROQ_API_KEY=your_api_key_here

# Run the Django server
python manage.py runserver
=======
# RAG_Chatbot
AI-Powered RAG Chatbot for Contextual Question Answering
>>>>>>> c962d9364a1248ca5de2598d64d1ecb6979c40f0
