from rest_framework.views import APIView
from rest_framework.response import Response
import os
from dotenv import load_dotenv
import chromadb
from openai import OpenAI
from sentence_transformers import SentenceTransformer

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is not set in .env")

# Initialize Groq client (chat only)
groq_client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=GROQ_API_KEY
)

# Initialize Chroma client and collection
chroma_client = chromadb.PersistentClient(path="chroma_db")
collection = chroma_client.get_or_create_collection("documents")

# Initialize local embedding model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

class ChatAPIView(APIView):
    def post(self, request):
        message = request.data.get("message")
        if not message:
            return Response({"role": "bot", "text": "No message provided"})

        user_message = message.strip().lower()

        # Greeting detection
        greetings = ["hi", "hii", "hello","hlo","bro", "hey", "whats up", "what's up"]
        if user_message in greetings:
            return Response({"role": "bot", "text": "Hello! How can I help you today?"})

        # Gratitude detection
        gratitude_phrases = ["thank you", "thanks", "nice work", "good job", "great job"]
        if any(phrase in user_message for phrase in gratitude_phrases):
            return Response({"role": "bot", "text": "Happy to assist!"})

        try:
            # Embed and retrieve top match
            query_vector = embedding_model.encode(message).tolist()
            results = collection.query(
                query_embeddings=[query_vector],
                n_results=1,
                include=["documents", "distances"]
            )

            # Fallback if nothing at all
            if not results.get('documents') or not results['documents']:
                return Response({"role": "bot", "text": "I'm not sure based on the available data."})

            top_distance = results['distances'][0][0]   # smaller distance = more similar
            # If too dissimilar (irrelevant), use safe fallback
            if top_distance > 0.45:
                return Response({"role": "bot", "text": "I'm not sure based on the available data."})

            # Extract context and ensure it's not empty
            context = " ".join(results['documents'][0])
            if not context or len(context.strip()) < 10:
                return Response({"role": "bot", "text": "I'm not sure based on the available data."})

            context = context[:2000]  # truncate

            # Prompt
            prompt = (
                "You are a helpful assistant. "
                "Never mention PDF, file, link, URL, or source explicitly. "
                "Start your answer with 'Based on the information I have,'. "
                "If the context isn't enough to answer, just say 'I'm not sure based on the available data.Please ask me relates to your work ' "
                f"\n\nContext:\n{context}\n\nQuestion: {message}"
            )

            response = groq_client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=300
            )
            bot_reply = response.choices[0].message.content.strip()

            return Response({"role": "bot", "text": bot_reply})

        except Exception as e:
            return Response({"role": "bot", "text": f"Error: {str(e)}"})
