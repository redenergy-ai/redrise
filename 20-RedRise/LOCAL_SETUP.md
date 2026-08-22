# RedRise Local Setup

## 1. Goal

RedRise is designed so that the complete stack can be hosted locally using free and open-source infrastructure. The default deployment should not require a paid database, paid vector store, or mandatory cloud LLM API.

The recommended local stack is:

```text
RedRise application
Dify (Phase 1 orchestration / RAG)
Ollama (local model inference)
ChromaDB (Phase 2 / 3 vector database)
PostgreSQL or SQLite (application data)
Optional MinIO (object storage)
```

## 2. Deployment profiles

### Lightweight single-user profile

Use:

```text
RedRise app
Ollama
ChromaDB
SQLite
Dify, locally hosted or on the same private machine/network
local filesystem
```

This profile minimizes operational complexity and is suitable for development, a private workstation, or a single-user appliance.

### Multi-user local server profile

Use:

```text
RedRise app
Dify
Ollama or a dedicated inference server
ChromaDB
PostgreSQL
optional MinIO
reverse proxy
```

This profile is more appropriate for concurrent users and centralized administration.

## 3. Hardware guidance

Exact requirements depend on quantization and context length, but an 8B model is intentionally chosen to make local inference practical.

A reasonable development target is:

- 16 GB system RAM minimum for lightweight experimentation;
- 32 GB RAM preferred when several services run together;
- a modern GPU with sufficient VRAM improves inference substantially;
- CPU-only inference remains possible with quantized models but will be slower;
- SSD storage is strongly preferred for model and vector-index loading.

Do not treat these values as guaranteed performance specifications. Benchmark the exact model, quantization, context window, and runtime on the target machine.

## 4. Software prerequisites

Recommended:

- Git;
- Docker Engine + Docker Compose, or Podman equivalents;
- Ollama;
- Node.js if the RedRise frontend/backend runs directly outside containers;
- Python where ingestion or utility scripts require it.

For the smallest development setup, some services can run natively while others run in containers.

## 5. Directory layout

A deployment-oriented local layout can be kept outside the Git repository:

```text
redrise-runtime/
├── config/
├── data/
│   ├── chroma/
│   ├── postgres/
│   ├── sqlite/
│   ├── dify/
│   └── objects/
├── models/
├── backups/
└── logs/
```

Keeping runtime data outside the source tree reduces the risk of accidentally committing sensitive information.

## 6. Ollama setup

Install Ollama using the supported method for the local operating system, then configure the chosen model.

Conceptually:

```bash
ollama pull <deepseek-8b-model>
ollama pull <embedding-model>
```

The exact deployed model name should be controlled by configuration because the production model may be a validated `DeepSeek-R1-Distill-Llama-8B`, `DeepSeek-Med-8B`, or a locally packaged equivalent.

Verify that the Ollama service is reachable only from intended hosts. A local-only deployment should not expose the inference endpoint directly to the public internet.

## 7. Phase 1 Dify setup

Dify is the Phase 1 orchestration and RAG layer.

A local Dify installation should be configured with:

- a model provider pointing to the local DeepSeek inference endpoint;
- a Phase 1 workflow;
- one or more curated Phase 1 knowledge bases;
- environment secrets stored outside source control;
- a private API key used by the RedRise application.

The RedRise application should call Dify rather than embedding Phase 1 model prompts directly into client code.

A Phase 1 environment might use:

```text
DIFY_BASE_URL=http://dify:port
DIFY_API_KEY=...
PHASE1_WORKFLOW_ID=...
PHASE1_MODEL=deepseek-med-8b
```

The names are illustrative. The implementation may use different configuration keys.

## 8. ChromaDB setup

ChromaDB is used for Phase 2 and Phase 3 local retrieval.

Run it locally or as a container with persistent storage.

Suggested collections:

```text
redrise_pause
redrise_scripture
redrise_commentary
redrise_journey_prompts
```

Do not use one collection for every phase.

A typical environment configuration:

```text
CHROMA_HOST=chromadb
CHROMA_PORT=8000
CHROMA_PERSIST_DIR=/data/chroma
```

## 9. Relational database setup

### Option A — SQLite

SQLite is free, embedded, simple, and appropriate for single-user or small local deployments.

Example:

```text
DATABASE_URL=file:/data/sqlite/redrise.db
```

Benefits:

- no database server;
- simple backup;
- minimal memory footprint;
- easy local development.

Limitations:

- weaker fit for high concurrency;
- fewer operational controls than PostgreSQL;
- horizontal scaling is not its purpose.

### Option B — PostgreSQL

PostgreSQL is free and open source and should be the default for a multi-user server.

Example:

```text
DATABASE_URL=postgresql://redrise:<password>@postgres:5432/redrise
```

Benefits:

- strong concurrency;
- mature backup tooling;
- transactions;
- robust indexing;
- user/role controls;
- good long-term migration path.

## 10. Optional MinIO

If RedRise needs object storage, MinIO can provide an S3-compatible local service.

Potential uses:

