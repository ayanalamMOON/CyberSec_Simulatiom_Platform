import React, { useEffect, useState } from 'react';
import { simulationApi, TaskStatusResponse, SimulationStatus } from '../api/simulationApi';

interface TaskStatusTrackerProps {
  taskId: string;
  pollingInterval?: number; // in milliseconds
  onComplete?: (taskId: string) => void;
  onError?: (error: string) => void;
}

const TaskStatusTracker: React.FC<TaskStatusTrackerProps> = ({
  taskId,
  pollingInterval = 2000,
  onComplete,
  onError
}) => {
  const [status, setStatus] = useState<TaskStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Format time in seconds with 2 decimal places
  const formatTime = (timeInSeconds?: number) => {
    if (timeInSeconds === undefined) return 'N/A';
    return `${timeInSeconds.toFixed(2)}s`;
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const taskStatus = await simulationApi.getTaskStatus(taskId);
        setStatus(taskStatus);

        // If task is completed or failed, stop polling
        if (
          taskStatus.status === SimulationStatus.COMPLETED ||
          taskStatus.status === SimulationStatus.FAILED ||
          taskStatus.status === SimulationStatus.CANCELLED
        ) {
          setIsPolling(false);
          
          if (taskStatus.status === SimulationStatus.COMPLETED && onComplete) {
            onComplete(taskId);
          }
          
          if (taskStatus.status === SimulationStatus.FAILED && onError && taskStatus.error) {
            onError(taskStatus.error);
          }
        }
      } catch (err) {
        setError(`Failed to fetch task status: ${err instanceof Error ? err.message : String(err)}`);
        setIsPolling(false);
        if (onError) onError(`Failed to fetch task status: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    // Initial fetch
    pollStatus();

    // Set up polling interval
    if (isPolling) {
      intervalId = setInterval(pollStatus, pollingInterval);
    }

    // Clean up interval on component unmount or when polling stops
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [taskId, pollingInterval, isPolling, onComplete, onError]);

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2">Initializing task...</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <div className="mb-2">
        <span className="font-bold">Task ID:</span> {status.task_id}
      </div>
      
      <div className="mb-4">
        <span className="font-bold">Status:</span>{' '}
        <span
          className={`px-2 py-1 rounded text-sm font-semibold ${
            status.status === SimulationStatus.COMPLETED ? 'bg-green-100 text-green-800' :
            status.status === SimulationStatus.RUNNING ? 'bg-blue-100 text-blue-800' :
            status.status === SimulationStatus.FAILED ? 'bg-red-100 text-red-800' :
            status.status === SimulationStatus.CANCELLED ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}
        >
          {status.status}
        </span>
      </div>

      {status.message && (
        <div className="mb-2">
          <span className="font-bold">Message:</span> {status.message}
        </div>
      )}

      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              status.status === SimulationStatus.COMPLETED ? 'bg-green-500' :
              status.status === SimulationStatus.FAILED ? 'bg-red-500' :
              status.status === SimulationStatus.CANCELLED ? 'bg-gray-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${status.progress}%` }}
          ></div>
        </div>
        <div className="text-xs text-right mt-1">{status.progress}%</div>
      </div>

      {status.start_time && (
        <div className="text-sm text-gray-500">
          <p>Started: {new Date(status.start_time * 1000).toLocaleString()}</p>
          
          {status.end_time && (
            <p>Completed: {new Date(status.end_time * 1000).toLocaleString()}</p>
          )}
          
          {status.execution_time !== undefined && (
            <p>Execution time: {formatTime(status.execution_time)}</p>
          )}
        </div>
      )}

      {status.error && (
        <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {status.error}</span>
        </div>
      )}
    </div>
  );
};

export default TaskStatusTracker;