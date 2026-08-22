# RedRise Architecture

## 1. Purpose

RedRise is implemented as a three-phase journey with strict domain separation. The architecture intentionally uses different orchestration and retrieval paths for the health-oriented first phase and the contemplative/spiritual second and third phases.

The primary goals are:

- preserve a clear boundary between medical-style reasoning and spiritual reflection;
- support local-first deployment and data ownership;
- ground model responses in curated knowledge rather than unconstrained generation;
- make safety checks deterministic where possible;
- keep model providers replaceable;
- maintain auditable phase transitions and retrieval provenance.

## 2. High-level architecture

```text
+-------------------------+
|      RedRise Client     |
| Web / Mobile / Desktop  |
+------------+------------+
             |
             v
+-------------------------+
|   Journey Orchestrator  |
| - session state         |
| - phase state           |
| - consent / disclaimers |
| - safety routing        |
+---+-----------------+---+
    |                 |
    | Phase 1         | Phase 2 / 3
    v                 v
+-----------+      +------------------+
| Dify API  |      | Custom Local RAG |
+-----+-----+      +---------+--------+
      |                      |
      |                      +--> ChromaDB
      |                      +--> Ollama
      |                      +--> local corpora
      |
      +--> DeepSeek reasoning model
      +--> Phase 1 knowledge base

Shared services:
- PostgreSQL or SQLite
- local filesystem / object storage
- audit log
- configuration / secrets
- observability
```

## 3. Journey Orchestrator

The Journey Orchestrator is the application-level control plane. It should not be responsible for deep model inference itself. Instead, it decides which phase is active, which retrieval path is allowed, what data may cross a boundary, and which safety rules must run.

A minimal phase state model:

```text
UNSTARTED
  -> PHASE_1_CONSENT
  -> PHASE_1_INTAKE
  -> PHASE_1_ASSESSMENT
  -> PHASE_1_COMPLETE
  -> PHASE_2_PAUSE
  -> PHASE_2_COMPLETE
  -> PHASE_3_GUIDED_JOURNEY
  -> COMPLETE
```

Transitions should be explicit. The application should never silently move from Phase 1 medical-style content into Phase 3 spiritual content.

The orchestrator should persist:

- session identifier;
- current phase;
- user consent state;
- disclaimer acknowledgements;
- safety flags;
- retrieval provenance references;
- optional journal links;
- timestamps for phase transitions.

## 4. Phase 1 architecture — Dify + DeepSeek

Phase 1 uses Dify as the workflow and RAG API layer.

### Responsibilities of Dify

Dify should handle:

- intake workflow orchestration;
- prompt templates;
- model endpoint configuration;
- retrieval over a curated Phase 1 corpus;
- structured output formatting;
- request tracing;
- optional tool calls;
- controlled retries and fallbacks.

### Model layer

The preferred model family is:

- `DeepSeek-R1-Distill-Llama-8B` for general reasoning;
- `DeepSeek-Med-8B` where a medically adapted 8B model has been validated for the intended tasks.

The model endpoint should be abstracted. Dify may point to a local inference server such as Ollama, vLLM, llama.cpp-compatible HTTP serving, or another OpenAI-compatible local endpoint.

### Phase 1 retrieval corpus

The corpus should be curated and versioned. It may contain:

- TCM diagnostic-pattern references;
- herb safety references;
- contraindication references;
- conventional red-flag symptom guidance;
- terminology mappings;
- evidence-quality annotations.

The retrieval layer must not treat all sources as equally authoritative. Each document should include source metadata and a trust tier.

## 5. Phase 2 and 3 architecture — custom local RAG

Phases 2 and 3 use a locally controlled retrieval system rather than the Phase 1 Dify knowledge path.

### Core components

**Ollama** provides local model inference and embedding support where suitable.

**ChromaDB** stores vector embeddings and document metadata.

**Local RAG service** performs:

1. query normalization;
2. metadata filtering by phase and corpus;
3. semantic retrieval;
4. optional keyword retrieval;
5. ranking / fusion;
6. context assembly;
7. prompt construction;
8. generation;
9. citation/provenance attachment.

### Corpus separation

At minimum, use separate collections:

```text
redrise_pause
redrise_scripture
redrise_spiritual_commentary
redrise_journey_prompts
```

