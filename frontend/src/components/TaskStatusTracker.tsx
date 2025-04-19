import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { simulationApi, TaskStatusResponse, SimulationStatus } from '../api/simulationApi';
import LoadingAnimation from './LoadingAnimation';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaTimesCircle, 
  FaClock, 
  FaServer, 
  FaHourglass, 
  FaCalendar 
} from 'react-icons/fa';

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

  // Status specific icons and colors
  const getStatusDetails = (statusType: SimulationStatus | undefined) => {
    switch (statusType) {
      case SimulationStatus.COMPLETED:
        return { 
          icon: <FaCheckCircle size={24} />, 
          color: 'text-green-500',
          bgColor: 'bg-green-500',
          lightBg: 'bg-green-100 dark:bg-green-900 dark:bg-opacity-20'
        };
      case SimulationStatus.FAILED:
        return { 
          icon: <FaTimesCircle size={24} />, 
          color: 'text-red-500',
          bgColor: 'bg-red-500',
          lightBg: 'bg-red-100 dark:bg-red-900 dark:bg-opacity-20'
        };
      case SimulationStatus.CANCELLED:
        return { 
          icon: <FaExclamationTriangle size={24} />, 
          color: 'text-gray-500',
          bgColor: 'bg-gray-500',
          lightBg: 'bg-gray-100 dark:bg-gray-800'
        };
      case SimulationStatus.RUNNING:
        return { 
          icon: <FaHourglass className="animate-spin" size={24} />, 
          color: 'text-blue-500',
          bgColor: 'bg-blue-500',
          lightBg: 'bg-blue-100 dark:bg-blue-900 dark:bg-opacity-20'
        };
      default:
        return { 
          icon: <FaClock size={24} />, 
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500',
          lightBg: 'bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-20'
        };
    }
  };

  if (error) {
    return (
      <motion.div 
        className="bg-red-100 dark:bg-red-900 dark:bg-opacity-20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow-sm" 
        role="alert"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <FaExclamationTriangle className="mr-3 text-red-500" />
          <div>
            <strong className="font-bold">Error:</strong>
            <span className="ml-1">{error}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!status) {
    return (
      <motion.div 
        className="flex flex-col justify-center items-center p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <LoadingAnimation message="Initializing task..." size="medium" />
      </motion.div>
    );
  }

  const statusDetails = getStatusDetails(status.status);

  return (
    <motion.div 
      className="bg-white dark:bg-darksurface rounded-xl shadow-md p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center mb-4">
        <div className={`${statusDetails.color} mr-3`}>
          {statusDetails.icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold dark:text-white">
            Task Status: {status.status}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ID: {status.task_id}
          </p>
        </div>
      </div>
      
      {status.message && (
        <motion.div 
          className="mb-4 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-l-4 border-primary-500"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-gray-700 dark:text-gray-300">{status.message}</p>
        </motion.div>
      )}
      
      <div className="mb-5">
        <div className="flex justify-between items-center mb-1 text-sm font-medium">
          <span className="dark:text-gray-300">Progress</span>
          <motion.span 
            className={`font-bold ${statusDetails.color}`}
            key={status.progress}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {status.progress}%
          </motion.span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <motion.div
            className={`h-2.5 rounded-full ${statusDetails.bgColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${status.progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {status.start_time && (
          <div className="flex items-center">
            <FaCalendar className="mr-2 text-gray-400" />
            <span>Started: {new Date(status.start_time * 1000).toLocaleString()}</span>
          </div>
        )}
        
        {status.end_time && (
          <div className="flex items-center">
            <FaCalendar className="mr-2 text-gray-400" />
            <span>Completed: {new Date(status.end_time * 1000).toLocaleString()}</span>
          </div>
        )}
        
        {status.execution_time !== undefined && (
          <div className="flex items-center">
            <FaClock className="mr-2 text-gray-400" />
            <span>Execution time: {formatTime(status.execution_time)}</span>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {status.error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 bg-red-100 dark:bg-red-900 dark:bg-opacity-20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative overflow-hidden"
          >
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2 flex-shrink-0" />
              <span>{status.error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskStatusTracker;