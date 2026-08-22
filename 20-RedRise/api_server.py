#!/usr/bin/env python3
"""
RedRise FastAPI Microservice

Exposes a single endpoint: /api/redrise/rag

Workflow:
1. Receive user query.
2. Classify intent (herbal / pause / journey / clarify).
3. If "clarify", return a standard clarification question.
4. Retrieve relevant chunks:
   - Phase 1 (herbal): call Dify API (if configured), fallback to local ChromaDB.
   - Phases 2 & 3: query local ChromaDB.
5. Build a phase‑specific system prompt.
6. Call Ollama (DeepSeek-Med-8B) for final generation.
7. Apply safety filter.
8. Return JSON response.

Environment variables (create a .env file):
- DIFY_API_KEY: optional, for Phase 1 cloud retrieval.
- DIFY_BASE_URL: optional, defaults to https://api.dify.ai/v1.
- CHROMA_PERSIST_DIR: path to ChromaDB persistence folder.
- OLLAMA_MODEL: e.g., deepseek-med-8b:q4_K_M.
- OLLAMA_HOST: defaults to http://localhost:11434.
- REDRISE_USE_DIFY_FALLBACK: set to "false" to always use local RAG even for herbal.
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import chromadb
from sentence_transformers import SentenceTransformer
import ollama
import httpx
from pydantic import BaseModel

# Local imports (our classifier)
from phase_classifier import get_classifier, classify_phase

# ============================================================
# LOGGING
# ============================================================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================
# PYDANTIC MODELS
# ============================================================
class RAGRequest(BaseModel):
    query: str
    phase: Optional[str] = None          # if not provided, auto‑detect
    session_id: Optional[str] = None     # for future state tracking
    chat_history: Optional[List[Dict[str, str]]] = None

class RAGResponse(BaseModel):
    answer: str
    phase: str
    confidence: float
    method: str
    sources: Optional[List[str]] = None  # source filenames for transparency
    clarification: Optional[str] = None

# ============================================================
# CONFIGURATION (from environment)
# ============================================================
DIFY_API_KEY = os.environ.get("DIFY_API_KEY", "")
DIFY_BASE_URL = os.environ.get("DIFY_BASE_URL", "https://api.dify.ai/v1")
CHROMA_PERSIST_DIR = os.environ.get("CHROMA_PERSIST_DIR", "./redrise_db")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "deepseek-med-8b:q4_K_M")
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
USE_DIFY_FALLBACK = os.environ.get("REDRISE_USE_DIFY_FALLBACK", "true").lower() == "true"

# Embedding model for local RAG (same as ingestion)
EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
COLLECTION_NAME = "redrise_knowledge"

# ============================================================
# GLOBAL CLIENTS (initialised at startup)
# ============================================================
class AppState:
    embedder: Optional[SentenceTransformer] = None
    chroma_client: Optional[chromadb.PersistentClient] = None
    chroma_collection: Optional[chromadb.Collection] = None

state = AppState()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models and clients at startup."""
    logger.info("🚀 Starting RedRise API Server...")
    
    # Load embedding model
    logger.info(f"Loading embedding model: {EMBEDDING_MODEL}")
    state.embedder = SentenceTransformer(EMBEDDING_MODEL)
    
    # Connect to ChromaDB
    logger.info(f"Connecting to ChromaDB at {CHROMA_PERSIST_DIR}")
    state.chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
    try:
        state.chroma_collection = state.chroma_client.get_collection(COLLECTION_NAME)
        logger.info(f"✅ Found collection '{COLLECTION_NAME}' with {state.chroma_collection.count()} records.")
    except:
        logger.warning(f"⚠️ Collection '{COLLECTION_NAME}' not found. Run ingest_knowledge.py first.")
        state.chroma_collection = None
    
    # Pre‑load classifier (it lazy‑loads its own embedding model)
    get_classifier()
    
    yield
    # Cleanup if needed
    logger.info("🛑 Shutting down RedRise API Server.")

