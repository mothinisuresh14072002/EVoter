from pydantic import BaseModel

class CandidateCreate(BaseModel):
    name: str
    party: str

class CandidateResponse(BaseModel):
    id: str
    name: str
    party: str

class TallyResponse(BaseModel):
    id: str
    name: str
    party: str
    votes: int

class AdminVoteMock(BaseModel):
    candidate_id: str
