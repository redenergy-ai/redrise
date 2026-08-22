# RedRise Journey Phases

## 1. Why the journey is divided into phases

RedRise is not a single chatbot with three prompt presets. It is a deliberate progression through three different interaction domains:

1. a health-oriented, TCM-style reasoning phase;
2. a contemplative transition called **The Pause**;
3. a guided Christian reflection journey called **“Experience Jesus. Really.”**

Each phase has a different purpose, different model behavior, different retrieval corpus, and different safety boundary. The user must always know which phase they are in and when a transition occurs.

---

## 2. Phase 1 — Chinese herbal diagnosis / TCM pattern assessment

### Purpose

Phase 1 helps the user organize symptoms and context into an educational traditional Chinese medicine pattern assessment. The system may discuss concepts such as heat/cold, deficiency/excess, qi, blood, yin/yang, dampness, wind, organ-system patterns, and related TCM frameworks.

However, RedRise must not present these concepts as equivalent to a conventional medical diagnosis. The preferred user-facing term is **TCM pattern assessment** or **educational TCM interpretation**, even if the product journey informally refers to “Chinese herbal diagnosis.”

### Intended model

The preferred reasoning family is:

- `DeepSeek-R1-Distill-Llama-8B` for general reasoning;
- `DeepSeek-Med-8B` where the medically adapted variant has been independently evaluated for the required use case.

### Phase 1 interaction sequence

```text
1. Explain scope and disclaimer
2. Obtain acknowledgement / consent
3. Collect structured intake
4. Run deterministic safety / red-flag checks
5. Retrieve relevant Phase 1 knowledge
6. Generate cautious TCM pattern hypotheses
7. Validate output against safety rules
8. Present result with uncertainty and next steps
9. Explicitly close Phase 1
10. Offer entry into The Pause
```

### Suggested intake fields

The exact UI can evolve, but Phase 1 should be capable of collecting:

- primary concern;
- symptom onset and duration;
- symptom location and quality;
- severity;
- aggravating and relieving factors;
- fever, breathing difficulty, bleeding, neurological symptoms, chest pain, severe dehydration, pregnancy, or other red-flag contexts;
- sleep;
- appetite and digestion;
- thirst;
- bowel and urinary patterns;
- energy;
- stress and emotional context;
- temperature preference;
- menstrual/reproductive context where relevant and voluntarily provided;
- known conditions;
- medications and supplements;
- allergies;
- optional tongue/pulse observations only if the product can handle them responsibly.

### Phase 1 output contract

A good response should separate the following fields:

```text
Safety status
Observed pattern clues
Possible TCM patterns
Reasoning summary
Conventional-care considerations
Questions to discuss with a qualified practitioner
Sources / knowledge references
Disclaimer
```

The model should use probabilistic language such as:

- “may be consistent with”;
- “one possible TCM pattern is”;
- “this does not establish a diagnosis”;
- “because of X, a clinician should evaluate Y.”

### What Phase 1 must not do

Phase 1 must not:

- claim certainty about a disease diagnosis;
- tell the user to ignore conventional care;
- prescribe a specific herb or formula as a substitute for professional care;
- give unsafe dosing advice;
- imply that TCM pattern reasoning rules out serious disease;
- generate false citations;
- continue a normal assessment when a red-flag condition is detected.

### Emergency handling

If a red flag is detected, the normal assessment should be interrupted. The system should state clearly that the symptom pattern may require urgent professional evaluation and direct the user toward appropriate local emergency services or urgent care according to the application’s configured jurisdiction logic.

The LLM should not be the sole emergency classifier. Deterministic rules and validated safety logic should run before and after generation.

---

## 3. Transition from Phase 1 to Phase 2

The transition must be explicit. Phase 1 should end with a boundary message rather than immediately turning a medical-style conversation into spiritual guidance.

The user should be able to:

- end the session after Phase 1;
- save the Phase 1 summary;
- enter The Pause;
- decline any transfer of Phase 1 context into later phases.

By default, only the minimum context necessary for continuity should cross the boundary. Sensitive health details should not automatically become spiritual-prompt context.

---

## 4. Phase 2 — The Pause

### Purpose

The Pause is a deliberate interruption of speed and analysis. It is inspired by the contemplative approach associated with John Eldredge: stop, release hurry, become present, and create space before continuing.

Phase 2 is not a clinical intervention, mental-health treatment, or diagnostic exercise. It is a reflective transition.

### Design principles

The Pause should be:

- short enough to feel accessible;
- slow enough to feel materially different from Phase 1;
- optional;
- non-coercive;
- low-output;
- free of model theatrics;
- comfortable with silence and user non-response.

### Suggested interaction sequence

