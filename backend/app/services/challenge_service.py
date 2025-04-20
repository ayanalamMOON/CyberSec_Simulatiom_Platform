"""
Service for handling challenge operations.
"""
import logging
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime

from ..models.challenge import (
    Challenge,
    ChallengeType,
    ChallengeStage,
    ChallengeAttempt,
    ChallengeResult
)
from ..engine import SimulationEngine
from .simulation_service import SimulationService

logger = logging.getLogger(__name__)


class ChallengeService:
    """Service for handling challenge operations."""
    
    def __init__(self):
        """Initialize the challenge service with available challenges."""
        self.challenges: Dict[str, Challenge] = {}
        self.attempts: Dict[str, ChallengeAttempt] = {}
        self.simulation_service = SimulationService()
        self.engine = SimulationEngine()
        
        # Register sample challenges
        self._register_sample_challenges()
    
    def _register_sample_challenges(self):
        """Register sample challenges for the platform."""
        
        # CTF-style challenge
        self.challenges["ctf-rsa-basics"] = Challenge(
            id="ctf-rsa-basics",
            name="RSA Key Recovery Challenge",
            description=(
                "Recover the private key and decrypt the flag using the given public parameters."
            ),
            type=ChallengeType.CTF,
            difficulty="Medium",
            tags=["Cryptography", "RSA", "CTF"],
            simulation_ids=["hastad-attack"],
            points=300,
            parameters={
                "public_key": {
                    "e": 3,
                    "n": "8941738687752289723059834683098704986306944288331",
                },
                "ciphertext": "5269097804867122633878568157177839837738",
            },
            expected_answer="FLAG{RSA_MATH_BASICS}",
            hints=[
                "The public exponent e is very small. What attacks might be possible?",
                "Look into Håstad's Broadcast Attack and how it can be adapted."
            ],
            icon="🔐"
        )
        
        # Timed exercise
        self.challenges["timed-mitm-attack"] = Challenge(
            id="timed-mitm-attack",
            name="Race Against Time: MITM Attack",
            description=(
                "Complete the Man-in-the-Middle attack before the communication ends."
            ),
            type=ChallengeType.TIMED,
            difficulty="Easy",
            tags=["Network", "MITM", "Timed"],
            time_limit_seconds=300,  # 5 minutes
            simulation_ids=["mitm-attack"],
            points=200,
            parameters={
                "network_speed": "fast",
                "encryption_enabled": False
            },
            icon="⏱️"
        )
        
        # Blind scenario
        self.challenges["blind-attack-identification"] = Challenge(
            id="blind-attack-identification",
            name="Mystery Attack Identification",
            description=(
                "Analyze the patterns and identify which cryptographic attack is being performed."
            ),
            type=ChallengeType.BLIND,
            difficulty="Hard",
            tags=["Cryptography", "Analysis", "Identification"],
            simulation_ids=["hastad-attack", "cbc-padding-oracle"],
            points=400,
            hidden_parameters={
                "actual_simulation": "cbc-padding-oracle",
                "obscured_data": True
            },
            expected_answer="cbc-padding-oracle",
            icon="👁️‍🗨️"
        )
        
        # Multi-stage challenge
        stages = [
            ChallengeStage(
                id="stage1",
                name="Information Gathering",
                description="Collect key information about the target system.",
                simulation_id="mitm-attack",
                parameters={
                    "mode": "passive",
                    "duration": 60
                },
                hints=["Focus on identifying communicating parties first"],
                points=100
            ),
            ChallengeStage(
                id="stage2",
                name="Interception Setup",
                description=(
                    "Configure your tools to intercept the communication."
                ),
                simulation_id="mitm-attack",
                parameters={
                    "mode": "active",
                    "target_identified": True
                },
                hints=["Position yourself between the sender and receiver"],
                points=150
            ),
            ChallengeStage(
                id="stage3",
                name="Key Extraction",
                description=(
                    "Extract encryption keys from the intercepted data."
                ),
                simulation_id="hastad-attack",
                parameters={
                    "key_size": 512,
                    "exponent": 3
                },
                hints=["Look for repeated patterns in the key exchange"],
                points=200
            )
        ]
        
        self.challenges["multi-stage-advanced-mitm"] = Challenge(
            id="multi-stage-advanced-mitm",
            name="Advanced Persistent Threat Simulation",
            description=(
                "Complete a multi-stage attack, starting with reconnaissance "
                "and ending with data extraction."
            ),
            type=ChallengeType.MULTI_STAGE,
            difficulty="Expert",
            tags=["APT", "Multi-Stage", "Network", "Cryptography"],
            stages=stages,
            points=450,  # Base points, will be added to stage points
            icon="🎯"
        )
    
    def get_all_challenges(self) -> List[Challenge]:
        """Get all available challenges."""
        return list(self.challenges.values())
    
    def get_challenge(self, challenge_id: str) -> Optional[Challenge]:
        """Get a specific challenge by ID."""
        return self.challenges.get(challenge_id)
    
    def start_challenge(
        self, challenge_id: str, user_id: Optional[str] = None
    ) -> ChallengeAttempt:
        """Start a challenge attempt."""
        if challenge_id not in self.challenges:
            raise ValueError(f"Challenge {challenge_id} not found")
        
        attempt_id = str(uuid.uuid4())
        attempt = ChallengeAttempt(
            id=attempt_id,
            challenge_id=challenge_id,
            user_id=user_id,
            start_time=datetime.now()
        )
        
        self.attempts[attempt_id] = attempt
        return attempt
    
    def submit_answer(self, attempt_id: str, answer: Any) -> ChallengeResult:
        """Submit an answer for a challenge."""
        if attempt_id not in self.attempts:
            raise ValueError(f"Challenge attempt {attempt_id} not found")
        
        attempt = self.attempts[attempt_id]
        challenge = self.challenges[attempt.challenge_id]
        
        # Update attempt
        attempt.end_time = datetime.now()
        attempt.time_spent_seconds = int(
            (attempt.end_time - attempt.start_time).total_seconds()
        )
        
        # For multi-stage challenges
        if challenge.type == ChallengeType.MULTI_STAGE:
            return self._process_multi_stage_answer(attempt, challenge, answer)
        
        # For timed challenges
        if (challenge.type == ChallengeType.TIMED and 
                challenge.time_limit_seconds):
            if attempt.time_spent_seconds > challenge.time_limit_seconds:
                return ChallengeResult(
                    success=False,
                    score=0,
                    time_spent_seconds=attempt.time_spent_seconds,
                    hints_used=attempt.hints_used,
                    correct_stages=0,
                    total_stages=1,
                    feedback="Time limit exceeded!"
                )
        
        # Check if the answer is correct
        success = self._validate_answer(challenge, answer)
        
        # Calculate score
        score = self._calculate_score(challenge, attempt, success)
        
        # Mark as completed
        attempt.completed = True
        attempt.score = score
        attempt.answers[challenge.id] = answer
        
        # Prepare feedback message
        feedback = "Correct answer!" if success else "Incorrect answer, try again."
        next_id = self._get_next_challenge(challenge.id) if success else None
        
        return ChallengeResult(
            success=success,
            score=score,
            time_spent_seconds=attempt.time_spent_seconds,
            hints_used=attempt.hints_used,
            correct_stages=1 if success else 0,
            total_stages=1,
            feedback=feedback,
            next_challenge_id=next_id
        )
    
    def _process_multi_stage_answer(
        self, attempt: ChallengeAttempt, challenge: Challenge, answer: Any
    ) -> ChallengeResult:
        """Process an answer for a multi-stage challenge."""
        current_stage = challenge.stages[attempt.current_stage_index]
        
        # Check if the answer is correct for this stage
        stage_success = self._validate_stage_answer(current_stage, answer)
        
        if stage_success:
            # Update score and move to next stage
            attempt.score += current_stage.points
            attempt.current_stage_index += 1
            attempt.answers[current_stage.id] = answer
            
            # Check if we've completed all stages
            if attempt.current_stage_index >= len(challenge.stages):
                attempt.completed = True
                
                return ChallengeResult(
                    success=True,
                    score=attempt.score,
                    time_spent_seconds=attempt.time_spent_seconds,
                    hints_used=attempt.hints_used,
                    correct_stages=attempt.current_stage_index,
                    total_stages=len(challenge.stages),
                    feedback="Challenge completed successfully!",
                    next_challenge_id=self._get_next_challenge(challenge.id)
                )
            else:
                # More stages to go
                next_stage = challenge.stages[attempt.current_stage_index]
                
                return ChallengeResult(
                    success=True,
                    score=attempt.score,
                    time_spent_seconds=attempt.time_spent_seconds,
                    hints_used=attempt.hints_used,
                    correct_stages=attempt.current_stage_index,
                    total_stages=len(challenge.stages),
                    feedback=f"Stage completed! Moving to: {next_stage.name}"
                )
        else:
            # Failed this stage
            return ChallengeResult(
                success=False,
                score=attempt.score,
                time_spent_seconds=attempt.time_spent_seconds,
                hints_used=attempt.hints_used,
                correct_stages=attempt.current_stage_index,
                total_stages=len(challenge.stages),
                feedback="Incorrect solution for this stage. Try again!"
            )
    
    def get_current_stage(self, attempt_id: str) -> Optional[ChallengeStage]:
        """Get the current stage for a multi-stage challenge."""
        if attempt_id not in self.attempts:
            return None
        
        attempt = self.attempts[attempt_id]
        challenge = self.challenges[attempt.challenge_id]
        
        if challenge.type != ChallengeType.MULTI_STAGE:
            return None
        
        if attempt.current_stage_index >= len(challenge.stages):
            return None
        
        return challenge.stages[attempt.current_stage_index]
    
    def get_hint(self, attempt_id: str) -> Optional[str]:
        """Get a hint for the current challenge, tracking hint usage."""
        if attempt_id not in self.attempts:
            return None
        
        attempt = self.attempts[attempt_id]
        challenge = self.challenges[attempt.challenge_id]
        
        if attempt.hints_used >= len(challenge.hints):
            return "No more hints available."
        
        hint = challenge.hints[attempt.hints_used]
        attempt.hints_used += 1
        
        return hint
    
    def _validate_answer(self, challenge: Challenge, answer: Any) -> bool:
        """Validate if the submitted answer is correct."""
        if challenge.expected_answer:
            # Direct comparison for challenges with expected answer
            return str(answer).lower() == str(challenge.expected_answer).lower()
        else:
            # For simulation-based challenges, run a simulation and check result
            return self._validate_simulation_answer(challenge, answer)
    
    def _validate_stage_answer(
        self, stage: ChallengeStage, answer: Any
    ) -> bool:
        """Validate if the submitted answer is correct for a stage."""
        if "expected_output" in stage.solution:
            return answer == stage.solution["expected_output"]
        
        # In a real implementation, this would be more complex
        # and might involve running simulations
        try:
            # Check if simulation exists
            simulation_result = self.engine.run_simulation(
                stage.simulation_id,
                {"user_answer": answer, **(stage.parameters or {})}
            )
            # Actual implementation would validate the answer against simulation
            return "success" in simulation_result and simulation_result["success"]
        except Exception as e:
            logger.error(f"Error validating stage answer: {e}")
            return False  # Return false if simulation fails
    
    def _validate_simulation_answer(
        self, challenge: Challenge, answer: Any
    ) -> bool:
        """Validate an answer by running a simulation."""
        if not challenge.simulation_ids:
            logger.warning(f"Challenge {challenge.id} has no simulation_ids")
            return False
            
        try:
            # Check that the simulation exists
            simulation_id = challenge.simulation_ids[0]
            simulation_result = self.engine.run_simulation(
                simulation_id,
                {"user_answer": answer, **(challenge.parameters or {})}
            )
            # Actual implementation would check simulation result
            return "success" in simulation_result and simulation_result["success"]
        except Exception as e:
            logger.error(f"Error validating simulation answer: {e}")
            return False
    
    def _calculate_score(
        self, challenge: Challenge, attempt: ChallengeAttempt, success: bool
    ) -> int:
        """Calculate score based on completion, time taken, and hints used."""
        if not success:
            return 0
        
        base_score = challenge.points
        
        # Deduct points for hints used
        hint_penalty = attempt.hints_used * (base_score * 0.1)  # 10% per hint
        
        # Deduct points for time taken (only for timed challenges)
        time_penalty = 0
        if (challenge.type == ChallengeType.TIMED and 
                challenge.time_limit_seconds):
            time_ratio = (attempt.time_spent_seconds / 
                         challenge.time_limit_seconds)
            # Faster completion = higher score
            time_penalty = base_score * 0.5 * min(1, time_ratio)
        
        final_score = max(0, int(base_score - hint_penalty - time_penalty))
        return final_score
    
    def _get_next_challenge(self, current_challenge_id: str) -> Optional[str]:
        """Get the next logical challenge after completing the current one."""
        # This could be expanded to create proper learning paths
        # For now, just a simple implementation
        all_challenges = list(self.challenges.keys())
        try:
            current_index = all_challenges.index(current_challenge_id)
            if current_index < len(all_challenges) - 1:
                return all_challenges[current_index + 1]
        except ValueError:
            pass
        
        return None
    
    def execute_challenge_simulation(
        self, challenge_id: str, attempt_id: str, params: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Execute a simulation as part of a challenge."""
        if challenge_id not in self.challenges:
            raise ValueError(f"Challenge {challenge_id} not found")
        
        if attempt_id not in self.attempts:
            raise ValueError(f"Challenge attempt {attempt_id} not found")
        
        challenge = self.challenges[challenge_id]
        attempt = self.attempts[attempt_id]
        
        # Handle parameters
        simulation_params = {}
        if params:
            simulation_params.update(params)
        
        # Determine simulation ID early to use in parameter transformations
        simulation_id = None
        if challenge.type == ChallengeType.MULTI_STAGE:
            if attempt.current_stage_index < len(challenge.stages):
                stage = challenge.stages[attempt.current_stage_index]
                simulation_id = stage.simulation_id
            else:
                raise ValueError("Challenge has no more stages")
        else:
            # For single simulation challenges
            if not challenge.simulation_ids:
                raise ValueError("Challenge has no associated simulations")
            
            simulation_id = challenge.simulation_ids[0]
            
            # For blind challenges, use the hidden simulation
            if (challenge.type == ChallengeType.BLIND and 
                    challenge.hidden_parameters and
                    "actual_simulation" in challenge.hidden_parameters):
                simulation_id = challenge.hidden_parameters["actual_simulation"]
        
        # Transform parameters based on simulation type
        if challenge.parameters:
            if simulation_id == "hastad-attack":
                # Transform public_key to exponent for Hastad attack
                if "public_key" in challenge.parameters:
                    if "e" in challenge.parameters["public_key"]:
                        simulation_params["exponent"] = challenge.parameters["public_key"]["e"]
                    if "n" in challenge.parameters["public_key"]:
                        simulation_params["modulus"] = challenge.parameters["public_key"]["n"]
                if "ciphertext" in challenge.parameters:
                    simulation_params["message"] = int(challenge.parameters["ciphertext"])
            elif simulation_id == "mitm-attack":
                # Transform mode to intercept_mode for MITM attack
                if "mode" in challenge.parameters:
                    simulation_params["intercept_mode"] = challenge.parameters["mode"]
                    # Remove the original mode parameter to avoid duplicates
                    if "mode" in simulation_params:
                        del simulation_params["mode"]
                # Update other parameters as needed
                simulation_params.update({k: v for k, v in challenge.parameters.items() if k != "mode"})
            else:
                # For other simulation types, just update params
                simulation_params.update(challenge.parameters)
        
        # Add stage-specific parameters for multi-stage challenges
        if challenge.type == ChallengeType.MULTI_STAGE:
            stage = challenge.stages[attempt.current_stage_index]
            if stage.parameters:
                # Apply the same transformations for stage parameters
                if simulation_id == "mitm-attack" and "mode" in stage.parameters:
                    simulation_params["intercept_mode"] = stage.parameters["mode"]
                    stage_params = {k: v for k, v in stage.parameters.items() if k != "mode"}
                    simulation_params.update(stage_params)
                else:
                    simulation_params.update(stage.parameters)
        
        # Execute the simulation
        result = self.engine.run_simulation(simulation_id, simulation_params)
        
        # For blind challenges, obscure certain parts of the result
        if challenge.type == ChallengeType.BLIND:
            result = self._obscure_blind_result(result)
        
        # Check if result is a Pydantic model and convert it to a dictionary if needed
        if hasattr(result, "model_dump"):
            # For Pydantic v2.x
            return result.model_dump()
        elif hasattr(result, "dict"):
            # For Pydantic v1.x
            return result.dict()
        
        return result
    
    def _obscure_blind_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Obscure parts of the result for blind challenges."""
        # Create a copy to avoid modifying the original
        obscured = result.copy()
        
        # Remove or obfuscate revealing information
        if "simulation_type" in obscured:
            obscured.pop("simulation_type")
        
        if "steps" in obscured:
            # Keep steps but remove revealing names
            for step in obscured["steps"]:
                if "name" in step:
                    step["name"] = "Mystery Step"
        
        return obscured