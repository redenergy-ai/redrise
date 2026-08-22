# RedRise Data Pipeline

## 1. Scope

RedRise uses two retrieval architectures because the three phases have different trust boundaries and privacy requirements:

- **Phase 1:** Dify API + curated health/TCM corpus + DeepSeek reasoning model.
- **Phase 2 and Phase 3:** custom local RAG using ChromaDB + Ollama + phase-specific corpora.

The data pipeline must preserve source provenance, prevent cross-phase leakage, minimize sensitive-data retention, and make every knowledge-base revision reproducible.

## 2. Data classes

RedRise data should be classified before storage or retrieval.

### Class A — Public or licensed source material

Examples:

- public-domain or appropriately licensed medical/TCM references;
- public-domain Scripture translations or licensed biblical text;
- RedRise-authored journey material;
- licensed commentary.

### Class B — Operational metadata

Examples:

- session IDs;
- timestamps;
- phase state;
- model revision;
- retrieval document IDs;
- safety event codes.

### Class C — Sensitive user content

Examples:

- symptoms;
- medical history;
- medications;
- journal entries;
- spiritual reflections;
- personal prayer content.

Class C data receives the strongest controls and must never be added to the shared retrieval corpus automatically.

## 3. Source ingestion pipeline

The ingestion pipeline should be reproducible and versioned.

```text
Source discovery
  -> rights / license check
  -> source trust classification
  -> document normalization
  -> chunking
  -> metadata enrichment
  -> quality validation
  -> embedding
  -> index publication
```

Every indexed document should include metadata such as:

```json
{
  "document_id": "stable-id",
  "title": "Source title",
  "source_uri": "source or internal reference",
  "publisher": "publisher",
  "license": "license identifier",
  "trust_tier": "tier-1",
  "phase": "phase-1",
  "corpus": "tcm-safety",
  "language": "en",
  "version": "2026-08-22",
  "content_hash": "sha256:..."
}
```

## 4. Chunking strategy

Chunking should follow semantic boundaries rather than arbitrary character counts when possible.

Recommended starting point:

- 300–800 token chunks;
- 10–20% overlap only where continuity requires it;
- preserve headings and source references;
- do not split tables or contraindication lists in ways that change meaning;
- retain source and section identifiers on every chunk.

Health-safety references may require smaller, highly targeted chunks so contraindications and emergency criteria remain precise.

## 5. Phase 1 Dify knowledge pipeline

Phase 1 material is ingested into Dify-managed knowledge bases or a Dify-connected retrieval layer.

Suggested collections:

```text
phase1_tcm_patterns
phase1_tcm_terminology
phase1_herb_safety
phase1_red_flags
phase1_conventional_context
```

Dify workflows should retrieve from the minimum necessary collection based on the intake and task.

### Retrieval policy

The workflow should prefer:

1. safety / red-flag references;
2. higher-trust medical context;
3. TCM pattern references;
4. supplementary explanatory material.

A low-trust source should not override a high-trust safety source.

## 6. Phase 2 local corpus

Phase 2 uses a local ChromaDB collection such as:

```text
redrise_pause
```

Possible source categories:

- RedRise-authored Pause prompts;
- licensed contemplative material;
- short transition exercises;
- reflection questions;
- non-clinical grounding material.

The collection should deliberately exclude medical diagnostic material unless a specific safety function requires it.

## 7. Phase 3 local corpora

Phase 3 should use multiple collections rather than one undifferentiated spiritual corpus:

```text
redrise_scripture
redrise_commentary
redrise_journey_prompts
redrise_themes
```

Metadata filters should support:

- book / chapter / verse;
- author;
- denomination or tradition where relevant;
- source type;
- copyright/license status;
- theme;
- language;
- corpus version.

## 8. Retrieval pipeline for Phase 2 and 3

```text
User query
 -> normalize query
 -> apply phase filter
 -> embed query
 -> semantic search in ChromaDB
 -> optional keyword search
 -> fuse / rerank
 -> remove low-quality or duplicate chunks
 -> enforce token budget
 -> assemble context with source metadata
 -> generate through Ollama
 -> validate citations / attribution
```

A hybrid retrieval approach can combine semantic similarity with lexical matching. This is useful for Scripture references, names, exact phrases, and medical terminology that semantic-only retrieval may miss.

## 9. User context pipeline

User data should not be treated as knowledge-base data.

A user journal entry may be included in a Phase 3 prompt only when:

- the user has opted into that context;
- the entry belongs to the same user;
- the application selects only the relevant excerpt;
- it is clearly labeled as user-authored content;
- it is never embedded into a shared collection.

If persistent personal retrieval is added later, each user must have a logically isolated namespace or collection.

## 10. Relational persistence

A free local database can store structured application state.

### SQLite profile

Suitable for:

- single-user local deployment;
- development;
- offline use;
- simple desktop/appliance installations.

### PostgreSQL profile

Suitable for:

- multi-user deployment;
- concurrent access;
- stronger operational tooling;
- server-based hosting.

Suggested schema domains:

```text
users
sessions
journey_state
consents
phase_events
safety_events
journal_entries
retrieval_events
source_registry
source_versions
settings
```

## 11. Free object/file storage

The initial deployment can use the local filesystem.

If S3-compatible storage is needed, MinIO is an appropriate open-source option.

Potential stored objects:

- user exports;
- source ingestion artifacts;
- corpus snapshots;
- backup archives;
- generated reports.

Sensitive objects must be encrypted or stored on encrypted volumes where the threat model requires it.

## 12. Embedding lifecycle

Every vector index should be versioned by:

```text
corpus version
embedding model
embedding model revision
chunking algorithm version
metadata schema version
```

Changing the embedding model generally requires rebuilding the corresponding index.

A recommended naming pattern:

```text
redrise_scripture_v1_bge-small-en
redrise_pause_v2_nomic-embed-text
```

## 13. Provenance

Every source-grounded generated response should be traceable back to retrieved chunks.

A retrieval event should record:

```text
session_id
phase
query_hash
collection
retrieved_document_ids
retrieved_chunk_ids
scores
model_revision
prompt_version
timestamp
```

Raw sensitive user text should not be duplicated into logs unless explicitly necessary and protected.

## 14. Data quality gates

Before source material enters production retrieval, validate:

- source authenticity;
- license/rights;
- metadata completeness;
- broken formatting;
- duplicate content;
- prompt-injection content;
- unsupported medical claims;
- misleading or sectarian attribution;
- incorrect Scripture references;
- stale safety guidance.

## 15. Prompt-injection defense in RAG

Retrieved documents must be treated as untrusted data, even when curated.

The generation prompt should explicitly state that instructions inside retrieved text are content, not system instructions.

The pipeline should also scan for suspicious phrases such as instructions to ignore system rules, disclose secrets, change roles, or execute tools.

## 16. Data retention

Default retention should be minimal.

Recommended policy:

- transient prompts: do not persist unless needed for a user-visible history feature;
- journal entries: user-controlled retention;
- safety event metadata: retain only as required for product safety and legal obligations;
- raw model traces: disabled or minimized in production;
- retrieval provenance: retain IDs/hashes rather than unnecessary raw user content.

## 17. Export and deletion

Users should be able to export and delete their own data.

A deletion operation should cover:

- relational records;
- personal vector namespaces, if any;
- journal files;
- object-storage files;
- cached summaries;
- user-specific model memory.

Shared source corpora are not user data and should not be deleted as part of a user-data request.

## 18. Backup strategy

A local deployment can use simple free tooling:

- SQLite file snapshots;
- `pg_dump` for PostgreSQL;
- ChromaDB data-directory backups;
- filesystem snapshots;
- encrypted archive rotation.

Backups containing sensitive data must be protected to the same standard as the primary database.

## 19. Pipeline rule

The central data principle is:

**Knowledge sources, user health data, and spiritual journal data are different data classes and must never be merged by convenience.**

The retrieval architecture should preserve that separation from ingestion through generation and deletion.