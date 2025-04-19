import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Define the Simulation interface
interface Simulation {
  id: string;
  name: string;
  description: string;
  complexity: string;
  tags: string[];
  icon?: string;
}

const SimulationLibraryPage: React.FC = () => {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Mock fetch simulations (replace with API call)
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockSimulations: Simulation[] = [
        {
          id: 'hastad-attack',
          name: 'Håstad\'s Broadcast Attack',
          description: 'A cryptographic attack on RSA when the same message is encrypted with the same low exponent to multiple recipients.',
          complexity: 'Medium',
          tags: ['RSA', 'Cryptography', 'Number Theory', 'CRT'],
          icon: '🔑'
        },
        {
          id: 'cbc-padding-oracle',
          name: 'CBC Padding Oracle Attack',
          description: 'Explore how padding oracle vulnerabilities can be exploited to decrypt CBC mode ciphertexts without knowing the key.',
          complexity: 'Hard',
          tags: ['AES', 'Block Cipher', 'Oracle Attack', 'Padding'],
          icon: '🔒'
        },
        {
          id: 'mitm-attack',
          name: 'Man-in-the-Middle Attack',
          description: 'Visualize how MITM attacks work and how they can compromise otherwise secure communications.',
          complexity: 'Easy',
          tags: ['Network', 'TLS', 'Protocol'],
          icon: '👤'
        },
        {
          id: 'wifi-cracking',
          name: 'WiFi Password Cracking',
          description: 'Simulation of WiFi security vulnerabilities and how they can be exploited.',
          complexity: 'Medium',
          tags: ['Wireless', 'WPA2', 'Network'],
          icon: '📡'
        },
        {
          id: 'xss-attack',
          name: 'Cross-Site Scripting (XSS)',
          description: 'Learn how XSS vulnerabilities work and how they can be prevented.',
          complexity: 'Easy',
          tags: ['Web Security', 'JavaScript', 'Injection'],
          icon: '💉'
        },
        {
          id: 'sql-injection',
          name: 'SQL Injection',
          description: 'Interactive demonstration of SQL injection attacks and their impact on database security.',
          complexity: 'Medium',
          tags: ['Web Security', 'Database', 'Injection'],
          icon: '💾'
        }
      ];
      
      setSimulations(mockSimulations);
      setLoading(false);
    }, 800);
  }, []);
  
  // Filter and search logic
  const filteredSimulations = simulations.filter(sim => {
    // Filter by category
    const passesFilter = activeFilter === 'all' || sim.tags.includes(activeFilter);
    
    // Filter by search query
    const matchesSearch = 
      searchQuery === '' || 
      sim.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      sim.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return passesFilter && matchesSearch;
  });
  
  // Extract all unique tags for filter options
  const allTags = [...new Set(simulations.flatMap(sim => sim.tags))].sort();
  
  // Helper function to get appropriate complexity badge color
  const getComplexityColor = (complexity: string): string => {
    switch (complexity.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Cybersecurity Simulations Library</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore our collection of interactive cybersecurity simulations and learn by doing
        </p>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Search simulations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-end">
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              activeFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition-colors`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                activeFilter === tag ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition-colors`}
              onClick={() => setActiveFilter(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      
      {/* Simulations Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {filteredSimulations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSimulations.map((simulation, index) => (
                <motion.div
                  key={simulation.id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">{simulation.icon || '🛡️'}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getComplexityColor(simulation.complexity)}`}>
                        {simulation.complexity}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-bold mb-2">{simulation.name}</h2>
                    <p className="text-gray-600 mb-4 line-clamp-2">{simulation.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-5">
                      {simulation.tags.map(tag => (
                        <span 
                          key={`${simulation.id}-${tag}`} 
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          onClick={() => setActiveFilter(tag)}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <Link 
                      to={`/simulations/${simulation.id}`}
                      className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition-colors"
                    >
                      Launch Simulation
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔎</div>
              <h3 className="text-2xl font-medium mb-2">No simulations found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
              <button
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                onClick={() => {
                  setActiveFilter('all');
                  setSearchQuery('');
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SimulationLibraryPage;