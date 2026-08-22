# The RedRise 3‑Phase Journey

## Phase 1: Herbal Regimen (The Foundation)

**Goal**: Provide safe, natural options for anxiety management rooted in Chinese herbal medicine.

**Input**: User describes symptoms (e.g., "I have insomnia and palpitations").
**Process**:
1. RAG retrieves relevant TCM patterns (e.g., "Heart Blood Deficiency" or "Liver Qi Stagnation").
2. DeepSeek‑Med‑8B generates a protocol of specific herbs (e.g., *Suan Zao Ren* or *Gan Mai Da Zao*) with dosages and contraindications.
**Output**: A structured card showing herb name, traditional use, dosage, and a mandatory **Medical Disclaimer**.
**Exit Criteria**: User clicks "Begin Pause" or asks to move deeper.

---

## Phase 2: The Pause (Soul Stillness)

**Goal**: Teach the user to "hit the brakes" on their fight‑or‑flight response using John Eldredge’s Pause method.

**Structure**:
- **Breath Prayer**: "Breathe in the love of God, breathe out your fear."
- **Releasing Control**: A 60‑second guided release of worries into God's hands.
- **Presence Check**: The AI asks: "What do you sense right now in your body and heart?"

**Content Retrieval**: Vector DB searches `Elredge_Pause_Excerpts.md` for specific prompts.
**Session Length**: 2–3 minutes. Designed for daily use, morning and evening.

---

## Phase 3: Guided Journey (Experience Jesus. Really.)

**Goal**: An 8‑session journey toward hearing Jesus’ voice, based on the Pause App’s program.

**Session Outline** (Adapted from Eldredge's *Experience Jesus. Really.*):
1. **Session 1**: The Invitation – Jesus asks, "What do you want me to do for you?"
2. **Session 2**: The Love of the Father – Meditating on the baptism of Jesus.
3. **Session 3**: The Exchange – Laying down burdens, taking up His yoke.
4. **Session 4**: The Wilderness – Handling temptation and lies.
5. **Session 5**: The Healing – Inner healing of memories.
6. **Session 6**: The Call – Finding your true self in Him.
7. **Session 7**: The Battle – Spiritual warfare and standing firm.
8. **Session 8**: The Commission – Going out with His peace.

**Execution**:
- The RAG retrieves the specific daily reading and guided questions for that session.
- The AI (Med‑8B) poses reflective questions but does *not* teach doctrine—only facilitates encounter.
- The user's answers are stored locally and used to adjust subsequent sessions.

**Spiritual Safety**:
- The AI will never claim to *be* Jesus.
- It acts solely as a *reflective mirror* and guide toward Scripture (which is also retrieved via RAG from the ESV translation).
