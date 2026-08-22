# RedRise

RedRise is a privacy-conscious, locally hostable guided journey that combines a structured health-oriented intake with a deliberately separate Christian reflection experience. The system is designed as three explicit phases so that medical-style reasoning, contemplative transition, and spiritual guidance are never blurred into one undifferentiated chatbot experience.

> **Safety notice**
>
> RedRise is not a medical service and does not provide a clinical diagnosis, emergency triage replacement, prescription, or individualized treatment plan. Phase 1 may use traditional Chinese medicine (TCM) concepts as an educational pattern-assessment framework, but all such outputs must be framed as informational hypotheses rather than medical diagnoses. Users with urgent or severe symptoms must be directed to appropriate local emergency or professional care.

## The three-phase journey

### Phase 1 — Chinese herbal diagnosis / TCM pattern assessment

Phase 1 is the health-oriented reasoning stage. It gathers user-provided symptoms, relevant history, lifestyle context, and optional structured observations. The system then produces a cautious TCM-style pattern assessment using a DeepSeek 8B reasoning model.

The intended model family is:

- `DeepSeek-R1-Distill-Llama-8B` as the general reasoning baseline.
- `DeepSeek-Med-8B` where a medically adapted variant is available, validated, and appropriate for deployment.

The phase must first screen for safety-critical symptoms before attempting pattern analysis. It must distinguish conventional medical facts from TCM terminology, avoid definitive disease claims, avoid unsupervised prescribing, and provide a clear statement that the result is educational and should be discussed with a qualified healthcare or TCM practitioner where appropriate.

Phase 1 uses **Dify as the orchestration and RAG API layer**. Dify provides workflow management, retrieval, prompt templates, model routing, traceability, and a stable API boundary between the RedRise application and the reasoning model.

### Phase 2 — The Pause

Phase 2 intentionally changes pace. It is inspired by the contemplative practice associated with John Eldredge: stop, become present, release hurry, and create room for reflection before moving deeper into the journey.

The goal is not to maximize information output. The goal is to create a clear boundary between health-oriented assessment and spiritual reflection.

Typical Phase 2 interactions may include:

- a brief guided pause;
- optional breathing or stillness prompts;
- short journaling questions;
- reflection on what the user is carrying emotionally;
- a deliberate confirmation before entering Phase 3.

Phase 2 uses a **custom local RAG stack** built around Ollama and ChromaDB. This keeps private reflections local by default and allows RedRise to control the exact corpus used for retrieval.

### Phase 3 — Guided Journey: “Experience Jesus. Really.”

Phase 3 is a guided Christian reflection experience centered on Scripture, prayer, discernment, honesty, and practical response. Its purpose is not to simulate divine authority but to help the user engage thoughtfully with Christian material and personal reflection.

The system must clearly distinguish among:

- Scripture quotations and references;
- sourced teaching or commentary;
- model-generated reflection;
- the user's own journaled thoughts.

The model must never claim that God has definitively told the user something, predict the future as prophecy, or present generated text as divine revelation. It may surface relevant passages, summarize curated teaching, ask reflective questions, and help users formulate prayers or journal entries.

Phase 3 also uses the **custom local RAG stack** with Ollama and ChromaDB so that the spiritual corpus remains auditable, versioned, and locally controlled.

## Architecture at a glance

```text
Client / UI
   |
   +--> Journey Orchestrator
           |
           +--> Phase 1: Dify API
           |       +--> DeepSeek-R1-Distill-Llama-8B / DeepSeek-Med-8B
           |       +--> Phase 1 medical / TCM knowledge base
           |
           +--> Phase 2: Local RAG
           |       +--> Ollama
           |       +--> ChromaDB
           |       +--> Pause / reflection corpus
           |
           +--> Phase 3: Local RAG
                   +--> Ollama
                   +--> ChromaDB
                   +--> Scripture / curated spiritual corpus

Local persistence
   +--> PostgreSQL or SQLite
   +--> ChromaDB
   +--> local filesystem or S3-compatible object storage when needed
```

## Core design principles

### Separation of domains

Medical-style reasoning and spiritual guidance must be separated in both UX and system architecture. Phase transitions should be explicit and auditable.

### Local-first privacy

Private journal entries, health history, and spiritual reflections should remain on infrastructure controlled by the operator wherever practical. External services should receive only the minimum information required for a specific function.

### Retrieval before generation

Claims that depend on domain knowledge should be grounded in a curated corpus whenever possible. Retrieval sources should be versioned and traceable.

### Human-readable uncertainty

Outputs should state uncertainty directly. The model should distinguish between evidence, interpretation, possibility, and opinion.

### No hidden spiritual authority

RedRise may facilitate Christian reflection but must never portray generated content as the voice of God, revelation, prophecy, or infallible spiritual direction.

### Safety before engagement

A high-quality user experience must never override red-flag medical checks, crisis handling, privacy controls, or refusal rules.

## Repository documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — end-to-end system architecture.
- [JOURNEY_PHASES.md](./JOURNEY_PHASES.md) — detailed behavior and transitions for the three phases.
- [MODEL_SELECTION.md](./MODEL_SELECTION.md) — model rationale and deployment strategy.
- [DATA_PIPELINE.md](./DATA_PIPELINE.md) — ingestion, retrieval, storage, and provenance.
- [ETHICS_AND_SAFETY.md](./ETHICS_AND_SAFETY.md) — disclaimers, guardrails, and governance.
- [LOCAL_SETUP.md](./LOCAL_SETUP.md) — local deployment blueprint using free/open-source infrastructure.

## Status

This directory defines the initial technical and product foundation for RedRise. It is intentionally documentation-first so implementation can proceed against explicit architectural, safety, and journey contracts rather than ad hoc prompts.