- user-generated exports;
- corpus archives;
- source snapshots;
- backup objects.

For a simple installation, the local filesystem is sufficient and avoids another service.

## 11. Environment variables

Do not commit secrets.

A local `.env` template may include:

```text
APP_ENV=development
APP_BASE_URL=http://localhost:3000

DATABASE_URL=...

DIFY_BASE_URL=...
DIFY_API_KEY=...
PHASE1_WORKFLOW_ID=...

OLLAMA_BASE_URL=http://ollama:11434
PHASE1_MODEL=...
PHASE2_MODEL=...
PHASE3_MODEL=...
EMBEDDING_MODEL=...

CHROMA_HOST=chromadb
CHROMA_PORT=8000

DATA_DIR=/data
LOG_LEVEL=info
```

Sensitive user content should not be placed in environment variables.

## 12. Container topology

A conceptual Docker Compose layout:

```yaml
services:
  redrise:
    # application

  ollama:
    # local inference

  chromadb:
    # local Phase 2/3 vector retrieval

  postgres:
    # optional; replace with SQLite for lightweight profile

  # Dify typically has its own supporting services and deployment stack.
  # Run it privately and expose only the required API endpoint to RedRise.
```

The exact Dify Compose stack should follow the version of Dify being deployed. RedRise should not duplicate Dify's internal service definitions unless it intentionally vendors and maintains them.

## 13. Initial corpus loading

### Phase 1

1. Review licensing and source quality.
2. Normalize and version documents.
3. Load approved sources into Dify knowledge bases.
4. Validate retrieval on known queries.
5. Verify that source metadata is returned to the workflow.

### Phase 2 and 3

1. Prepare approved local corpus files.
2. Chunk content while preserving source metadata.
3. Generate embeddings locally.
4. Load into separate ChromaDB collections.
5. Run retrieval tests.
6. Record corpus and embedding-model versions.

## 14. Local development startup order

A practical startup order is:

```text
1. database
2. ChromaDB
3. Ollama / model runtime
4. Dify and Phase 1 workflow dependencies
5. RedRise application
```

Then run health checks before enabling user sessions.

## 15. Health checks

RedRise should expose or internally perform health checks for:

```text
relational database
ChromaDB
Ollama
required local models
Dify API
Phase 1 workflow
embedding model
filesystem/object storage
```

A dependency being reachable is not enough. For the model layer, run a small inference check; for ChromaDB, perform a test read; for Dify, verify the actual workflow endpoint.

## 16. Network security

For a local deployment:

- bind databases to the private network only;
- do not expose ChromaDB directly to the public internet;
- do not expose Ollama directly to the public internet;
- terminate TLS at a reverse proxy if accessed over a network;
- firewall administrative interfaces;
- use strong credentials for Dify and PostgreSQL;
- isolate backup destinations.

## 17. Backups

### SQLite

Back up the database using a safe SQLite backup operation or application shutdown snapshot rather than blindly copying an actively written database.

### PostgreSQL

Use `pg_dump` for logical backups.

### ChromaDB

Back up the persistent ChromaDB directory together with metadata describing the embedding model and corpus version.

### Dify

Back up Dify according to its deployed architecture, including knowledge-base data and workflow configuration.

### Encryption

Backups containing health or journal data should be encrypted and access-controlled.

## 18. Offline capability

Phases 2 and 3 are intentionally suitable for offline operation when:

- Ollama models are already downloaded;
- ChromaDB is local;
- source corpora are local;
- authentication does not depend on an unavailable external service.

Phase 1 can also be offline if Dify and the model endpoint are hosted locally.

## 19. Update strategy

Treat models, prompts, workflows, and corpora as versioned deployable artifacts.

Before upgrading:

```text
1. create backup
2. record current model/corpus/workflow versions
3. deploy candidate version
4. run RedRise evaluation suite
5. verify safety gates
6. promote only if tests pass
7. retain rollback target
```

## 20. Cost strategy

The base local stack can be operated without recurring database or vector-store fees:

- SQLite: free;
- PostgreSQL: free;
- ChromaDB: free/open source;
- Ollama: free local runtime;
- local filesystem: free;
- MinIO: open-source option where appropriate;
- Dify: self-hostable open-source workflow layer, subject to the applicable project license and deployment requirements.

Hardware, electricity, domain names, backups, and optional cloud infrastructure may still create real costs.

## 21. Production readiness checklist

Before treating a local deployment as production-ready, verify:

- all secrets are externalized;
- databases are persistent and backed up;
- the Phase 1 model has passed the RedRise safety benchmark;
- Dify knowledge bases contain only approved sources;
- Phase 2/3 ChromaDB collections are isolated;
- retrieval provenance works;
- emergency handling works;
- spiritual-authority guardrails work;
- TLS and authentication are enabled where needed;
- logs do not leak sensitive content;
- restore from backup has been tested.

## 22. Local-first principle

The default RedRise deployment should make privacy the easy option.

A user should be able to run the core journey without sending journals, spiritual reflections, or health history to a third-party model provider. External integrations may be added later, but they should be explicit, optional, and transparent.