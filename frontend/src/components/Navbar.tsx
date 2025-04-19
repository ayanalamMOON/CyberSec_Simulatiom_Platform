import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  FaShieldAlt, 
  FaHome, 
  FaFlask, 
  FaLock, 
  FaInfoCircle, 
  FaBars, 
  FaTimes, 
  FaMoon, 
  FaSun,
  FaTrophy
} from 'react-icons/fa';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white dark:bg-darksurface shadow-lg py-2' 
          : 'bg-primary-700 text-white py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className={`text-xl font-bold flex items-center ${
              scrolled ? 'text-primary-700 dark:text-white' : 'text-white'
            }`}
          >
            <motion.div
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="mr-2"
            >
              <FaShieldAlt className="h-8 w-8" />
            </motion.div>
            <span className="flex items-center">
              <span>CyberSim</span>
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="ml-1 text-secondary-500 font-light"
              >
                Platform
              </motion.span>
            </span>
          </Link>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`hidden md:flex items-center justify-center p-2 rounded-full 
              ${scrolled 
                ? 'bg-primary-100 dark:bg-darkborder text-primary-700 dark:text-primary-300' 
                : 'bg-primary-600 text-white'}`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </motion.button>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`mr-4 p-2 rounded-full
                ${scrolled 
                  ? 'bg-primary-100 dark:bg-darkborder text-primary-700 dark:text-primary-300' 
                  : 'bg-primary-600 text-white'}`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={18} />}
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded ${
                scrolled ? 'text-gray-800 dark:text-white' : 'text-white'
              } focus:outline-none`}
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </motion.button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { path: '/', text: 'Home', icon: <FaHome /> },
              { path: '/simulations', text: 'Simulations', icon: <FaFlask /> },
              { path: '/simulations/cbc-padding-oracle', text: 'CBC Padding Oracle', icon: <FaLock /> },
              { path: '/challenges', text: 'Challenges', icon: <FaTrophy /> },
              { path: '/about', text: 'About', icon: <FaInfoCircle /> },
            ].map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md transition-all duration-300 ${
                  location.pathname === item.path 
                    ? (scrolled 
                       ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                       : 'bg-primary-600 text-white font-medium')
                    : (scrolled
                       ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-darkborder'
                       : 'text-white hover:bg-primary-600')
                }`}
              >
                <motion.span 
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  className="mr-2"
                >
                  {item.icon}
                </motion.span>
                {item.text}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className={`pt-4 pb-3 space-y-1 ${scrolled ? 'text-gray-800 dark:text-gray-200' : 'text-white'}`}>
                {[
                  { path: '/', text: 'Home', icon: <FaHome /> },
                  { path: '/simulations', text: 'Simulations', icon: <FaFlask /> },
                  { path: '/simulations/cbc-padding-oracle', text: 'CBC Padding Oracle', icon: <FaLock /> },
                  { path: '/challenges', text: 'Challenges', icon: <FaTrophy /> },
                  { path: '/about', text: 'About', icon: <FaInfoCircle /> }
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-md ${
                      location.pathname === item.path
                        ? (scrolled 
                           ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium' 
                           : 'bg-primary-600 text-white font-medium')
                        : 'hover:bg-primary-600 hover:text-white transition-colors'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.text}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;