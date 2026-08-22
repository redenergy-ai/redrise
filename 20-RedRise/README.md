# RedRise – Complete Technical Guide

**RedRise** is a 3‑phase soul‑care companion integrated into the MedOS ecosystem. It guides users through:

1. **Herbal Regimen** – Chinese herbal diagnosis and natural supplementation (Phase 1)
2. **The Pause** – Stillness and breath exercises inspired by John Eldredge (Phase 2)
3. **Guided Journey** – An 8‑session reflective path to encounter Jesus (Phase 3)

This document is the **master reference** for developers, testers, and Work agents. It covers architecture, file layout, setup, automated commands, API contracts, and testing procedures.

---

## Architecture Overview

```

┌─────────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend (web/)                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  HeroInput.tsx (RedRise toggle + clarification state)      │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  /api/redrise/route.ts  (API proxy)                        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              │                                    │
└──────────────────────────────┼────────────────────────────────────┘
│ HTTP (port 8000)
▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FastAPI Microservice (api_server.py)            │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐ │
│  │ PhaseClassifier│  │  Local RAG    │  │  Ollama Client        │ │
│  │ (phase_classify│  │ (ChromaDB)    │  │ (deepseek-med-8b)     │ │
│  │  er.py)        │  │               │  │                       │ │
│  └───────────────┘  └───────────────┘  └───────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ChromaDB (persistent vector store)              │
│  Collection: "redrise_knowledge"                                   │
│  ├── herbal/  (TCM monographs, supplements, safety)               │
│  ├── pause/   (Eldredge-inspired stillness practices)             │
│  └── journey/ (8‑session reflective guide)                        │
└─────────────────────────────────────────────────────────────────────┘

```

---

## Repository Files (20-RedRise/)

| File / Folder | Purpose |
| :--- | :--- |
| `Dockerfile` | Containerises the FastAPI microservice. |
| `docker-compose.yml` | Orchestrates Ollama + FastAPI together. |
| `Makefile` | Provides automated commands (setup, ingest, up, etc.). |
| `Modelfile` | Defines how to build `deepseek-med-8b:q4_K_M` from Hugging Face GGUF. |
| `phase_classifier.py` | Hybrid rule‑based + semantic intent router. |
| `api_server.py` | FastAPI app exposing `/api/redrise/rag` and `/health`. |
| `ingest_knowledge.py` | Chunks, embeds, and stores knowledge files into ChromaDB. |
| `requirements_ingest.txt` | Python dependencies for both ingestion and API. |
| `.env.example` | Template for environment variables. |
| `knowledge/herbal/` | Real TCM content (5 .md files). |
| `knowledge/pause/` | Eldredge‑inspired stillness exercises. |
| `knowledge/journey/` | 8‑session reflective journey. |
| `scripts/setup_model.sh` | Helper script (used by Makefile) to create the Ollama model. |
| `REPO_VISIBILITY_REMINDER.md` | Flag to privatise the fork later. |

---

## Automated Setup (One‑Command Workflow)

When your local environment is ready, run:

```bash
cd 20-RedRise

# Step 1: Build the Ollama model (downloads ~4.7GB, takes 10‑30 min)
make create-model

# Step 2: Ingest all knowledge into ChromaDB
make ingest

# Step 3: Start the full stack (Ollama + FastAPI)
make up
```

What each make target does

Target Description
make create-model Starts Ollama, copies Modelfile, and builds deepseek-med-8b:q4_K_M.
make ingest Runs ingest_knowledge.py to embed all knowledge into ChromaDB.
make up Starts both services (Ollama on 11434, FastAPI on 8000).
make down Stops all containers.
make logs Tails container logs.
make health Checks FastAPI health (returns model, ChromaDB record count).
make clean Stops containers and removes volumes (clears the database).

---

API Contract

Endpoint: POST /api/redrise/rag

Request body:

```json
{
  "query": "string (required)",
  "phase": "herbal | pause | journey (optional, auto‑detected if omitted)"
}
```

Response (success):

```json
{
  "answer": "string",
  "phase": "herbal | pause | journey | clarify",
  "confidence": 0.95,
  "sources": ["herbal_monographs.md"],
  "clarification": "string (only if phase == 'clarify')"
}
```

Response (error / fallback):

```json
{
  "answer": "string (graceful fallback message)",
  "phase": "error",
  "confidence": 0
}
```

Health Check: GET /health

