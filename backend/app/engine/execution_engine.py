"""
Main simulation execution engine that coordinates all simulation runs.
"""
import logging
import importlib
from typing import Dict, Any, Optional, List, Tuple, Union, Callable
import asyncio
import time

from ..models.simulation import SimulationStep, SimulationResult
from .task_manager import TaskManager
from .simulation_runner import SimulationRunner

logger = logging.getLogger(__name__)


class SimulationEngine:
    """
    Central execution engine for all cybersecurity simulations.
    
    This class handles:
    1. Loading and executing simulations
    2. Managing simulation state and progress
    3. Handling background tasks for long-running simulations
    4. Caching results when appropriate
    5. Providing unified error handling
    """
    
    # Use a class variable to ensure task_manager is shared across all instances
    _instance = None
    _task_manager = None
    
    def __new__(cls):
        """Implement singleton pattern to ensure only one engine instance exists."""
        if cls._instance is None:
            cls._instance = super(SimulationEngine, cls).__new__(cls)
            cls._task_manager = TaskManager()
        return cls._instance
    
    def __init__(self):
        """Initialize the simulation engine with task manager and runner registry."""
        # Use the class-level task manager if it exists
        self.task_manager = self.__class__._task_manager or TaskManager()
        self.runners: Dict[str, SimulationRunner] = {}
        self.results_cache: Dict[str, Dict[str, Any]] = {}
        self.registered_simulations: Dict[str, Dict[str, Any]] = {}
        
        # Register built-in simulations
        self._register_built_in_simulations()
    
    def _register_built_in_simulations(self):
        """Register the built-in simulations that come with the platform."""
        self.register_simulation(
            simulation_id="hastad-attack",
            module_path="simulations.hastad_attack",
            runner_class=None,  # Will use default runner
            description="Håstad's Broadcast Attack on RSA encryption"
        )
        self.register_simulation(
            simulation_id="cbc-padding-oracle",
            module_path="simulations.cbc_padding_oracle",
            runner_class=None,
            description="CBC Padding Oracle Attack simulation"
        )
        # More simulations can be registered here as they are developed
    
    def register_simulation(self, 
                         simulation_id: str, 
                         module_path: str,
                         runner_class: Optional[str] = None,
                         description: str = "",
                         is_async: bool = False,
                         cache_results: bool = True) -> None:
        """
        Register a new simulation with the engine.
        
        Args:
            simulation_id: Unique identifier for the simulation
            module_path: Import path to the simulation module
            runner_class: Optional custom runner class name
            description: Human-readable description
            is_async: Whether the simulation should run asynchronously
            cache_results: Whether to cache simulation results
        """
        self.registered_simulations[simulation_id] = {
            "id": simulation_id,
            "module_path": module_path,
            "runner_class": runner_class,
            "description": description,
            "is_async": is_async,
            "cache_results": cache_results
        }
        
        logger.info(f"Registered simulation: {simulation_id}")
    
    def get_runner(self, simulation_id: str) -> SimulationRunner:
        """
        Get or create a runner for the specified simulation.
        
        Args:
            simulation_id: The ID of the simulation to run
            
        Returns:
            A SimulationRunner instance for the requested simulation
            
        Raises:
            ValueError: If the simulation is not registered
        """
        # Check if runner already exists
        if simulation_id in self.runners:
            return self.runners[simulation_id]
        
        # Check if simulation is registered
        if simulation_id not in self.registered_simulations:
            raise ValueError(f"Simulation '{simulation_id}' is not registered")
        
        # Get simulation details
        sim_info = self.registered_simulations[simulation_id]
        
        # Create runner
        if sim_info["runner_class"]:
            # Load custom runner class if specified
            module_path, class_name = sim_info["runner_class"].rsplit(".", 1)
            module = importlib.import_module(module_path)
            runner_class = getattr(module, class_name)
            runner = runner_class(simulation_id, sim_info["module_path"])
        else:
            # Use default runner
            runner = SimulationRunner(simulation_id, sim_info["module_path"])
        
        # Store runner for reuse
        self.runners[simulation_id] = runner
        return runner
    
    def run_simulation(self, 
                     simulation_id: str, 
                     params: Dict[str, Any],
                     run_async: bool = False) -> Union[Dict[str, Any], str]:
        """
        Run a simulation with the given parameters.
        
        Args:
            simulation_id: The ID of the simulation to run
            params: Parameters to pass to the simulation
            run_async: Force asynchronous execution even for sync simulations
            
        Returns:
            Either the simulation result or a task_id if run asynchronously
            
        Raises:
            ValueError: If the simulation is not registered
        """
        # Check if simulation is registered
        if simulation_id not in self.registered_simulations:
            raise ValueError(f"Simulation '{simulation_id}' is not registered")
        
        # Create cache key based on simulation ID and parameters
        cache_key = f"{simulation_id}:{hash(str(sorted(params.items())))}"
        
        # Check cache if enabled for this simulation
        sim_info = self.registered_simulations[simulation_id]
        if sim_info["cache_results"] and cache_key in self.results_cache:
            logger.info(f"Returning cached result for {simulation_id}")
            return self.results_cache[cache_key]
        
        # Determine if should run async
        should_run_async = run_async or sim_info["is_async"]
        
        # Get runner
        runner = self.get_runner(simulation_id)
        
        if should_run_async:
            # Run asynchronously via task manager
            task_id = self.task_manager.create_task(
                runner.run,
                kwargs={"params": params}
            )
            return {"task_id": task_id}
        else:
            # Run synchronously
            try:
                start_time = time.time()
                result = runner.run(params)
                duration = time.time() - start_time
                logger.info(f"Simulation {simulation_id} completed in {duration:.2f}s")
                
                # Cache result if enabled
                if sim_info["cache_results"]:
                    self.results_cache[cache_key] = result
                
                return result
            except Exception as e:
                logger.error(f"Error running simulation {simulation_id}: {str(e)}")
                raise
    
    async def run_simulation_async(self, 
                                simulation_id: str, 
                                params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run a simulation asynchronously.
        
        Args:
            simulation_id: The ID of the simulation to run
            params: Parameters to pass to the simulation
            
        Returns:
            The simulation result
        """
        # Get runner
        runner = self.get_runner(simulation_id)
        
        # Run in thread pool to avoid blocking the event loop
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, 
            lambda: runner.run(params)
        )
    
    def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """
        Get the status of an async task.
        
        Args:
            task_id: The ID of the task to check
            
        Returns:
            Task status information
        """
        return self.task_manager.get_task_status(task_id)
    
    def clear_cache(self, simulation_id: Optional[str] = None) -> None:
        """
        Clear the results cache for a simulation or all simulations.
        
        Args:
            simulation_id: Optional ID to clear cache for specific simulation
        """
        if simulation_id:
            # Clear cache for specific simulation
            keys_to_remove = [k for k in self.results_cache if k.startswith(f"{simulation_id}:")]
            for key in keys_to_remove:
                del self.results_cache[key]
            logger.info(f"Cleared cache for simulation {simulation_id}")
        else:
            # Clear all cache
            self.results_cache.clear()
            logger.info("Cleared all simulation cache")