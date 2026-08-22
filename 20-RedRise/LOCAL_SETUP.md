# Local Setup Guide (Ollama + ChromaDB)

This guide walks you through running RedRise entirely on your local machine with zero external API costs (except optionally Phase 1 Dify).

---

## Prerequisites

- **OS**: Linux (Ubuntu 22.04), macOS, or Windows (WSL2).
- **Python**: 3.10 or higher.
- **Node.js**: 18.x or higher (for the Next.js integration).
- **Docker** (optional, for Qdrant alternative).
- **GPU**: NVIDIA CUDA (optional, but recommended for speed).

---

## Step 1: Install Ollama

```bash
# Linux / macOS
curl -fsSL https://ollama.com/install.sh | sh

# Windows (WSL2) - run inside WSL terminal.
```

Pull the DeepSeek-Med-8B model (quantized for local use):

```bash
ollama pull deepseek-med-8b:q4_K_M
```

Verify it works:

```bash
ollama run deepseek-med-8b:q4_K_M "What herb is used for anxiety in TCM?"
```

---

Step 2: Set up Python Environment

```bash
cd 20-RedRise
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install chromadb sentence-transformers fastapi uvicorn
```

---

Step 3: Initialize the Vector Database

Create a Python script init_db.py:

```python
import chromadb
from sentence_transformers import SentenceTransformer

# Initialize ChromaDB (persistent)
client = chromadb.PersistentClient(path="./redrise_db")
collection = client.get_or_create_collection(name="redrise_knowledge")

# Load a local embedding model (BGE-m3 is ~2GB, all-MiniLM is smaller)
model = SentenceTransformer('all-MiniLM-L6-v2')

# Example: add a document chunk
doc = "Suan Zao Ren is used for insomnia and palpitations..."
embedding = model.encode(doc).tolist()
collection.add(
    documents=[doc],
    embeddings=[embedding],
    ids=["herbal_001"],
    metadatas=[{"phase": "herbal"}]
)

print("Database initialized.")
```

Run it: python init_db.py

---

Step 4: Configure Environment Variables

Create a .env file in the 20-RedRise/ directory:

```env
# Phase 1 (Optional - only if using Dify)
DIFY_API_KEY=your_key_here
DIFY_BASE_URL=https://api.dify.ai/v1

# Local RAG
CHROMA_PERSIST_DIR=./redrise_db
EMBEDDING_MODEL=all-MiniLM-L6-v2
OLLAMA_MODEL=deepseek-med-8b:q4_K_M
OLLAMA_HOST=http://localhost:11434
```

---

Step 5: Run the FastAPI Microservice (for local RAG)

Create api_server.py to expose a /rag endpoint:

```python
from fastapi import FastAPI, Request
import chromadb
from sentence_transformers import SentenceTransformer
import ollama

app = FastAPI()
client = chromadb.PersistentClient(path="./redrise_db")
embedder = SentenceTransformer('all-MiniLM-L6-v2')
collection = client.get_collection("redrise_knowledge")

@app.post("/api/redrise/rag")
async def rag_query(request: Request):
    data = await request.json()
    query = data["query"]
    phase = data.get("phase", "herbal")

    # Retrieve relevant chunks
    q_emb = embedder.encode(query).tolist()
    results = collection.query(query_embeddings=[q_emb], n_results=3)
    context = "\n\n".join(results["documents"][0])

    # Generate response via Ollama
    full_prompt = f"Context: {context}\n\nUser: {query}\nAssistant (herbal/spiritual guide):"
    response = ollama.chat(model="deepseek-med-8b:q4_K_M", messages=[{"role": "user", "content": full_prompt}])

    return {"answer": response["message"]["content"]}
```

Start the server:

```bash
uvicorn api_server:app --host 0.0.0.0 --port 8000
```

---

Step 6: Integrate with the Next.js Web App

In your web/ app, call the local API:

```typescript
const res = await fetch('http://localhost:8000/api/redrise/rag', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: userMessage, phase: detectedPhase })
});
const data = await res.json();
setMessages(prev => [...prev, { text: data.answer, sender: 'bot' }]);
```

---

Troubleshooting

· Ollama slow on CPU: Add OLLAMA_NUM_THREADS=8 to your environment.
· ChromaDB memory errors: Reduce the embedding model size (use all-MiniLM-L6-v2 instead of bge-m3).
· Dify API rate limits: Phase 1 is only used for high‑volume herbal searches. Cache common queries.

---

Next Steps

· Seed the database with Eldredge excerpts (see DATA_PIPELINE.md).
· Add the intent classifier to route between Phases 1, 2, and 3.
· Build the React frontend for the "Pause" timer UI.
