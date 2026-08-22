# RedRise Model Selection

## 1. Decision summary

RedRise uses the DeepSeek 8B reasoning family as the primary model direction for Phase 1 because the project needs strong structured reasoning, local deployment feasibility, and sufficient capacity for medically adjacent analysis without requiring very large infrastructure.

The preferred candidates are:

- `DeepSeek-R1-Distill-Llama-8B` as the general reasoning baseline;
- `DeepSeek-Med-8B` where a medically adapted 8B model is available, validated, and licensed for the intended deployment.

The model is not trusted as an autonomous medical authority. It operates inside a retrieval-grounded workflow with deterministic safety controls and explicit disclaimers.

## 2. Why an 8B reasoning model

An 8B-class model is a practical compromise between capability and deployability.

Advantages include:

- feasible local inference on modern consumer or workstation hardware;
- lower memory requirements than 30B–70B models;
- lower latency and energy use;
- easier deployment through Ollama, llama.cpp, vLLM, or OpenAI-compatible local servers;
- simpler scaling for small private deployments;
- strong enough reasoning for structured intake synthesis when paired with retrieval and guardrails.

The tradeoff is that an 8B model has less world knowledge, nuance, and robustness than larger state-of-the-art systems. RedRise compensates through curated retrieval, narrow phase-specific prompts, structured outputs, validation, and refusal rules.

## 3. DeepSeek-R1-Distill-Llama-8B

The distilled DeepSeek reasoning model is useful as the general baseline because the Phase 1 task benefits from multi-step reasoning across symptoms, context, exclusions, and possible explanatory patterns.

The model should not expose raw chain-of-thought. Production outputs should present a concise reasoning summary that communicates the important evidence and uncertainty without relying on hidden reasoning traces.

Recommended use:

```text
Input:
- structured intake
- red-flag status
- retrieved evidence chunks
- user locale

Output:
- safety status
- relevant observations
- possible patterns
- concise rationale
- uncertainty
- next-step guidance
- source references
```

## 4. DeepSeek-Med-8B

A medically adapted model may improve terminology, clinical context handling, and medically relevant reasoning. However, the label “medical” is not sufficient evidence of safety or accuracy.

Before making `DeepSeek-Med-8B` the default, RedRise should evaluate it on:

- red-flag recognition;
- hallucinated diagnosis rate;
- unsafe treatment advice;
- medication/herb interaction awareness;
- uncertainty calibration;
- retrieval faithfulness;
- TCM versus conventional-medicine distinction;
- multilingual behavior if supported;
- prompt injection resistance;
- refusal correctness.

If the medical variant does not outperform the general reasoning model on RedRise's own safety and quality benchmark, the general model should remain the default.

## 5. Phase-specific model policy

### Phase 1

Primary model:

```text
DeepSeek-Med-8B (preferred only after validation)
        or
DeepSeek-R1-Distill-Llama-8B
```

Inference may run locally behind Dify using an OpenAI-compatible endpoint, Ollama, vLLM, or an equivalent private inference server.

Recommended generation posture:

- low-to-moderate temperature;
- retrieval required for knowledge-dependent claims;
- structured output schema;
- explicit uncertainty;
- no unsupported citations;
- deterministic safety validation before and after generation.

### Phase 2

Phase 2 does not require medical reasoning. It benefits more from calm instruction following, short output, and good contextual continuity.

The initial implementation may reuse the locally hosted 8B model to reduce infrastructure complexity. The system prompt must be completely separate from Phase 1, and the Phase 1 medical corpus must not be available to the Phase 2 retriever.

### Phase 3

Phase 3 requires reliable source use, restrained spiritual language, and good instruction following. The same local model can be used initially, but the model should be treated primarily as a synthesis engine over Scripture and curated material.

A future model change is acceptable if another local model materially improves:

- citation faithfulness;
- source distinction;
- theological-context handling;
- refusal of false divine-authority claims;
- long-context performance;
- local deployment efficiency.

## 6. Model abstraction

RedRise should never hard-code business logic directly to a specific model name.

Use a provider interface such as:

```text
generate(messages, options) -> response
embed(texts, options) -> vectors
health() -> provider status
modelInfo() -> capabilities
```

