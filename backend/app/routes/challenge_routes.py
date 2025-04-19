"""
API routes for the challenge functionality.
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, List, Any, Optional

from ..models.challenge import (
    Challenge,
    ChallengeAttempt,
    ChallengeResult,
    ChallengeStage
)
from ..services.challenge_service import ChallengeService

router = APIRouter(prefix="/challenges", tags=["challenges"])
challenge_service = ChallengeService()


@router.get("/", response_model=List[Challenge])
async def list_challenges():
    """
    Get a list of all available challenges.
    """
    return challenge_service.get_all_challenges()


@router.get("/{challenge_id}", response_model=Challenge)
async def get_challenge(challenge_id: str):
    """
    Get detailed information about a specific challenge.
    """
    challenge = challenge_service.get_challenge(challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge


@router.post("/{challenge_id}/start", response_model=ChallengeAttempt)
async def start_challenge(challenge_id: str, user_id: Optional[str] = None):
    """
    Start a new challenge attempt.
    """
    try:
        return challenge_service.start_challenge(challenge_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {type(e).__name__}"
        )


@router.post("/{challenge_id}/attempts/{attempt_id}/submit", 
             response_model=ChallengeResult)
async def submit_answer(
    challenge_id: str, 
    attempt_id: str, 
    answer: Dict[str, Any]
):
    """
    Submit an answer for a challenge attempt.
    """
    try:
        return challenge_service.submit_answer(attempt_id, answer)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {type(e).__name__}"
        )


@router.get("/{challenge_id}/attempts/{attempt_id}/hint", 
            response_model=Dict[str, str])
async def get_hint(challenge_id: str, attempt_id: str):
    """
    Get a hint for the current challenge.
    """
    hint = challenge_service.get_hint(attempt_id)
    if hint is None:
        raise HTTPException(
            status_code=404, 
            detail="Hint not found or no more hints available"
        )
    return {"hint": hint}


@router.get("/{challenge_id}/attempts/{attempt_id}/stage", 
            response_model=Optional[ChallengeStage])
async def get_current_stage(challenge_id: str, attempt_id: str):
    """
    Get the current stage for a multi-stage challenge.
    """
    stage = challenge_service.get_current_stage(attempt_id)
    if stage is None:
        raise HTTPException(status_code=404, detail="No current stage found")
    return stage


@router.post("/{challenge_id}/attempts/{attempt_id}/simulate", 
             response_model=Dict[str, Any])
async def run_challenge_simulation(
    challenge_id: str,
    attempt_id: str,
    params: Optional[Dict[str, Any]] = None
):
    """
    Execute a simulation as part of a challenge.
    """
    try:
        return challenge_service.execute_challenge_simulation(
            challenge_id, 
            attempt_id, 
            params
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {type(e).__name__}"
        )