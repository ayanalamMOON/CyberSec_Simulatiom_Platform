"""
Pydantic models for simulations and their parameters.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from enum import Enum


class SimulationStep(BaseModel):
    """Model representing a step in a simulation."""
    step: str
    description: str


class SimulationInfo(BaseModel):
    """Model for information about a simulation."""
    id: str
    name: str
    description: str
    complexity: str
    tags: List[str]


class Recipient(BaseModel):
    """Model for RSA key recipient in Hastad attack."""
    p: str
    q: str
    n: str
    d: str
    index: int


class HastadAttackRequest(BaseModel):
    """Request model for Hastad attack simulation."""
    exponent: int = Field(default=3, ge=3, description="The RSA public exponent e")
    key_size: int = Field(default=512, ge=256, le=2048, description="RSA key size in bits")
    message: Optional[int] = Field(default=None, description="Optional specific message to use")


class HastadAttackResponse(BaseModel):
    """Response model for Hastad attack simulation."""
    original_message: str
    recovered_message: str
    success: bool
    recipients: List[Recipient]
    ciphertexts: List[str]
    simulation_steps: List[SimulationStep]


class SimulationStatus(str, Enum):
    """Status of a simulation execution."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class SimulationResult(BaseModel):
    """Generic simulation result model."""
    simulation_id: str
    success: bool
    execution_time: Optional[float] = None
    steps: List[SimulationStep] = []
    results: Dict[str, Any] = {}
    error: Optional[str] = None


class TaskStatusResponse(BaseModel):
    """Response model for task status endpoint."""
    task_id: str
    status: SimulationStatus
    progress: int = 0
    message: Optional[str] = None
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    execution_time: Optional[float] = None
    has_result: bool = False
    error: Optional[str] = None