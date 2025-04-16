"""
Service layer for simulation functionality.
"""
from typing import List, Dict, Any
import importlib
import logging
from ..models.simulation import (
    SimulationInfo, 
    HastadAttackRequest, 
    HastadAttackResponse,
    SimulationStep
)
from ..engine.execution_engine import SimulationEngine

logger = logging.getLogger(__name__)


class SimulationService:
    """Service for handling simulation operations."""
    
    def __init__(self):
        """Initialize the simulation service with available simulations."""
        # Simulations catalog - can be expanded as more are added
        self.simulations = {
            "hastad-attack": {
                "id": "hastad-attack",
                "name": "Håstad's Broadcast Attack",
                "description": "A cryptographic attack on RSA when the same message is encrypted with the same low exponent to multiple recipients.",
                "complexity": "Medium",
                "tags": ["RSA", "Cryptography", "Number Theory", "CRT"]
            },
            "cbc-padding-oracle": {
                "id": "cbc-padding-oracle",
                "name": "CBC Padding Oracle Attack",
                "description": "Explore how padding oracle vulnerabilities can be exploited to decrypt CBC mode ciphertexts without knowing the key.",
                "complexity": "Hard",
                "tags": ["AES", "Block Cipher", "Oracle Attack", "Padding"]
            },
            "mitm-visualization": {
                "id": "mitm-visualization",
                "name": "Man-in-the-Middle Attack",
                "description": "Visualize how MITM attacks work and how they can compromise otherwise secure communications.",
                "complexity": "Easy",
                "tags": ["Network", "TLS", "Protocol"]
            },
            "wifi-cracking": {
                "id": "wifi-cracking",
                "name": "WiFi Password Cracking",
                "description": "Simulation of WiFi security vulnerabilities and how they can be exploited.",
                "complexity": "Medium",
                "tags": ["Wireless", "WPA2", "Network"]
            },
            "xss-attack": {
                "id": "xss-attack",
                "name": "Cross-Site Scripting (XSS)",
                "description": "Learn how XSS vulnerabilities work and how they can be prevented.",
                "complexity": "Easy",
                "tags": ["Web Security", "JavaScript", "Injection"]
            },
            "sql-injection": {
                "id": "sql-injection",
                "name": "SQL Injection",
                "description": "Interactive demonstration of SQL injection attacks and their impact on database security.",
                "complexity": "Medium",
                "tags": ["Web Security", "Database", "Injection"]
            }
        }
        
        # Initialize the simulation execution engine
        self.engine = SimulationEngine()
    
    def get_all_simulations(self) -> List[SimulationInfo]:
        """Get information about all available simulations."""
        return [SimulationInfo(**sim) for sim in self.simulations.values()]
    
    def get_simulation_by_id(self, simulation_id: str) -> SimulationInfo:
        """Get detailed information about a specific simulation."""
        if simulation_id not in self.simulations:
            raise ValueError(f"Simulation '{simulation_id}' not found")
        return SimulationInfo(**self.simulations[simulation_id])
    
    def run_hastad_attack(self, request: HastadAttackRequest) -> HastadAttackResponse:
        """
        Run the Håstad's attack simulation using the simulation engine.
        
        Args:
            request: The parameters for the simulation
            
        Returns:
            The simulation results
        """
        try:
            # Convert request to dictionary of parameters
            params = request.dict()
            
            # Run the simulation through the engine
            result = self.engine.run_simulation(
                simulation_id="hastad-attack",
                params=params
            )
            
            return result
        except Exception as e:
            logger.error(f"Error running Hastad attack simulation: {str(e)}")
            raise
            
    def run_simulation_async(self, simulation_id: str, params: Dict[str, Any]) -> Dict[str, str]:
        """
        Run a simulation asynchronously.
        
        Args:
            simulation_id: The ID of the simulation to run
            params: The parameters for the simulation
            
        Returns:
            A dictionary with the task ID
        """
        try:
            result = self.engine.run_simulation(
                simulation_id=simulation_id,
                params=params,
                run_async=True
            )
            return result
        except Exception as e:
            logger.error(f"Error running simulation {simulation_id} asynchronously: {str(e)}")
            raise
            
    def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """
        Get the status of an asynchronous task.
        
        Args:
            task_id: The ID of the task
            
        Returns:
            Task status information
        """
        return self.engine.get_task_status(task_id)