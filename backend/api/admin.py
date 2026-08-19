from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from backend.api.security import require_admin_api_key
from backend.config.settings import settings
from backend.schemas.admin import CandidateCreate, CandidateResponse, TallyResponse, AdminVoteMock
from backend.utils.election_store import election_store

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin_api_key)])


@router.post("/candidates", response_model=CandidateResponse)
async def register_candidate(candidate: CandidateCreate):
    return election_store.add_candidate(candidate.name, candidate.party, candidate.place, candidate.district)


@router.get("/candidates", response_model=List[CandidateResponse])
async def get_candidates():
    return election_store.get_candidates()


@router.get("/tally", response_model=List[TallyResponse])
async def get_tally():
    return election_store.get_tally()


@router.post("/vote_mock")
async def mock_vote(vote: AdminVoteMock):
    if not settings.ENABLE_VOTE_MOCK:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    success = election_store.record_vote(vote.candidate_id)
    if not success:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"status": "success", "message": "Vote recorded securely and anonymously."}
