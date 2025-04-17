"""
Simulation runner for executing individual simulations.
"""
import importlib
import logging
import time
import traceback
from typing import Dict, Any, List, Optional, Callable

from ..models.simulation import SimulationStep

logger = logging.getLogger(__name__)


class SimulationRunner:
    """
    Runner class for executing individual simulation modules.
    
    This class handles:
    1. Loading simulation modules dynamically
    2. Executing simulations with provided parameters
    3. Progress tracking and reporting
    4. Detailed logging and profiling
    """
    
    def __init__(self, simulation_id: str, module_path: str):
        """
        Initialize a simulation runner.
        
        Args:
            simulation_id: The unique identifier for this simulation
            module_path: Import path to the simulation module
        """
        self.simulation_id = simulation_id
        self.module_path = module_path
        self.module = None
        self.progress_callback: Optional[Callable[[int, str], None]] = None
        self.steps: List[SimulationStep] = []
    
    def load_module(self) -> Any:
        """
        Dynamically load the simulation module.
        
        Returns:
            Loaded simulation module
        
        Raises:
            ImportError: If the module cannot be loaded
        """
        if self.module is not None:
            return self.module
            
        try:
            # Try to import directly first
            self.module = importlib.import_module(self.module_path)
        except ImportError:
            # If direct import fails, try relative import
            try:
                self.module = importlib.import_module(f"..{self.module_path}", package=__name__)
            except ImportError:
                # Try as absolute import from the root project path
                try:
                    # Import the module from project root (one level up from app)
                    # This is needed because simulations are at the project root level
                    import sys
                    import os
                    
                    # Add the backend directory to path if not already there
                    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
                    if backend_dir not in sys.path:
                        sys.path.insert(0, backend_dir)
                        
                    # Now try importing again
                    self.module = importlib.import_module(self.module_path)
                except ImportError as e:
                    logger.error(f"Could not import module {self.module_path}: {str(e)}")
                    raise
        
        logger.info(f"Successfully loaded module for simulation: {self.simulation_id}")
        return self.module
    
    def set_progress_callback(self, callback: Callable[[int, str], None]) -> None:
        """
        Set a callback function to report progress during simulation.
        
        Args:
            callback: A function that accepts a progress percentage and message
        """
        self.progress_callback = callback
    
    def report_progress(self, percentage: int, message: str) -> None:
        """
        Report current progress through the callback if set.
        
        Args:
            percentage: Progress percentage (0-100)
            message: Progress message to report
        """
        if self.progress_callback:
            self.progress_callback(percentage, message)
        
        # Always log progress
        logger.debug(f"Simulation {self.simulation_id} progress: {percentage}% - {message}")
    
    def run(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run the simulation with the provided parameters.
        
        Args:
            params: Parameters to pass to the simulation
        
        Returns:
            Simulation results
            
        Raises:
            Exception: If the simulation fails
        """
        start_time = time.time()
        
        # Load the module
        module = self.load_module()
        
        # Reset steps
        self.steps = []
        
        try:
            # Check if module has run_simulation function
            if hasattr(module, "run_simulation"):
                # Standard simulation function
                self.report_progress(0, "Starting simulation")
                
                # Run the simulation
                result = module.run_simulation(**params)
                
                self.report_progress(100, "Simulation completed successfully")
                
                # Measure execution time
                duration = time.time() - start_time
                logger.info(f"Simulation {self.simulation_id} completed in {duration:.2f}s")
                
                return result
                
            # If no run_simulation function, look for other standard entry points
            elif hasattr(module, "execute"):
                self.report_progress(0, "Starting simulation")
                result = module.execute(**params)
                self.report_progress(100, "Simulation completed successfully")
                return result
                
            # If we reach here, no standard entry point was found
            else:
                error_msg = f"No entry point found in module {self.module_path}"
                logger.error(error_msg)
                raise RuntimeError(error_msg)
                
        except Exception as e:
            # Handle and log any exceptions during execution
            error_msg = f"Error running simulation {self.simulation_id}: {str(e)}"
            stack_trace = traceback.format_exc()
            logger.error(f"{error_msg}\n{stack_trace}")
            
            # Create error result
            return {
                "success": False,
                "error": str(e),
                "stack_trace": stack_trace,
                "execution_time": time.time() - start_time
            }
    
    def profile(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run the simulation with profiling enabled.
        
        Args:
            params: Parameters to pass to the simulation
            
        Returns:
            Simulation results with profiling information
        """
        import cProfile
        import pstats
        import io
        
        # Create a profile object
        profiler = cProfile.Profile()
        
        # Start profiling
        profiler.enable()
        
        # Run the simulation
        result = self.run(params)
        
        # Stop profiling
        profiler.disable()
        
        # Collect profiling statistics
        s = io.StringIO()
        ps = pstats.Stats(profiler, stream=s).sort_stats('cumulative')
        ps.print_stats(20)  # Print top 20 functions
        
        # Add profiling info to result
        if isinstance(result, dict):
            result["profiling"] = s.getvalue()
        
        return result