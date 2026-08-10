from fastapi import APIRouter, HTTPException
from typing import List
from backend.schemas.admin import CandidateCreate, CandidateResponse, TallyResponse, AdminVoteMock
from backend.utils.election_store import election_store

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/candidates", response_model=CandidateResponse)
async def register_candidate(candidate: CandidateCreate):
    """
    Register a new candidate.
    """
    new_candidate = election_store.add_candidate(candidate.name, candidate.party)
    return new_candidate

@router.get("/candidates", response_model=List[CandidateResponse])
async def get_candidates():
    """
    Get all registered candidates.
    """
    return election_store.get_candidates()

@router.get("/tally", response_model=List[TallyResponse])
async def get_tally():
    """
    Get the anonymized, aggregated vote counts. 
    Strict separation of duties: Admin cannot trace votes to individuals.
    """
    return election_store.get_tally()

@router.post("/vote_mock")
async def mock_vote(vote: AdminVoteMock):
    """
    Mock endpoint to cast a vote for testing the tally system.
    """
    success = election_store.record_vote(vote.candidate_id)
    if not success:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"status": "success", "message": "Vote recorded securely and anonymously."}
