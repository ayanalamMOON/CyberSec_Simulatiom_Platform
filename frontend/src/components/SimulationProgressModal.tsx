import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskStatusTracker from './TaskStatusTracker';
import AsyncSimulationResultFetcher from './AsyncSimulationResultFetcher';
import Button from './Button';
import { FaTimes, FaSync } from 'react-icons/fa';

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

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
  
  const modalVariants = {
    hidden: { 
      y: "-50px",
      opacity: 0,
      scale: 0.9
    },
    visible: { 
      y: "0",
      opacity: 1,
      scale: 1,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 300
      }
    },
    exit: { 
      y: "50px",
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
        >
          <motion.div 
            className="bg-white dark:bg-darksurface rounded-xl shadow-xl w-full max-w-lg overflow-hidden relative"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-900 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Simulation Progress</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-white hover:text-gray-200 focus:outline-none"
                onClick={onClose}
                aria-label="Close modal"
              >
                <FaTimes size={20} />
              </motion.button>
            </div>
            
            <div className="p-6 dark:text-white">
              <TaskStatusTracker
                taskId={taskId}
                onComplete={() => setShowResultFetcher(true)}
                onError={() => setShowResultFetcher(false)}
              />
              
              {showResultFetcher && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AsyncSimulationResultFetcher
                      simulationId={simulationId}
                      params={params}
                      show={showResultFetcher}
                      onResult={onResult}
                    />
                  </motion.div>
                </AnimatePresence>
              )}
              
              <motion.div 
                className="flex justify-end mt-6 space-x-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="outline"
                  onClick={onClose}
                  icon={<FaTimes />}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowResultFetcher(false);
                    // Add any reset functionality here
                    setTimeout(() => setShowResultFetcher(true), 500);
                  }}
                  icon={<FaSync />}
                  disabled={!showResultFetcher}
                >
                  Reset
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SimulationProgressModal;
