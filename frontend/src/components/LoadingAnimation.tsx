import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt } from 'react-icons/fa';

interface LoadingAnimationProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  message = 'Loading...', 
  size = 'medium' 
}) => {
  // Size configuration
  const iconSize = {
    small: 24,
    medium: 40,
    large: 64
  };
  
  const fontSize = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl'
  };
  
  // Animation variants
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const pulseVariants = {
    initial: { 
      opacity: 0.3,
      scale: 0.9
    },
    animate: { 
      opacity: [0.3, 1, 0.3], 
      scale: [0.9, 1.1, 0.9],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut"
      }
    }
  };
  
  const rotateVariants = {
    animate: { 
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 3,
        ease: "linear"
      }
    }
  };
  
  const textVariants = {
    initial: { opacity: 0.5 },
    animate: { 
      opacity: [0.5, 1, 0.5],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="relative">
        {/* Outer pulse effect */}
        <motion.div
          variants={pulseVariants}
          className="absolute inset-0 bg-primary-500 dark:bg-primary-600 rounded-full opacity-20"
          style={{ 
            width: iconSize[size] * 1.5, 
            height: iconSize[size] * 1.5,
            left: -iconSize[size] * 0.25,
            top: -iconSize[size] * 0.25
          }}
        />
        
        {/* Inner rotating icon */}
        <motion.div
          variants={rotateVariants}
          className="relative z-10 text-primary-600 dark:text-primary-400"
        >
          <FaShieldAlt size={iconSize[size]} />
        </motion.div>
      </div>
      
      {message && (
        <motion.p 
          variants={textVariants}
          className={`mt-4 text-gray-700 dark:text-gray-300 font-medium ${fontSize[size]}`}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
};

export default LoadingAnimation;