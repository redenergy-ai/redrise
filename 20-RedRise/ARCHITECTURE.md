# RedRise Architecture

## System Overview

RedRise uses a **Hybrid RAG Architecture**:

- **Phase 1 (Herbal)**: Calls **Dify API** for fast retrieval from structured TCM/supplement databases.
- **Phase 2 & 3 (Pause & Journey)**: Routes through a **Custom Local RAG** (ChromaDB + Ollama) for high‑privacy, context‑rich spiritual guidance.

---

## Core Components

### 1. Model Layer

- **Primary LLM**: `DeepSeek-Med-8B` – a fine‑tune of DeepSeek-R1-Distill-Llama-8B, trained on 1.2M PubMed papers and 300K clinical guidelines for Chinese medical diagnosis.
- **Reasoning Ability**: Retains chain‑of‑thought (CoT) prompting capability, essential for reflective spiritual exercises.
- **Context Window**: 128K tokens, allowing long journey sessions without losing history.

### 2. Vector Database (Local)

- **Phase 1**: Dify’s managed vector index (cloud) for speed.
- **Phase 2 & 3**: **ChromaDB** running locally. We use `all-MiniLM-L6-v2` (or a local DeepSeek embedding adapter) for embedding generation.

### 3. Orchestration Layer

Leverages existing `lib/medos-orchestrator/` from the main repo but extends it with:

- `PhaseRouter`: Determines which RAG engine to call based on user intent.
- `StateManager`: Tracks which session (Herbal, Pause, Journey #) the user is in.
- `SafetyFilter`: Runs all outputs through `lib/safety/output-filter.ts` before returning to user.

### 4. Data Flow

```

User Input
│
├──> Intent Classifier
│      │
│      ├── "herbal", "supplement", "symptom" ──> Dify API (Phase 1)
│      │
│      ├── "pause", "breath", "stillness" ──> Local RAG (Phase 2)
│      │
│      └── "Jesus", "hear God", "journey" ──> Local RAG (Phase 3)
│
└──> Response Generation (DeepSeek-Med-8B)
│
└──> Safety Filter ──> Return to User

```

---

## API Integration Points

| Phase | Engine | API Endpoint (Example) |
| :--- | :--- | :--- |
| 1 | Dify | `POST /v1/chat-messages` (Managed) |
| 2 & 3 | Local | `POST /api/redrise/rag` (Custom route in Next.js) |

The custom route calls ChromaDB directly via Python microservice (FastAPI) or Node.js bindings.

---

## Security & Privacy

- **Phase 1**: Anonymized queries to Dify (no PII).
- **Phase 2 & 3**: Zero external API calls. All data stays on the local server/VPC.
- **Encryption**: At‑rest encryption for the ChromaDB persistence directory.
