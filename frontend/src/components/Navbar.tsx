import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-primary-700 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            CyberSim Platform
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-primary-200 transition-colors">
              Home
            </Link>
            <Link to="/simulations" className="hover:text-primary-200 transition-colors">
              Simulations
            </Link>
            <Link to="/simulations/cbc-padding-oracle" className="hover:text-primary-200 transition-colors">
              CBC Padding Oracle
            </Link>
            <Link to="/about" className="hover:text-primary-200 transition-colors">
              About
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 fade-in">
            <Link to="/" className="block py-2 hover:text-primary-200 transition-colors">
              Home
            </Link>
            <Link to="/simulations" className="block py-2 hover:text-primary-200 transition-colors">
              Simulations
            </Link>
            <Link to="/simulations/cbc-padding-oracle" className="block py-2 hover:text-primary-200 transition-colors">
              CBC Padding Oracle
            </Link>
            <Link to="/about" className="block py-2 hover:text-primary-200 transition-colors">
              About
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;