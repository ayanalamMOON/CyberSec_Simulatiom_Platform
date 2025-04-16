import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };
  
  // Featured simulations
  const featuredSimulations = [
    {
      id: 'hastad-attack',
      title: 'Håstad\'s Broadcast Attack',
      description: 'Explore the vulnerability in RSA encryption when using low exponents across multiple recipients.',
      icon: '🔑',
      tags: ['RSA', 'Cryptography', 'Number Theory']
    },
    {
      id: 'cbc-padding-oracle',
      title: 'CBC Padding Oracle',
      description: 'Learn how padding oracles can be exploited to decrypt CBC-encrypted messages.',
      icon: '🔒',
      tags: ['AES', 'Block Cipher', 'Oracle Attack']
    },
    {
      id: 'mitm-visualization',
      title: 'Man-in-the-Middle Visualization',
      description: 'See how MITM attacks work and how protocols can be compromised.',
      icon: '👤',
      tags: ['Network', 'Protocol', 'TLS']
    }
  ];

  return (
    <div className="flex flex-col space-y-16">
      {/* Hero Section */}
      <motion.section 
        className="text-center py-16 px-4 bg-gradient-to-r from-primary-700 to-primary-900 text-white rounded-xl shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Learn Cybersecurity Through Interactive Simulations
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Visualize attacks, explore vulnerabilities, and master cybersecurity concepts with hands-on simulations
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/simulations" className="bg-white text-primary-700 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-colors">
            Explore Simulations
          </Link>
          <Link to="/simulations/hastad-attack" className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            Try Håstad Attack Demo
          </Link>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Platform</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            className="bg-white p-6 rounded-lg shadow-md"
            {...fadeIn}
            transition={{ delay: 0.1 }}
          >
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-3">Interactive Learning</h3>
            <p className="text-gray-600">
              Learn by doing with hands-on simulations that demonstrate real-world cybersecurity concepts and attacks.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white p-6 rounded-lg shadow-md"
            {...fadeIn}
            transition={{ delay: 0.2 }}
          >
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3">Advanced Visualization</h3>
            <p className="text-gray-600">
              Complex cryptographic and network concepts are made easy to understand through intuitive visualizations.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white p-6 rounded-lg shadow-md"
            {...fadeIn}
            transition={{ delay: 0.3 }}
          >
            <div className="text-5xl mb-4">💡</div>
            <h3 className="text-xl font-semibold mb-3">Practical Skills</h3>
            <p className="text-gray-600">
              Develop skills that are directly applicable to real-world penetration testing and security analysis.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Simulations */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-2">Featured Simulations</h2>
        <p className="text-center text-gray-600 mb-12">Start exploring these popular cybersecurity simulations</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredSimulations.map((sim, index) => (
            <motion.div 
              key={sim.id}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              <div className="p-6">
                <div className="text-4xl mb-4">{sim.icon}</div>
                <h3 className="text-xl font-bold mb-2">{sim.title}</h3>
                <p className="text-gray-600 mb-4">{sim.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {sim.tags.map(tag => (
                    <span key={tag} className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link 
                  to={`/simulations/${sim.id}`} 
                  className="block text-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  Launch Simulation
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-900 text-white py-16 px-6 rounded-xl text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Master Cybersecurity?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Dive into our comprehensive library of simulations and start learning today.
        </p>
        <Link 
          to="/simulations" 
          className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg"
        >
          Explore All Simulations
        </Link>
      </section>
    </div>
  );
};

export default HomePage;