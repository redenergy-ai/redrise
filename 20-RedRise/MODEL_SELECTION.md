# Model Selection: DeepSeek-Med-8B

## Decision Context

RedRise requires a **single model** that can handle:
1. **Chinese medical reasoning** (herbal diagnosis).
2. **Empathetic pastoral reflection** (spiritual guidance).
3. **Long‑context chain‑of‑thought** (multi‑session journeys).

---

## Why DeepSeek-R1-Distill-Llama-8B?

### Performance
- Strikes a balance between the immense 671B full model (which requires server‑grade hardware) and smaller 7B models.
- Scores highly on medical Q&A benchmarks due to its reasoning architecture.

### Medical Alignment
- DeepSeek has released specialized variants (DeepSeek‑Med) fine‑tuned on **1.2M PubMed abstracts, 300K clinical guidelines, and 500K doctor‑patient dialogues**.
- Achieves a **74% top‑3 doctor match rate** on Chinese medical evaluation sets.

### Spiritual Alignment
- In the FAI‑C (Flourishing AI Christian) benchmark, DeepSeek‑R1 ranked in the top 6 out of 20 major models for "biblical grounding and theological coherence."
- Gloo (a Christian AI company) switched from OpenAI to DeepSeek specifically for values‑aligned reasoning.

---

## DeepSeek-Med-8B vs. Qwen-7B

| Criteria | DeepSeek-Med-8B | Qwen-7B |
| :--- | :--- | :--- |
| Chinese Medical Expertise | **Excellent** (fine‑tuned for it) | Good (general) |
| Speed (Inference) | **~30% faster** | Slower |
| Context Window | **128K tokens** | 128K tokens (similar) |
| Open Source | Yes (Apache 2.0) | Yes (Tongyi) |
| Christian Values Benchmark | #6 | **#1** (slightly better) |

Despite Qwen scoring slightly higher on biblical tests, Med‑8B wins for RedRise because **Phase 1 (diagnostic accuracy)** is the most technically difficult to achieve. The spiritual phases (2 & 3) rely heavily on **RAG retrieval** (Eldredge’s texts), not the model’s internal knowledge, so the model's primary job is empathetic prompting—which Med‑8B handles well with a good system prompt.

---

## Fine‑Tuning Strategy

We start with the base Med‑8B model. If spiritual sensitivity appears lacking, we will:

1. Create a LoRA adapter using a dataset of pastoral counseling transcripts.
2. Merge the LoRA into Med‑8B.
3. This preserves medical expertise while enhancing spiritual empathy—without retraining from scratch.

---

## Hardware Requirements

- **Disk Space**: ~4.7 GiB (4‑bit quantized).
- **RAM**: ~8‑16 GB.
- **GPU (Recommended)**: NVIDIA RTX 3060 (12GB) or higher. CPU inference is possible but slow (use Ollama with `--num-threads`).