Configuration should define:

```text
PHASE1_MODEL
PHASE2_MODEL
PHASE3_MODEL
EMBEDDING_MODEL
MODEL_BASE_URL
MODEL_API_KEY   # optional for local endpoints
```

This keeps the application portable across Ollama, vLLM, llama.cpp servers, Dify-managed endpoints, and future local inference systems.

## 7. Quantization strategy

For local deployment, quantization can materially reduce memory requirements.

Possible profiles:

```text
Quality-first: FP16/BF16 where hardware permits
Balanced:      8-bit
Local default: 4-bit or 5-bit GGUF where validated
```

Quantization should be benchmarked rather than assumed harmless. Safety-sensitive capabilities such as red-flag detection and instruction following can degrade in compressed models.

For every production quantization profile, run the same RedRise evaluation suite used for the reference model.

## 8. Embedding model

The generation model and embedding model should be independently configurable.

The embedding model should be selected for:

- local execution;
- semantic retrieval accuracy;
- language coverage;
- predictable vector dimensions;
- acceptable latency;
- stable licensing.

Changing the embedding model requires re-embedding the affected ChromaDB collections or versioning them as a new index.

## 9. Evaluation strategy

Model selection is an engineering decision, not a brand preference.

RedRise should maintain a versioned evaluation set covering all phases.

### Phase 1 benchmark categories

- benign common symptoms;
- ambiguous presentations;
- emergency red flags;
- pregnancy-related caution scenarios;
- medication and herb interaction prompts;
- allergy scenarios;
- requests for definitive diagnosis;
- requests to replace medical care;
- contradictory user data;
- retrieval with irrelevant distractors;
- prompt injection in retrieved content.

### Phase 2 benchmark categories

- brevity;
- non-coercive tone;
- ability to tolerate silence;
- avoidance of medical reinterpretation;
- correct escalation when crisis content appears.

### Phase 3 benchmark categories

- Scripture/source accuracy;
- generated-versus-sourced distinction;
- refusal to claim divine revelation;
- avoidance of coercive spiritual advice;
- correct handling of grief, guilt, fear, abuse, and crisis content;
- retrieval faithfulness.

## 10. Acceptance metrics

A candidate model should be measured on at least:

```text
Safety violation rate
Red-flag recall
Unsupported certainty rate
Retrieval faithfulness
Citation correctness
Structured-output validity
Hallucination rate
Refusal precision / recall
Latency
Memory footprint
Tokens per second
```

No single aggregate score should hide a severe safety regression.

## 11. Dify model routing for Phase 1

Dify acts as the stable Phase 1 API surface. The RedRise app should not need to know whether the underlying inference runtime is Ollama, vLLM, or another compatible server.

Conceptually:

```text
RedRise App
  -> Dify workflow
      -> retrieval
      -> DeepSeek endpoint
      -> validation / formatting
  -> RedRise App
```

This makes it possible to change the model implementation without changing the client or journey state machine.

## 12. Local inference for Phase 2 and 3

For Phase 2 and 3:

```text
RedRise local RAG service
  -> retrieve from ChromaDB
  -> assemble context
  -> call Ollama
  -> validate output
```

This path avoids unnecessary external API exposure for personal journaling and spiritual reflection.

## 13. Fallback policy

Fallbacks must preserve trust boundaries.

A safe policy is:

- if the preferred Phase 1 model is unavailable, use only a pre-approved fallback model that has passed the same safety suite;
- never silently send local-only Phase 2/3 data to a cloud model;
- if no approved model is available, fail clearly and preserve session state;
- never substitute a model simply because it returns a successful HTTP response.

## 14. Model governance

Every production model release should record:

```text
model identifier
model hash / revision
license
quantization
runtime
prompt version
evaluation suite version
evaluation results
deployment date
rollback target
```

## 15. Final model-selection principle

The DeepSeek 8B family is selected because it offers a strong balance of reasoning, local deployability, and cost control. It does not eliminate the need for retrieval, validation, or human professional care.

In RedRise, the model is a constrained reasoning and synthesis component inside a larger safety architecture—not the authority.