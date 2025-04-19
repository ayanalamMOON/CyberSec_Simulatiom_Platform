import React from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  className = '',
  type = 'button',
}) => {
  // Style variants
  const variantStyles = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white',
    secondary: 'bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white',
    outline: 'border-2 border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-opacity-10 hover:text-primary-700',
    ghost: 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 dark:hover:bg-opacity-20',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
  };

  // Size variants
  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  // Animation variants
  const buttonVariants = {
    hover: {
      scale: 1.03,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    },
    tap: { 
      scale: 0.97,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      } 
    },
    disabled: {
      opacity: 0.6,
    }
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantStyles[variant]} 
        ${sizeStyles[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''} 
        rounded-lg font-medium transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50
        ${className}
      `}
      whileHover={disabled ? {} : 'hover'}
      whileTap={disabled ? {} : 'tap'}
      variants={buttonVariants}
      initial={disabled ? 'disabled' : 'initial'}
    >
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </motion.button>
  );
};

export default Button;