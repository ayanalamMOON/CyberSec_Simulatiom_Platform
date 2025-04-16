import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">CyberSecurity Simulation Platform</h3>
            <p className="text-gray-400">
              Learn and solve real-world cybersecurity problems through interactive simulations
              and visualizations.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/simulations" className="text-gray-400 hover:text-white transition-colors">
                  Simulation Library
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/your-github" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com/cryptography" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  Video Tutorials
                </a>
              </li>
              <li>
                <a href="https://docs.cybersim.dev" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} CyberSecurity Simulation Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;