```text
1. Announce the transition
2. Invite the user to become still
3. Offer a short grounding / surrender prompt
4. Allow silence or journaling
5. Ask one reflective question at a time
6. Offer a summary only if useful
7. Ask whether the user wants to continue to Phase 3
```

### Example categories of prompts

Prompts may invite the user to reflect on:

- what they are carrying;
- where they feel hurried or afraid;
- what they are trying to control;
- what they are grateful for;
- what they are reluctant to face;
- whether they are willing to enter the next phase honestly.

The implementation should favor short, grounded prompts over lengthy generated meditations.

### Retrieval architecture

Phase 2 uses custom local RAG with:

- Ollama for local inference;
- ChromaDB for local vector retrieval;
- a curated Pause/reflection corpus.

The corpus may contain licensed or original material that is legally permitted for the deployment. Copyrighted source material must not be copied into the corpus without appropriate rights.

### Phase 2 safety boundary

The model must not reinterpret medical symptoms as spiritual causes. It should not imply that illness is punishment, lack of faith, demonic activity, or a result of insufficient prayer.

If the user introduces severe psychological distress, self-harm, abuse, psychosis, or emergency medical content, the system must leave the normal reflective flow and activate the appropriate safety response.

---

## 5. Transition from Phase 2 to Phase 3

The transition should require a clear user action such as **Continue**, **Begin Guided Journey**, or an equivalent explicit choice.

Before continuing, RedRise should make the spiritual nature of Phase 3 clear. A user should never arrive in a Christian guidance experience without knowing that this is what the next phase contains.

---

## 6. Phase 3 — Guided Journey: “Experience Jesus. Really.”

### Purpose

Phase 3 helps the user engage in a grounded Christian journey using Scripture, prayer, reflection, and curated teaching. The phrase “Experience Jesus. Really.” describes the intention of the experience, not a promise that the software can produce or verify a supernatural experience.

### Core experience

Possible Phase 3 activities include:

- reading a relevant Scripture passage;
- reflecting on a question;
- journaling;
- composing a prayer;
- examining fear, identity, forgiveness, trust, gratitude, grief, purpose, or relationships through a Christian lens;
- revisiting a theme over multiple sessions;
- creating practical next steps.

### Retrieval architecture

Phase 3 uses local RAG with separate collections for:

- Scripture;
- commentary;
- journey prompts;
- theological reference material;
- optionally user-approved personal journal context.

The retrieval service should return source metadata with every source-grounded answer.

### Source hierarchy

A useful hierarchy is:

```text
Tier 1: Scripture
Tier 2: primary or clearly attributed Christian source material
Tier 3: curated commentary / study material
Tier 4: RedRise-authored journey prompts
Tier 5: model-generated synthesis
```

Generated synthesis should never be presented as Tier 1–4 content.

### Spiritual-authority guardrail

RedRise must never claim:

- “God told me to tell you…”;
- “God is definitely saying…”;
- “Jesus revealed that you must…”;
- certainty about a prophecy;
- supernatural knowledge of another person’s intentions;
- certainty that a specific event is God's judgment or reward.

Preferred language includes:

- “A passage that may be relevant is…”;
- “One way Christians have understood this theme is…”;
- “You might reflect on…”;
- “I cannot know or verify what God is saying to you personally.”

### User agency

The user should be able to:

- skip a prompt;
- disagree with a reflection;
- request only Scripture;
- request sources;
- remove journal context;
- end the journey at any time;
- export or delete their data.

---

## 7. Cross-phase context policy

Context sharing should follow a minimum-necessary principle.

### Phase 1 -> Phase 2

Allowed by default:

- that Phase 1 was completed;
- a user-selected high-level theme.

Not automatically transferred:

- detailed symptom history;
- medications;
- sensitive medical information;
- speculative TCM interpretation.

### Phase 2 -> Phase 3

Allowed with user consent:

- a reflection theme;
- a journal excerpt selected by the user;
- a stated goal for the guided journey.

### Persistent journal memory

Persistent memory should be opt-in, inspectable, editable, and deletable.

---

## 8. Session completion

At the end of a journey, RedRise may provide a structured recap:

```text
Phase 1 summary: optional
What I noticed during The Pause: user-authored or user-approved
Scripture / sources explored: citations
Reflections: clearly labeled as generated or user-authored
Practical next step: optional
Data controls: save / export / delete
```

A completion summary must preserve the distinctions among health information, TCM interpretation, sourced spiritual material, and generated reflection.

## 9. Product integrity rule

The journey succeeds only if the three phases remain meaningfully different.

Phase 1 should feel careful and analytical.

Phase 2 should feel quiet and spacious.

Phase 3 should feel grounded, sourced, and spiritually reflective without pretending to possess divine authority.