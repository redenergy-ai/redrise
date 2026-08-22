#!/usr/bin/env python3
"""
RedRise Phase Intent Classifier

Hybrid classifier that routes user input to one of three phases:
- herbal   (Phase 1)
- pause    (Phase 2)
- journey  (Phase 3)

Strategy:
1. Fast regex/keyword rules for explicit triggers.
2. Semantic embedding similarity to exemplar queries (fallback).
3. Confidence threshold – if low, returns "clarify" to ask a question.
"""

import re
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
from sentence_transformers import SentenceTransformer

# ============================================================
# CONFIGURATION
# ============================================================

# Minimum similarity score to make a confident decision
CONFIDENCE_THRESHOLD = 0.55

# Model used for semantic fallback (same as ingestion pipeline)
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

# ============================================================
# RULE-BASED PATTERNS (Fast Path)
# ============================================================

# Each tuple: (regex_pattern, phase, weight)
# Higher weight overrides lower weight if multiple patterns match.
RULES = [
    # --- Herbal (Phase 1) ---
    (r"\b(insomnia|palpitations|headache|dizziness|fatigue|anxiety)\b", "herbal", 2),
    (r"\b(supplement|herb|tcm|traditional chinese|decoction|acupuncture)\b", "herbal", 3),
    (r"\b(suan zao ren|gan mai da zao|he huan pi|ashwagandha|valerian|magnesium)\b", "herbal", 4),
    (r"\b(natural remedy|herbal remedy|botanical|adaptogen)\b", "herbal", 3),

    # --- Pause (Phase 2) ---
    (r"\b(pause|breath|breathe|stillness|calm|settle|release)\b", "pause", 3),
    (r"\b(close your eyes|let go|rest|stop|wait|slow down)\b", "pause", 2),
    (r"\b(eldredge|one minute pause|get your life back)\b", "pause", 4),

    # --- Journey (Phase 3) ---
    (r"\b(jesus|christ|god|father|holy spirit|lord)\b", "journey", 3),
    (r"\b(hear voice|encounter|experience jesus|really|invitation)\b", "journey", 4),
    (r"\b(session [1-8]|day [1-8]|week [1-8])\b", "journey", 4),
    (r"\b(prayer|reflect|meditate|scripture|bible)\b", "journey", 2),
]

# ============================================================
# SEMANTIC EXEMPLARS (Fallback Path)
# ============================================================

# Short, representative queries for each phase.
# These will be embedded and compared against user input.
EXEMPLARS = {
    "herbal": [
        "I have trouble sleeping and my heart races.",
        "What herbs can I take for anxiety?",
        "I feel palpitations and dizziness.",
        "Can you recommend a natural supplement for stress?",
        "My TCM practitioner suggested something for my liver qi.",
    ],
    "pause": [
        "Help me pause and breathe.",
        "I need to calm down right now.",
        "Teach me to be still.",
        "Guide me through a breath prayer.",
        "I want to release my worries to God.",
    ],
    "journey": [
        "I want to hear Jesus' voice.",
        "Guide me through the journey to encounter Christ.",
        "What does it mean to experience Jesus really?",
        "Session 1 of the journey.",
        "Help me reflect on God's love for me.",
    ],
}

# ============================================================
# CLASSIFIER LOGIC
# ============================================================