Do not mix medical material from Phase 1 into Phase 2 or 3 unless an explicit, justified feature requires it. Even then, the transition must be visible to the user.

## 6. Storage architecture

RedRise can be hosted entirely with free/open-source storage components.

### Relational data

Use either:

- **SQLite** for single-user, local, prototype, or small appliance deployment;
- **PostgreSQL** for multi-user or server deployment.

Suggested relational entities:

```text
users
sessions
journey_state
consents
phase_events
safety_events
journal_entries
retrieval_events
source_documents
source_versions
settings
```

### Vector data

Use ChromaDB for local embeddings and retrieval metadata.

### Files

Use the local filesystem initially. If object storage becomes necessary, use an S3-compatible open-source option such as MinIO.

### Secrets

Secrets must never be stored in the vector database or committed to source control. Use environment variables, encrypted secret files, or an OS/container secret mechanism.

## 7. Request flows

### Phase 1 request flow

```text
User input
 -> Journey Orchestrator
 -> deterministic red-flag pre-check
 -> Dify workflow
 -> Phase 1 RAG retrieval
 -> DeepSeek model
 -> structured safety post-check
 -> response with disclaimer + provenance
```

### Phase 2 request flow

```text
User enters Pause
 -> Journey Orchestrator verifies explicit phase transition
 -> minimal context selected
 -> local retrieval from pause corpus
 -> local model generation
 -> short reflective response
```

### Phase 3 request flow

```text
User prompt
 -> journey state + user-approved context
 -> retrieval from Scripture / curated commentary
 -> source ranking
 -> local model generation
 -> attribution check
 -> spiritual-authority guardrail
 -> response with clear source/generated distinctions
```

## 8. Safety architecture

Safety should be layered rather than delegated entirely to the LLM.

### Pre-generation controls

- red-flag keyword and symptom rules;
- emergency routing;
- phase-specific allowed actions;
- consent checks;
- data minimization;
- prompt-injection filtering for retrieved documents.

### Generation controls

- phase-specific system prompts;
- structured output requirements;
- temperature limits for safety-sensitive tasks;
- constrained retrieval collections;
- explicit uncertainty requirements.

### Post-generation controls

- medical diagnosis language detector;
- medication/herbal prescription detector;
- emergency-advice validator;
- spiritual-authority detector;
- unsupported certainty detector;
- source-attribution validator.

## 9. Privacy boundaries

RedRise should implement a local-first policy:

- journal entries stay local by default;
- Phase 2/3 prompts should remain local when local inference is enabled;
- only minimum necessary Phase 1 data should be sent to Dify;
- no health or spiritual data should be used for training without explicit, separate consent;
- logs should avoid raw sensitive content unless debugging has been explicitly enabled.

## 10. Observability

Log events, not unnecessary personal content.

Recommended metrics:

- phase transitions;
- model latency;
- retrieval latency;
- number of retrieved chunks;
- safety-rule activations;
- model fallback frequency;
- failed Dify calls;
- ChromaDB errors;
- token/context usage;
- user-abandoned transitions.

Every retrieval response should ideally record document IDs and versions used to produce the answer.

## 11. Failure handling

### Dify unavailable

Phase 1 should fail closed for substantive assessment. The application may save the intake locally and explain that the assessment service is unavailable, but it should not silently substitute a less-tested model path.

### ChromaDB unavailable

Phase 2/3 can provide a minimal non-RAG fallback only if the experience clearly labels that sourced retrieval is unavailable. For Scripture-specific claims, prefer disabling source-dependent features over hallucinating citations.

### Model unavailable

The application should return a controlled service message, preserve the user's state, and allow retry. It should not downgrade to an unknown cloud provider without explicit configuration and privacy disclosure.

## 12. Deployment topology

A single-machine deployment can run:

```text
Docker Compose / Podman Compose
  redrise-app
  dify components (or remote private Dify)
  ollama
  chromadb
  postgres
  optional minio
```

For a lightweight local installation, SQLite can replace PostgreSQL and local files can replace object storage.

## 13. Architectural rule

The most important architectural constraint is simple:

**Phase 1, Phase 2, and Phase 3 are different trust domains.**

They may share user-controlled session state, but they must not share prompts, corpora, claims, or authority implicitly. Every cross-phase transfer must be deliberate, minimal, and explainable.