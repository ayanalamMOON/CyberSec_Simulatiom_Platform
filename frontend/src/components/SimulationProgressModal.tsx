import React, { useState } from 'react';
import TaskStatusTracker from './TaskStatusTracker';
import AsyncSimulationResultFetcher from './AsyncSimulationResultFetcher';

interface SimulationProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  simulationId: string;
  params: any;
  onResult: (result: any) => void;
}

const SimulationProgressModal: React.FC<SimulationProgressModalProps> = ({
  isOpen,
  onClose,
  taskId,
  simulationId,
  params,
  onResult
}) => {
  const [showResultFetcher, setShowResultFetcher] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">Simulation Progress</h2>
        <TaskStatusTracker
          taskId={taskId}
          onComplete={() => setShowResultFetcher(true)}
          onError={() => setShowResultFetcher(false)}
        />
        {showResultFetcher && (
          <AsyncSimulationResultFetcher
            simulationId={simulationId}
            params={params}
            show={showResultFetcher}
            onResult={onResult}
          />
        )}
      </div>
    </div>
  );
};

export default SimulationProgressModal;
