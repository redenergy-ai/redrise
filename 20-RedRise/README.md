# RedRise 🌿✝️

**A 3‑Phase Soul Care Companion**

RedRise is a specialized AI‑powered module built on the MedOS ecosystem. It guides users through three integrated phases:

1. **Herbal Regimen** – Chinese herbal diagnosis and natural supplementation guidance, powered by a locally‑hosted DeepSeek‑Med‑8B model with a RAG knowledge base of peer‑reviewed studies and TCM (Traditional Chinese Medicine) literature.

2. **The Pause** – Structured stillness exercises inspired by John Eldredge’s *One Minute Pause*, helping users release anxiety and center their minds.

3. **Guided Journey** – A transformative, multi‑session path to hearing the voice of Jesus, based on Eldredge’s *Experience Jesus. Really.* program.

---

## Why RedRise?

- **Natural First**: Provides evidence‑based herbal alternatives before pharmaceutical interventions (SSRIs/SNRIs), with clear medical disclaimers.
- **Soul Depth**: Goes beyond symptom management to address spiritual root causes of anxiety.
- **Privacy First**: 100% local hosting option. Your data stays on your machine.

---

## Repository Structure

```

20-RedRise/
├── README.md                # You are here
├── ARCHITECTURE.md          # System design, RAG pipeline, API decisions
├── JOURNEY_PHASES.md        # Detailed breakdown of all 3 phases
├── MODEL_SELECTION.md       # Why DeepSeek‑Med‑8B over other models
├── DATA_PIPELINE.md         # Knowledge curation, chunking, embedding strategies
├── ETHICS_AND_SAFETY.md     # Disclaimers, guardrails, crisis resources
└── LOCAL_SETUP.md           # Step‑by‑step installation (Ollama + ChromaDB)

```

---

## Quick Start (MVP)

1. Clone this repository.
2. Navigate to `20-RedRise/` and review `LOCAL_SETUP.md`.
3. Install [Ollama](https://ollama.com) and pull the Med‑8B model:
   ```bash
   ollama run deepseek-med-8b
```

4. Install Python dependencies:
   ```bash
   pip install chromadb sentence-transformers
   ```
5. Seed your knowledge base using the scripts defined in DATA_PIPELINE.md.
6. Run the hybrid orchestrator (integrating with your existing web/ API routes).

---

License & Disclaimers

This module is for educational and complementary support only. It does not replace medical diagnosis, professional psychiatric care, or pastoral counseling. See ETHICS_AND_SAFETY.md for full details.
