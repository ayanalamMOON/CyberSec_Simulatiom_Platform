"""
Task manager for handling background tasks and asynchronous simulations.
"""
import logging
import threading
import uuid
import time
from typing import Dict, Any, Callable, Optional, List
from enum import Enum
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)


class TaskStatus(str, Enum):
    """Enum for task status states."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Task:
    """Class representing a background task."""
    
    def __init__(self, task_id: str, func: Callable, args: List = None, kwargs: Dict = None):
        """
        Initialize a task.
        
        Args:
            task_id: Unique identifier for the task
            func: The function to execute
            args: Positional arguments to pass to the function
            kwargs: Keyword arguments to pass to the function
        """
        self.task_id = task_id
        self.func = func
        self.args = args or []
        self.kwargs = kwargs or {}
        self.status = TaskStatus.PENDING
        self.result = None
        self.error = None
        self.start_time: Optional[float] = None
        self.end_time: Optional[float] = None
        self.progress = 0
        self.message = "Task initialized"
    
    def run(self):
        """Execute the task function."""
        self.status = TaskStatus.RUNNING
        self.start_time = time.time()
        
        try:
            # Execute the function
            self.result = self.func(*self.args, **self.kwargs)
            self.status = TaskStatus.COMPLETED
        except Exception as e:
            # Handle any exceptions
            self.status = TaskStatus.FAILED
            self.error = str(e)
            logger.error(f"Task {self.task_id} failed: {str(e)}")
        
        self.end_time = time.time()
    
    def cancel(self):
        """Cancel the task if it hasn't started yet."""
        if self.status == TaskStatus.PENDING:
            self.status = TaskStatus.CANCELLED
            return True
        return False
    
    def get_info(self) -> Dict[str, Any]:
        """
        Get information about the task.
        
        Returns:
            Dictionary with task information
        """
        info = {
            "task_id": self.task_id,
            "status": self.status,
            "progress": self.progress,
            "message": self.message
        }
        
        if self.start_time:
            info["start_time"] = self.start_time
            
            if self.status == TaskStatus.RUNNING:
                info["elapsed_time"] = time.time() - self.start_time
            
        if self.end_time:
            info["end_time"] = self.end_time
            info["execution_time"] = self.end_time - self.start_time
            
        if self.status == TaskStatus.COMPLETED:
            info["has_result"] = True
            
        if self.error:
            info["error"] = self.error
            
        return info


class TaskManager:
    """
    Manager for handling background tasks and asynchronous simulations.
    
    This class provides:
    1. Task creation and tracking
    2. Thread pool management
    3. Progress reporting
    4. Result retrieval
    """
    
    def __init__(self, max_workers: int = 4):
        """
        Initialize the task manager.
        
        Args:
            max_workers: Maximum number of worker threads
        """
        self.tasks: Dict[str, Task] = {}
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.lock = threading.RLock()  # Use recursive lock for nested acquire/release
        
    def create_task(self, func: Callable, args: List = None, kwargs: Dict = None) -> str:
        """
        Create and start a new background task.
        
        Args:
            func: The function to execute
            args: Positional arguments to pass to the function
            kwargs: Keyword arguments to pass to the function
            
        Returns:
            Task ID for the new task
        """
        # Generate unique ID
        task_id = str(uuid.uuid4())
        
        # Create task
        task = Task(task_id, func, args, kwargs)
        
        with self.lock:
            # Store task
            self.tasks[task_id] = task
            
            # Submit task to executor
            self.executor.submit(task.run)
            
        logger.info(f"Created task {task_id}")
        return task_id
    
    def get_task(self, task_id: str) -> Optional[Task]:
        """
        Get a task by ID.
        
        Args:
            task_id: The ID of the task
            
        Returns:
            The task or None if not found
        """
        with self.lock:
            return self.tasks.get(task_id)
    
    def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """
        Get the status of a task.
        
        Args:
            task_id: The ID of the task
            
        Returns:
            Dictionary with task status information
            
        Raises:
            ValueError: If task not found
        """
        task = self.get_task(task_id)
        if not task:
            raise ValueError(f"Task {task_id} not found")
        
        return task.get_info()
    
    def get_task_result(self, task_id: str) -> Any:
        """
        Get the result of a completed task.
        
        Args:
            task_id: The ID of the task
            
        Returns:
            The task result
            
        Raises:
            ValueError: If task not found or not completed
        """
        task = self.get_task(task_id)
        if not task:
            raise ValueError(f"Task {task_id} not found")
        
        if task.status != TaskStatus.COMPLETED:
            raise ValueError(f"Task {task_id} is not completed (status: {task.status})")
        
        return task.result
    
    def cancel_task(self, task_id: str) -> bool:
        """
        Cancel a pending task.
        
        Args:
            task_id: The ID of the task
            
        Returns:
            True if the task was cancelled, False otherwise
        """
        task = self.get_task(task_id)
        if not task:
            raise ValueError(f"Task {task_id} not found")
        
        return task.cancel()
    
    def cleanup_completed_tasks(self, max_age: float = 3600) -> int:
        """
        Remove old completed tasks to free memory.
        
        Args:
            max_age: Maximum age in seconds for completed tasks
            
        Returns:
            Number of tasks removed
        """
        current_time = time.time()
        to_remove = []
        
        with self.lock:
            for task_id, task in self.tasks.items():
                if task.status in [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED]:
                    if task.end_time and (current_time - task.end_time) > max_age:
                        to_remove.append(task_id)
            
            # Remove tasks
            for task_id in to_remove:
                del self.tasks[task_id]
        
        logger.info(f"Cleaned up {len(to_remove)} completed tasks")
        return len(to_remove)
    
    def shutdown(self, wait: bool = True):
        """
        Shutdown the task manager.
        
        Args:
            wait: Whether to wait for pending tasks to complete
        """
        self.executor.shutdown(wait=wait)
        logger.info("Task manager shut down")