Response:

```json
{
  "status": "ok",
  "model": "deepseek-med-8b:q4_K_M",
  "chroma_collection": "redrise_knowledge",
  "records": 42,
  "dify_configured": false
}
```

---

Frontend Integration (Already Merged)

· Toggle: HeroInput.tsx now has a Sparkles button that switches between normal MedOS mode and RedRise mode.
· Clarification State: When the classifier returns "clarify", the frontend:
  · Displays the clarification question.
  · Captures the user's numeric reply (1, 2, or 3).
  · Resends the original query with the selected phase.
· API Proxy: web/app/api/redrise/route.ts forwards requests to the FastAPI service.

---

Testing Checklist (For Work to Run)

1. Start the full stack:
   ```bash
   cd 20-RedRise && make up
   ```
2. Verify the health endpoint:
   ```bash
   curl http://localhost:8000/health
   ```
3. Test a direct API call:
   ```bash
   curl -X POST http://localhost:8000/api/redrise/rag \
     -H "Content-Type: application/json" \
     -d '{"query": "What herb helps with palpitations and insomnia?"}'
   ```
   Expected: A response with phase: "herbal" and an answer containing Suan Zao Ren or similar.
4. Test the clarification flow (via curl):
   ```bash
   curl -X POST http://localhost:8000/api/redrise/rag \
     -H "Content-Type: application/json" \
     -d '{"query": "I need help"}'
   ```
   Expected: phase: "clarify" and clarification containing "Reply 1, 2, or 3...".
5. Test the frontend toggle:
   · Open the Next.js app.
   · Click the Sparkles button.
   · Type a query (e.g., "I can't sleep").
   · Verify that the response comes from RedRise (and shows herbal/pause/journey content).
6. Test the Pause knowledge:
   · In RedRise mode, type "Help me pause".
   · Expected: A breath prayer or stillness exercise from eldredge_pause_excerpts.md.
7. Test the Journey knowledge:
   · Type "Session 1 of the journey".
   · Expected: Reflective questions from eldredge_journey_sessions.md.
8. Test the clarification state machine (frontend):
   · In RedRise mode, type "I need help".
   · The bot should ask: "Reply 1, 2, or 3...".
   · Type 1 – should route to Herbal phase.
   · Type 2 – should route to Pause phase.
   · Type 3 – should route to Journey phase.

---

Troubleshooting Guide

Issue Likely Cause Fix
make create-model fails with "no such file" Modelfile not found or ollama not ready Ensure Modelfile exists in 20-RedRise/. Run docker compose logs ollama to check.
Model download hangs / times out Slow internet or Hugging Face rate‑limit Run manually with docker compose exec ollama ollama create ... and wait.
make ingest fails with "Collection not found" ChromaDB not initialised Run make ingest again – it creates the collection on first run.
make up starts but /health returns 503 Ollama not ready or model not loaded Wait 1‑2 minutes, then run make health again. Check logs with make logs.
Frontend says "RedRise service unavailable" FastAPI not running on port 8000 Ensure make up succeeded. Check docker compose ps.
Clarification state doesn't capture user reply HeroInput.tsx not updated correctly Verify the file contains pendingClarification and pendingRedRiseQuery states.
CORS error in browser FastAPI CORS settings api_server.py allows all origins for development – tighten in production.

---

Next Steps (When Work Gets Credits)

1. Run the full test suite (checklist above).
2. Add real user authentication if needed (integrate with existing MedOS auth).
3. Deploy using your existing GitHub Actions workflow (the Dockerfile is ready).
4. Enable Dify fallback (set REDRISE_USE_DIFY_FALLBACK=true in .env and add your API key).
5. Seed more content – add more TCM herbs, expand the journey sessions, or integrate the ESV Bible as a separate RAG source.

---

Version & Commit History

Date Commit Description
2026-08-22 fa251fd Added automated Makefile with create-model target.
2026-08-22 7baf87e Created scripts/setup_model.sh helper.
2026-08-22 5c32b67 Added Modelfile for DeepSeek-Med-8B (Q4_K_M).
2026-08-22 0a437df Added ingestion pipeline and placeholder knowledge.
2026-08-22 ... Initial documentation, classifier, API server, frontend merge.

---

Contact / Owner

RedRise is maintained by @redenergy-ai/team. For questions or issues, refer to this README first, then open an issue in the repository.

---

End of README.