class PhaseClassifier:
    def __init__(self, embedding_model: Optional[str] = None):
        """
        Initialize the classifier. Loads the embedding model once.
        """
        model_name = embedding_model or EMBEDDING_MODEL_NAME
        print(f"🔍 Loading embedding model for classifier: {model_name}")
        self.embedder = SentenceTransformer(model_name)
        self._embed_exemplars()
        print("✅ PhaseClassifier ready.")

    def _embed_exemplars(self) -> None:
        """Pre-embed all exemplar queries for fast similarity comparison."""
        self.exemplar_embeddings = {}
        for phase, queries in EXEMPLARS.items():
            embeddings = self.embedder.encode(queries, convert_to_numpy=True)
            # Store as list of (query, embedding) for inspection if needed
            self.exemplar_embeddings[phase] = {
                "embeddings": embeddings,
                "queries": queries,
            }

    def _apply_rules(self, text: str) -> List[Tuple[str, float, int]]:
        """
        Apply regex rules and return list of (phase, confidence, weight).
        Confidence is 1.0 for rule-based matches.
        """
        text_lower = text.lower()
        matches = []
        for pattern, phase, weight in RULES:
            if re.search(pattern, text_lower):
                # Confidence 1.0, weight determines which rule wins
                matches.append((phase, 1.0, weight))
        return matches

    def _semantic_fallback(self, text: str) -> Tuple[str, float]:
        """
        If rules don't fire, compute cosine similarity to exemplars.
        Returns (phase, max_similarity).
        """
        input_embedding = self.embedder.encode([text], convert_to_numpy=True)[0]
        best_phase = "herbal"
        best_similarity = 0.0

        for phase, data in self.exemplar_embeddings.items():
            exemplar_embs = data["embeddings"]
            # Compute cosine similarity between input and all exemplars
            # Normalize vectors for cosine similarity
            norm_input = input_embedding / (np.linalg.norm(input_embedding) + 1e-8)
            norm_exemplars = exemplar_embs / (np.linalg.norm(exemplar_embs, axis=1, keepdims=True) + 1e-8)
            similarities = np.dot(norm_exemplars, norm_input)
            max_sim = float(np.max(similarities))
            if max_sim > best_similarity:
                best_similarity = max_sim
                best_phase = phase

        return best_phase, best_similarity

    def classify(self, user_input: str) -> Dict[str, Any]:
        """
        Main entry point. Returns dict with phase, confidence, and reasoning.

        Returns:
            {
                "phase": "herbal" | "pause" | "journey" | "clarify",
                "confidence": float (0-1),
                "method": "rule" | "semantic" | "clarify",
                "raw_matches": []  # for debugging
            }
        """
        text = user_input.strip()
        if not text:
            return {
                "phase": "clarify",
                "confidence": 0.0,
                "method": "empty_input",
                "raw_matches": [],
            }

        # Step 1: Rules
        rule_matches = self._apply_rules(text)
        if rule_matches:
            # Choose the match with highest weight
            best_match = max(rule_matches, key=lambda x: x[2])  # (phase, conf, weight)
            phase, conf, weight = best_match
            # Boost confidence slightly based on weight (capped at 1.0)
            boosted_conf = min(1.0, 0.7 + (weight / 10))
            return {
                "phase": phase,
                "confidence": boosted_conf,
                "method": "rule",
                "raw_matches": [{"phase": p, "confidence": c, "weight": w} for p, c, w in rule_matches],
            }

        # Step 2: Semantic fallback
        phase, similarity = self._semantic_fallback(text)
        if similarity >= CONFIDENCE_THRESHOLD:
            return {
                "phase": phase,
                "confidence": round(similarity, 3),
                "method": "semantic",
                "raw_matches": [],
            }

        # Step 3: Low confidence – ask for clarification
        return {
            "phase": "clarify",
            "confidence": round(similarity, 3),
            "method": "low_confidence",
            "raw_matches": [],
        }

    def get_clarification_question(self) -> str:
        """Return a standard follow‑up question when confidence is low."""
        return (
            "I want to help you best. Are you looking for:\n"
            "1. Herbal or natural supplement advice (Phase 1)?\n"
            "2. A 'Pause' exercise to calm your mind (Phase 2)?\n"
            "3. A guided spiritual journey to hear Jesus' voice (Phase 3)?\n\n"
            "Please reply with 1, 2, or 3, or just tell me what you need."
        )


# ============================================================
# SINGLETON INSTANCE & CONVENIENCE FUNCTION
# ============================================================

_CLASSIFIER_INSTANCE = None

def get_classifier() -> PhaseClassifier:
    """Lazy-load the classifier so it only initialises once."""
    global _CLASSIFIER_INSTANCE
    if _CLASSIFIER_INSTANCE is None:
        _CLASSIFIER_INSTANCE = PhaseClassifier()
    return _CLASSIFIER_INSTANCE

def classify_phase(user_input: str) -> Dict[str, Any]:
    """Convenience function for quick classification."""
    clf = get_classifier()
    return clf.classify(user_input)


# ============================================================
# QUICK TEST (run with `python phase_classifier.py`)
# ============================================================
if __name__ == "__main__":
    # Simple manual test
    clf = PhaseClassifier()
    test_inputs = [
        "I have insomnia and palpitations at night.",
        "Help me pause and breathe deeply.",
        "I want to hear Jesus speak to me.",
        "What is the weather like?",
    ]
    print("\n--- Classifier Test ---")
    for inp in test_inputs:
        result = clf.classify(inp)
        print(f"\nInput: {inp}")
        print(f"  Phase: {result['phase']}")
        print(f"  Confidence: {result['confidence']}")
        print(f"  Method: {result['method']}")