# ============================================================
# FASTAPI APP
# ============================================================
app = FastAPI(
    title="RedRise RAG API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# HELPER: DIFY RETRIEVAL (Phase 1)
# ============================================================
async def dify_retrieve(query: str) -> Optional[str]:
    """Call Dify API for herbal retrieval. Returns concatenated context or None."""
    if not DIFY_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{DIFY_BASE_URL}/chat-messages",
                headers={"Authorization": f"Bearer {DIFY_API_KEY}"},
                json={
                    "query": query,
                    "response_mode": "blocking",
                    "user": "redrise-user",
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                # Dify returns the answer directly in "answer" field
                # We treat this as the final answer, not context, because Dify handles RAG internally.
                return data.get("answer", None)
            else:
                logger.warning(f"Dify API returned {resp.status_code}: {resp.text}")
                return None
    except Exception as e:
        logger.warning(f"Dify API error: {e}")
        return None

# ============================================================
# HELPER: LOCAL RAG RETRIEVAL (Phases 2 & 3, fallback for 1)
# ============================================================
def local_retrieve(query: str, phase: str, n_results: int = 4) -> List[str]:
    """Retrieve relevant chunks from ChromaDB for the given phase."""
    if not state.chroma_collection:
        return []
    # Embed query
    embedding = state.embedder.encode([query]).tolist()[0]
    # Query with phase filter
    results = state.chroma_collection.query(
        query_embeddings=[embedding],
        n_results=n_results,
        where={"phase": phase},
    )
    documents = results.get("documents", [[]])[0]
    return documents

# ============================================================
# HELPER: SYSTEM PROMPTS PER PHASE
# ============================================================
def get_system_prompt(phase: str) -> str:
    base = "You are RedRise, a compassionate AI companion for natural wellness and spiritual growth. "
    if phase == "herbal":
        return base + (
            "You provide evidence‑based Chinese herbal and supplement guidance. "
            "Always include a clear medical disclaimer. Remind users to consult a licensed practitioner. "
            "Never diagnose or promise a cure. Respond in a warm, professional tone. "
            "If you lack information, say so honestly."
        )
    elif phase == "pause":
        return base + (
            "You guide users through brief stillness exercises based on John Eldredge's Pause method. "
            "Lead them through breath prayers, releasing control, and body awareness. "
            "Keep responses short (under 150 words) and gentle. Invite them to sense God's presence."
        )
    elif phase == "journey":
        return base + (
            "You are a reflective guide for John Eldredge's 'Experience Jesus. Really.' journey. "
            "Pose reflective questions, never teach doctrine. Facilitate encounter with Jesus. "
            "Do not claim to be Jesus or speak for Him. Always point to Scripture and the user's own heart. "
            "Be warm, unhurried, and deeply respectful."
        )
    else:
        return base + "Respond with kindness and clarity."

# ============================================================
# HELPER: SAFETY FILTER (placeholder)
# ============================================================
def apply_safety_filter(text: str) -> str:
    """
    Placeholder for your existing lib/safety/output-filter.ts.
    Currently just checks for crisis keywords and appends a warning.
    """
    crisis_terms = ["suicide", "kill myself", "want to die", "no hope", "give up"]
    lower = text.lower()
    for term in crisis_terms:
        if term in lower:
            text += (
                "\n\n---\n"
                "**If you are having thoughts of self‑harm or suicide, please reach out immediately:**\n"
                "🇺🇸 988 Suicide & Crisis Lifeline (call or text)\n"
                "🌍 Find your local crisis number: https://findahelpline.com"
            )
            break
    return text

# ============================================================
# MAIN ENDPOINT
# ============================================================
@app.post("/api/redrise/rag", response_model=RAGResponse)
async def rag_endpoint(request: RAGRequest):
    """
    Main RAG endpoint.
    """
    # 1. Classify phase if not provided
    if request.phase:
        phase = request.phase
        confidence = 1.0
        method = "user_override"
    else:
        result = classify_phase(request.query)
        phase = result["phase"]
        confidence = result["confidence"]
        method = result["method"]
    
    # 2. If clarification needed, return prompt
    if phase == "clarify":
        clf = get_classifier()
        return RAGResponse(
            answer="",
            phase="clarify",
            confidence=confidence,
            method=method,
            clarification=clf.get_clarification_question(),
        )
    
    # 3. Retrieve context
    context = None
    sources = []
    
    # Phase 1: try Dify if available and enabled
    if phase == "herbal" and USE_DIFY_FALLBACK and DIFY_API_KEY:
        logger.info(f"Phase 1: attempting Dify retrieval for: {request.query}")
        dify_answer = await dify_retrieve(request.query)
        if dify_answer:
            # Dify returns a complete answer, not just context.
            # We still want to pass it through safety and return directly.
            final_answer = apply_safety_filter(dify_answer)
            return RAGResponse(
                answer=final_answer,
                phase=phase,
                confidence=confidence,
                method="dify_api",
                sources=["Dify Knowledge Base"],
            )
        else:
            logger.info("Dify unavailable or failed – falling back to local RAG.")
    
    # 4. Local RAG retrieval (for all phases, including herbal fallback)
    logger.info(f"Phase {phase}: retrieving from local ChromaDB.")
    chunks = local_retrieve(request.query, phase, n_results=4)
    if not chunks:
        # No chunks found – fallback to model without RAG (with a disclaimer)
        context = f"The user asked: {request.query}. I do not have specific information on this, but I can offer general guidance."
        sources = ["No specific sources found."]
    else:
        context = "\n\n---\n".join(chunks)
        # Extract source filenames from metadata if available
        # (We'll just use a generic label)
        sources = ["Local Knowledge Base"]

    # 5. Build final prompt
    system_prompt = get_system_prompt(phase)
    user_prompt = (
        f"Context from knowledge base:\n{context}\n\n"
        f"User's question: {request.query}\n\n"
        f"Based on the context above, provide a compassionate, accurate, and helpful response. "
        f"If the context does not contain enough information, say so clearly."
    )

    # 6. Call Ollama
    try:
        ollama_client = ollama.Client(host=OLLAMA_HOST)
        response = ollama_client.chat(
            model=OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            options={"temperature": 0.5, "top_p": 0.9}
        )
        raw_answer = response["message"]["content"]
    except Exception as e:
        logger.error(f"Ollama call failed: {e}")
        raise HTTPException(status_code=503, detail=f"Ollama inference error: {str(e)}")

    # 7. Safety filter
    final_answer = apply_safety_filter(raw_answer)

    # 8. Return
    return RAGResponse(
        answer=final_answer,
        phase=phase,
        confidence=confidence,
        method="local_rag",
        sources=sources,
    )

# ============================================================
# HEALTH CHECK
# ============================================================
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "model": OLLAMA_MODEL,
        "chroma_collection": COLLECTION_NAME,
        "records": state.chroma_collection.count() if state.chroma_collection else 0,
        "dify_configured": bool(DIFY_API_KEY),
    }

# ============================================================
# RUN (for development)
# ============================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
