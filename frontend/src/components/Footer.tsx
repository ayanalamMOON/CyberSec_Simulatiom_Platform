import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaShieldAlt, 
  FaGithub, 
  FaYoutube, 
  FaBook, 
  FaTwitter, 
  FaLinkedin, 
  FaEnvelope 
} from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <footer className="bg-gray-800 dark:bg-darksurface text-white pt-12 pb-6 mt-10">
      <div className="container mx-auto px-4">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <div className="flex items-center mb-4">
              <FaShieldAlt className="text-secondary-400 text-2xl mr-2" />
              <h3 className="text-xl font-bold">CyberSim Platform</h3>
            </div>
            <p className="text-gray-400 dark:text-gray-300 mb-4">
              Learn and solve real-world cybersecurity problems through interactive simulations
              and visualizations.
            </p>
            <div className="flex space-x-4 mt-6">
              <motion.a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <FaTwitter size={20} />
              </motion.a>
              <motion.a 
                href="https://github.com/your-github" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <FaGithub size={20} />
              </motion.a>
              <motion.a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <FaLinkedin size={20} />
              </motion.a>
              <motion.a 
                href="mailto:contact@cybersim.dev" 
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <FaEnvelope size={20} />
              </motion.a>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-5 border-b border-gray-700 pb-2">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { to: '/', text: 'Home' },
                { to: '/simulations', text: 'Simulation Library' },
                { to: '/simulations/cbc-padding-oracle', text: 'CBC Padding Oracle' },
                { to: '/simulations/hastad-attack', text: 'Hastad Attack' },
                { to: '/about', text: 'About' }
              ].map(link => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-gray-400 dark:text-gray-300 hover:text-secondary-400 transition-colors flex items-center"
                  >
                    <motion.span 
                      className="mr-2 opacity-0"
                      whileHover={{ x: 5, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      →
                    </motion.span>
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-5 border-b border-gray-700 pb-2">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="https://github.com/your-github" target="_blank" rel="noopener noreferrer" 
                  className="text-gray-400 dark:text-gray-300 hover:text-secondary-400 transition-colors flex items-center">
                  <FaGithub className="mr-2" />
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com/cryptography" target="_blank" rel="noopener noreferrer" 
                  className="text-gray-400 dark:text-gray-300 hover:text-secondary-400 transition-colors flex items-center">
                  <FaYoutube className="mr-2" />
                  Video Tutorials
                </a>
              </li>
              <li>
                <a href="https://docs.cybersim.dev" target="_blank" rel="noopener noreferrer" 
                  className="text-gray-400 dark:text-gray-300 hover:text-secondary-400 transition-colors flex items-center">
                  <FaBook className="mr-2" />
                  Documentation
                </a>
              </li>
            </ul>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-5 border-b border-gray-700 pb-2">Newsletter</h3>
            <p className="text-gray-400 dark:text-gray-300 mb-4">
              Subscribe to our newsletter for updates on new simulations and cybersecurity content.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 w-full rounded-l-md focus:outline-none dark:bg-darkbg text-gray-800 dark:text-white bg-white"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-secondary-600 hover:bg-secondary-700 px-4 py-2 rounded-r-md transition-colors"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400"
        >
          <p>&copy; {currentYear} CyberSecurity Simulation Platform. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;