"""
Data models for the challenge functionality.
"""
from enum import Enum
from datetime import datetime
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field


class ChallengeType(str, Enum):
    """Types of challenges available in the platform."""
    CTF = "ctf"
    TIMED = "timed"
    BLIND = "blind"
    MULTI_STAGE = "multi_stage"


class ChallengeStage(BaseModel):
    """A stage in a multi-stage challenge."""
    id: str
    name: str
    description: str
    simulation_id: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    hints: List[str] = Field(default_factory=list)
    points: int
    solution: Dict[str, Any] = Field(default_factory=dict)
    time_limit_seconds: Optional[int] = None


class Challenge(BaseModel):
    """A cybersecurity challenge."""
    id: str
    name: str
    description: str
    type: ChallengeType
    difficulty: str
    tags: List[str]
    points: int
    simulation_ids: List[str] = Field(default_factory=list)
    stages: List[ChallengeStage] = Field(default_factory=list)
    time_limit_seconds: Optional[int] = None
    parameters: Dict[str, Any] = Field(default_factory=dict)
    hidden_parameters: Dict[str, Any] = Field(default_factory=dict)
    expected_answer: Optional[str] = None
    hints: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
    icon: str = "🔒"


class ChallengeAttempt(BaseModel):
    """An attempt to solve a challenge."""
    id: str
    challenge_id: str
    user_id: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    current_stage_index: int = 0
    completed: bool = False
    score: int = 0
    answers: Dict[str, Any] = Field(default_factory=dict)
    hints_used: int = 0
    time_spent_seconds: int = 0


class ChallengeResult(BaseModel):
    """Result of a challenge attempt."""
    success: bool
    score: int
    time_spent_seconds: int
    hints_used: int
    correct_stages: int
    total_stages: int
    feedback: str
    next_challenge_id: Optional[str] = None
