import uuid
from typing import Dict, List
import threading

class ElectionStore:
    def __init__(self):
        # Store candidates: { "candidate_id": {"id": str, "name": str, "party": str} }
        self.candidates: Dict[str, dict] = {}
        # Secure tally store: { "candidate_id": int_count }
        self.tally: Dict[str, int] = {}
        self.lock = threading.Lock()

    def add_candidate(self, name: str, party: str) -> dict:
        with self.lock:
            candidate_id = str(uuid.uuid4())
            candidate = {
                "id": candidate_id,
                "name": name,
                "party": party
            }
            self.candidates[candidate_id] = candidate
            self.tally[candidate_id] = 0
            return candidate

    def get_candidates(self) -> List[dict]:
        with self.lock:
            return list(self.candidates.values())

    def get_tally(self) -> List[dict]:
        with self.lock:
            # Returns an aggregated count only. No individual voter links.
            result = []
            for cid, candidate in self.candidates.items():
                result.append({
                    "id": cid,
                    "name": candidate["name"],
                    "party": candidate["party"],
                    "votes": self.tally.get(cid, 0)
                })
            # Sort by highest votes
            return sorted(result, key=lambda x: x["votes"], reverse=True)

    def record_vote(self, candidate_id: str) -> bool:
        """
        Record a vote blindly. This ensures the admin can never trace back
        who voted for whom, preventing targeted voter fraud or coercion.
        """
        with self.lock:
            if candidate_id in self.tally:
                self.tally[candidate_id] += 1
                return True
            return False

# Global instance for prototyping
election_store = ElectionStore()
