import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import challengeApi, { Challenge, ChallengeType } from '../api/challengeApi';

const ChallengeLibraryPage: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        const data = await challengeApi.getChallenges();
        setChallenges(data);
      } catch (error) {
        console.error('Error fetching challenges:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChallenges();
  }, []);
  
  // Filter challenges based on active filter and search query
  const filteredChallenges = challenges.filter(challenge => {
    const matchesFilter = activeFilter === 'all' || challenge.tags.includes(activeFilter);
    const matchesSearch = searchQuery === '' || 
      challenge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });
  
  // Get unique tags for filter buttons
  const allTags = Array.from(
    new Set(challenges.flatMap(challenge => challenge.tags))
  ).sort();
  
  // Get challenge type label
  const getChallengeTypeLabel = (type: ChallengeType): string => {
    switch (type) {
      case ChallengeType.CTF: return 'CTF';
      case ChallengeType.TIMED: return 'Timed';
      case ChallengeType.BLIND: return 'Blind';
      case ChallengeType.MULTI_STAGE: return 'Multi-Stage';
      default: return 'Unknown';
    }
  };
  
  // Get difficulty color
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-orange-100 text-orange-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get challenge type color
  const getTypeColor = (type: ChallengeType): string => {
    switch (type) {
      case ChallengeType.CTF:
        return 'bg-purple-100 text-purple-800';
      case ChallengeType.TIMED:
        return 'bg-blue-100 text-blue-800';
      case ChallengeType.BLIND:
        return 'bg-indigo-100 text-indigo-800';
      case ChallengeType.MULTI_STAGE:
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-bold mb-2">Interactive Challenge Mode</h1>
        <p className="text-lg text-gray-600 mb-6">
          Test your cybersecurity skills with practical challenges and earn points
        </p>
      </motion.div>
      
      <div className="mb-8">
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'all' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All Challenges
          </button>
          
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === tag
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search challenges..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 focus:outline-none"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-3 top-3 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {filteredChallenges.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2">No Challenges Found</h2>
          <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{challenge.icon}</div>
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(challenge.type)}`}>
                      {getChallengeTypeLabel(challenge.type)}
                    </span>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold mb-2">{challenge.name}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{challenge.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-5">
                  {challenge.tags.map(tag => (
                    <span
                      key={`${challenge.id}-${tag}`}
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                      onClick={() => setActiveFilter(tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-primary-600 font-bold">
                    {challenge.points} points
                  </div>
                  {challenge.time_limit_seconds && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {Math.floor(challenge.time_limit_seconds / 60)}:{(challenge.time_limit_seconds % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                  <Link
                    to={`/challenges/${challenge.id}`}
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                  >
                    Start
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChallengeLibraryPage;