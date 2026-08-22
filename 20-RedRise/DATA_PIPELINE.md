# Data Pipeline & Knowledge Curation

## Knowledge Sources

### 1. Herbal Regimen (Phase 1)
- **TCM Classics**: *Shang Han Lun*, *Jin Gui Yao Lue* (public domain).
- **Peer‑Reviewed Papers**: PubMed / CNKI (Chinese National Knowledge Infrastructure) open‑access papers on herbal anxiolytics.
- **Supplement Datasets**: Examine.com API (structured data for vitamins/minerals).
- **Format**: Markdown + CSV structured tables (herb, property, dosage, interactions).

### 2. The Pause (Phase 2)
- **Primary Source**: John Eldredge, *Get Your Life Back* and *One Minute Pause* (excerpts, with permission/fair use).
- **Scripture**: ESV Bible passages related to stillness (Psalms, Matthew 11:28‑30).

### 3. Guided Journey (Phase 3)
- **Primary Source**: John Eldredge, *Experience Jesus. Really.* – session summaries, reflective questions, and closing prayers.

---

## Chunking Strategy

| Phase | Chunk Size | Overlap | Strategy |
| :--- | :--- | :--- | :--- |
| 1 (Herbal) | 512 tokens | 50 tokens | **Semantic** – preserve complete remedy protocols. |
| 2 (Pause) | 256 tokens | 20 tokens | **Fixed‑size** – short breath prayers. |
| 3 (Journey) | 1024 tokens | 100 tokens | **Semantic** – preserve entire session narratives. |

---

## Embedding Models

- **Cloud (Phase 1 Dify)**: Uses Dify’s default `text-embedding-ada-002` (or equivalent).
- **Local (Phases 2 & 3)**: We use **`BAAI/bge-m3`** (multilingual, local) via the `sentence-transformers` library, falling back to `all-MiniLM-L6-v2` for lower hardware.

---

## Ingestion Script (Example)

We will create `ingest_knowledge.py` in the `20-RedRise/` folder.

```python
import chromadb
from sentence_transformers import SentenceTransformer

client = chromadb.PersistentClient(path="./redrise_db")
collection = client.get_or_create_collection("journey_data")
model = SentenceTransformer('BAAI/bge-m3')

# Load, chunk, embed, and upsert MD files here.
```

The script will watch the 20-RedRise/knowledge/ directory for .md files and auto‑update the vector index.

---

Update Cycle

· Herbal DB: Updated monthly with new studies (manual review).
· Spiritual DB: Static (books are fixed). Updated only when new editions/revisions are added.
