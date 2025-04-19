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


class CBCBlock(BaseModel):
    """Model representing a ciphertext block in CBC mode."""
    index: int
    data: str  # base64-encoded ciphertext block
    decrypted: bool = False
    decrypted_data: Optional[str] = None


class CBCPaddingOracleResponse(BaseModel):
    """Response model for CBC Padding Oracle simulation."""
    original_message: str
    encrypted_message: str
    iv: str
    blocks: List[CBCBlock]
    decrypted_blocks: List[dict]
    simulation_steps: List[SimulationStep]
    success: bool


class MITMParticipant(BaseModel):
    """Model for a participant in MITM attack simulation."""
    id: str
    name: str
    key: Optional[str] = None
    certificate: Optional[str] = None


class MITMMessage(BaseModel):
    """Model for a message in MITM attack simulation."""
    sender_id: str
    receiver_id: str
    content: str
    encrypted: bool
    intercepted: bool = False
    modified: bool = False
    original_content: Optional[str] = None


class MITMAttackRequest(BaseModel):
    """Request model for MITM attack simulation."""
    protocol: str = Field(default="TLS", description="The protocol to simulate (TLS, SSH, etc)")
    intercept_mode: str = Field(default="passive", description="Whether to just observe or modify traffic")
    encryption_strength: int = Field(default=128, ge=64, le=256, description="Encryption strength in bits")
    message_count: int = Field(default=5, ge=1, le=20, description="Number of messages to simulate")
    custom_messages: Optional[List[str]] = Field(default=None, description="Optional custom messages to use")
    enable_certificates: bool = Field(default=True, description="Whether to use certificates in the simulation")


class MITMAttackResponse(BaseModel):
    """Response model for MITM attack simulation."""
    participants: List[MITMParticipant]
    messages: List[MITMMessage]
    simulation_steps: List[SimulationStep]
    success: bool
    attack_type: str
    protocol: str
    vulnerable: bool
    mitigation: str


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