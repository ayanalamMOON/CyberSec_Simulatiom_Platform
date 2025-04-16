import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import simulationApi, { SimulationInfo } from '../api/simulationApi';

const SimulationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [simulation, setSimulation] = useState<SimulationInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Handle special case for Håstad attack which has a dedicated page
  if (id === 'hastad-attack') {
    return <Navigate to="/simulations/hastad-attack" replace />;
  }
  
  useEffect(() => {
    const fetchSimulation = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await simulationApi.getSimulationInfo(id);
        setSimulation(data);
      } catch (err) {
        setError(`Error loading simulation: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSimulation();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (error || !simulation) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-2">Simulation Not Found</h2>
        <p className="text-gray-600 mb-6">{error || "The requested simulation doesn't exist or is not available yet."}</p>
        <Link 
          to="/simulations"
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
        >
          Browse Available Simulations
        </Link>
      </div>
    );
  }
  
  return (
    <div className="py-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">{simulation.name}</h1>
        <p className="text-gray-600">{simulation.description}</p>
        
        <div className="flex flex-wrap items-center mt-4 gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            simulation.complexity === 'Easy' ? 'bg-green-100 text-green-800' :
            simulation.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {simulation.complexity}
          </span>
          
          {simulation.tags.map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      </motion.div>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        {/* This is a placeholder for future simulation content */}
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            This simulation is currently under development and will be available soon.
          </p>
          <div className="flex justify-center">
            <Link
              to="/simulations/hastad-attack"
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            >
              Try Håstad's Attack Simulation Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationDetailPage;