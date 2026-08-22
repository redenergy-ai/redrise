#!/usr/bin/env python3
"""
RedRise Knowledge Ingestion Script

This script loads all markdown files from the knowledge/ folder,
chunks them according to phase‑specific strategies,
embeds them using a local sentence‑transformer model,
and upserts them into a ChromaDB persistent collection.

Usage:
    pip install -r requirements_ingest.txt
    python ingest_knowledge.py
"""

import os
import glob
import hashlib
from pathlib import Path
from typing import List, Dict, Any, Optional

import chromadb
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document

# ============================================================
# CONFIGURATION
# ============================================================

KNOWLEDGE_BASE_DIR = Path(__file__).parent / "knowledge"
CHROMA_PERSIST_DIR = Path(__file__).parent / "redrise_db"
COLLECTION_NAME = "redrise_knowledge"
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"  # Fast, ~80MB. Swap with "BAAI/bge-m3" if you have GPU.

# Phase-specific chunking parameters
CHUNKING_CONFIG = {
    "herbal": {
        "chunk_size": 512,
        "chunk_overlap": 50,
        "separators": ["\n\n", "\n", ". ", " ", ""]
    },
    "pause": {
        "chunk_size": 256,
        "chunk_overlap": 20,
        "separators": ["\n\n", "\n", ". ", " ", ""]
    },
    "journey": {
        "chunk_size": 1024,
        "chunk_overlap": 100,
        "separators": ["\n\n", "\n", ". ", " ", ""]
    }
}

# ============================================================
# HELPERS
# ============================================================

def detect_phase(file_path: Path) -> str:
    """Detect phase from folder name."""
    folder = file_path.parent.name
    if folder in CHUNKING_CONFIG:
        return folder
    # Fallback: if in root knowledge, default to herbal
    return "herbal"

def read_md_files(base_dir: Path) -> List[Dict[str, Any]]:
    """Recursively read all .md files and return list with metadata."""
    md_files = glob.glob(str(base_dir / "**" / "*.md"), recursive=True)
    documents = []
    for path in md_files:
        file_path = Path(path)
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        if not content.strip():
            continue
        phase = detect_phase(file_path)
        documents.append({
            "content": content,
            "source": str(file_path.relative_to(base_dir)),
            "phase": phase,
            "filename": file_path.name,
        })
    return documents

def chunk_document(doc: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Split a single document into chunks using phase-specific config."""
    phase = doc["phase"]
    config = CHUNKING_CONFIG.get(phase, CHUNKING_CONFIG["herbal"])
    
    # LangChain splitter
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=config["chunk_size"],
        chunk_overlap=config["chunk_overlap"],
        separators=config["separators"],
        length_function=len,  # Using character length; for token-aware use tiktoken
    )
    
    chunks = splitter.split_text(doc["content"])
    results = []
    for idx, chunk_text in enumerate(chunks):
        if not chunk_text.strip():
            continue
        chunk_id = hashlib.md5(f"{doc['source']}_{idx}".encode()).hexdigest()[:12]
        results.append({
            "id": chunk_id,
            "text": chunk_text,
            "metadata": {
                "source": doc["source"],
                "phase": phase,
                "chunk_index": idx,
                "filename": doc["filename"],
            }
        })
    return results

# ============================================================
# MAIN INGESTION
# ============================================================

def main():
    print("🔍 Loading embedding model...")
    embedder = SentenceTransformer(EMBEDDING_MODEL_NAME)
    
    print("📂 Reading knowledge files...")
    docs = read_md_files(KNOWLEDGE_BASE_DIR)
    if not docs:
        print("⚠️  No .md files found in knowledge/ folder. Exiting.")
        return
    
    print(f"✅ Found {len(docs)} documents.")
    
    all_chunks = []
    for doc in docs:
        chunks = chunk_document(doc)
        all_chunks.extend(chunks)
    
    print(f"✂️  Created {len(all_chunks)} chunks total.")
    if not all_chunks:
        print("⚠️  No chunks created. Exiting.")
        return
    
    # Prepare embeddings
    print("🧠 Generating embeddings... (this may take a moment)")
    texts = [c["text"] for c in all_chunks]
    embeddings = embedder.encode(texts, show_progress_bar=True).tolist()
    
    # Initialize ChromaDB
    print(f"💾 Initializing ChromaDB at {CHROMA_PERSIST_DIR}...")
    os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
    client = chromadb.PersistentClient(path=str(CHROMA_PERSIST_DIR))
    
    # Delete existing collection to start fresh (remove if you want incremental)
    try:
        client.delete_collection(COLLECTION_NAME)
        print(f"🔄 Removed existing collection '{COLLECTION_NAME}'")
    except:
        pass
    
    collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )
    
    # Add chunks to collection
    print(f"📤 Upserting {len(all_chunks)} chunks into ChromaDB...")
    collection.add(
        documents=[c["text"] for c in all_chunks],
        embeddings=embeddings,
        metadatas=[c["metadata"] for c in all_chunks],
        ids=[c["id"] for c in all_chunks],
    )
    
    print("✅ Ingestion complete!")
    print(f"📊 Collection '{COLLECTION_NAME}' now has {collection.count()} records.")
    print(f"📁 Persisted at: {CHROMA_PERSIST_DIR}")

if __name__ == "__main__":
    main()
