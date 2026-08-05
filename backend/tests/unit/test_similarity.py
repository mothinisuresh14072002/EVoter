import numpy as np
from backend.services.similarity import compute_similarity, evaluate_similarity
from backend.config.settings import settings

def test_compute_similarity_identical():
    emb = np.array([0.5, 0.5, 0.5, 0.5])
    sim = compute_similarity(emb, emb)
    assert np.isclose(sim, 1.0)

def test_compute_similarity_orthogonal():
    emb1 = np.array([1.0, 0.0])
    emb2 = np.array([0.0, 1.0])
    sim = compute_similarity(emb1, emb2)
    assert np.isclose(sim, 0.0)

def test_evaluate_similarity_match():
    # Above threshold
    assert evaluate_similarity(settings.MATCH_THRESHOLD + 0.05) == "match"
    # Exactly on threshold
    assert evaluate_similarity(settings.MATCH_THRESHOLD) == "match"

def test_evaluate_similarity_manual_review():
    # Below match threshold, above manual review
    assert evaluate_similarity(settings.MATCH_THRESHOLD - 0.01) == "manual_review"
    # Exactly on manual review threshold
    assert evaluate_similarity(settings.MANUAL_REVIEW_THRESHOLD) == "manual_review"

def test_evaluate_similarity_reject():
    # Below manual review threshold
    assert evaluate_similarity(settings.MANUAL_REVIEW_THRESHOLD - 0.05) == "reject"
    # Complete mismatch
    assert evaluate_similarity(0.0) == "reject"
