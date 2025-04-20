import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import challengeApi, { 
  Challenge, 
  ChallengeAttempt, 
  ChallengeResult, 
  ChallengeType, 
  ChallengeStage 
} from '../api/challengeApi';
import simulationApi, {
  SimulationStatus,
  HastadAttackResponse,
  CBCPaddingOracleResponse,
  MITMAttackResponse
} from '../api/simulationApi';
import LoadingAnimation from '../components/LoadingAnimation';
import Button from '../components/Button';

const ChallengeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [attempt, setAttempt] = useState<ChallengeAttempt | null>(null);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [simulationDetails, setSimulationDetails] = useState<
    HastadAttackResponse | CBCPaddingOracleResponse | MITMAttackResponse | null
  >(null);
  const [simulationTaskId, setSimulationTaskId] = useState<string | null>(null);
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus | null>(null);
  const [answer, setAnswer] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<ChallengeStage | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchChallenge = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await challengeApi.getChallenge(id);
        setChallenge(data);
      } catch (error) {
        setError(`Error loading challenge: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChallenge();
  }, [id]);
  
  useEffect(() => {
    const startChallenge = async () => {
      if (!challenge) return;
      
      try {
        const attemptData = await challengeApi.startChallenge(challenge.id);
        setAttempt(attemptData);
        
        if (challenge.type === ChallengeType.MULTI_STAGE && challenge.stages?.length) {
          setCurrentStage(challenge.stages[0]);
        }
        
        if (challenge.time_limit_seconds) {
          setTimeLeft(challenge.time_limit_seconds);
        }
      } catch (error) {
        setError(`Error starting challenge: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    
    startChallenge();
  }, [challenge]);
  
  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev ? prev - 1 : null));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);
  
  useEffect(() => {
    const runChallengeSimulation = async () => {
      if (!challenge || !attempt) return;
      
      try {
        let result;
        
        if (challenge.type === ChallengeType.MULTI_STAGE && currentStage) {
          result = await challengeApi.runChallengeSimulation(
            challenge.id, 
            attempt.id
          );
        } else {
          result = await challengeApi.runChallengeSimulation(
            challenge.id, 
            attempt.id
          );
        }
        
        setSimulationResult(result);

        if (challenge.simulation_ids && challenge.simulation_ids.length > 0) {
          const simId = challenge.simulation_ids[0];
          
          if (challenge.type === ChallengeType.BLIND) {
            return;
          }
          
          try {
            if (simId === 'hastad-attack') {
              const taskResponse = await simulationApi.runHastadAttackAsync({
                exponent: result.parameters?.exponent || 3,
                key_size: result.parameters?.key_size || 1024
              });
              
              setSimulationTaskId(taskResponse.task_id);
              setSimulationStatus(SimulationStatus.RUNNING);
            } else if (simId === 'cbc-padding-oracle') {
              const simResult = await simulationApi.runCBCPaddingOracle({
                auto_decrypt: false,
                key_size: result.parameters?.key_size || 128
              });
              setSimulationDetails(simResult);
            } else if (simId === 'mitm-attack') {
              const taskResponse = await simulationApi.runMITMAttackAsync({
                protocol: result.parameters?.protocol || 'basic',
                intercept_mode: 'passive',
                encryption_strength: result.parameters?.encryption_strength || 1,
                message_count: 5,
                enable_certificates: !!result.parameters?.enable_certificates
              });
              
              setSimulationTaskId(taskResponse.task_id);
              setSimulationStatus(SimulationStatus.RUNNING);
            }
          } catch (simError) {
            console.error('Error fetching detailed simulation:', simError);
          }
        }
      } catch (error) {
        setError(`Error running simulation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    
    runChallengeSimulation();
  }, [challenge, attempt, currentStage]);
  
  useEffect(() => {
    if (!simulationTaskId || simulationStatus !== SimulationStatus.RUNNING) {
      return;
    }
    
    const checkTaskStatus = async () => {
      try {
        const status = await simulationApi.getTaskStatus(simulationTaskId);
        setSimulationStatus(status.status);
        
        if (status.status === SimulationStatus.COMPLETED && status.has_result) {
          const simId = challenge?.simulation_ids?.[0];
          if (simId === 'hastad-attack') {
            const result = await simulationApi.getTaskStatus(simulationTaskId);
            setSimulationDetails(result as any);
          } else if (simId === 'mitm-attack') {
            const result = await simulationApi.getTaskStatus(simulationTaskId);
            setSimulationDetails(result as any);
          }
        }
      } catch (error) {
        console.error('Error checking task status:', error);
      }
    };
    
    const interval = setInterval(checkTaskStatus, 2000);
    return () => clearInterval(interval);
  }, [simulationTaskId, simulationStatus, challenge]);
  
  const handleSubmitAnswer = async () => {
    if (!challenge || !attempt || !answer.trim()) return;
    
    try {
      setSubmitting(true);
      const result = await challengeApi.submitAnswer(
        challenge.id,
        attempt.id,
        { answer }
      );
      
      setResult(result);
      
      if (result.success && challenge.type === ChallengeType.MULTI_STAGE && challenge.stages) {
        if (result.correct_stages < challenge.stages.length) {
          setCurrentStage(challenge.stages[result.correct_stages]);
          
          const nextSimResult = await challengeApi.runChallengeSimulation(
            challenge.id,
            attempt.id
          );
          setSimulationResult(nextSimResult);
          setAnswer('');
          setResult(null);
        }
      }
    } catch (error) {
      setError(`Error submitting answer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  const requestHint = async () => {
    if (!challenge || !attempt) return;
    
    try {
      const hint = await challengeApi.getHint(challenge.id, attempt.id);
      setHint(hint);
      setShowHint(true);
    } catch (error) {
      setError(`Error getting hint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const renderSimulationVisualization = () => {
    if (!simulationResult) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (simulationDetails) {
      if ('recipients' in simulationDetails) {
        return (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 overflow-auto h-72">
            <h4 className="font-medium mb-2">RSA Attack Simulation</h4>
            <div className="mb-2">
              <span className="font-medium">Original Message:</span> {simulationDetails.original_message}
            </div>
            {simulationDetails.success && (
              <div className="mb-2 text-green-600">
                <span className="font-medium">Recovered Message:</span> {simulationDetails.recovered_message}
              </div>
            )}
            <div className="mb-2">
              <span className="font-medium">Recipients:</span> {simulationDetails.recipients.length}
            </div>
            <div className="mt-4">
              <h5 className="font-medium mb-1">Simulation Steps:</h5>
              <ul className="list-disc list-inside">
                {simulationDetails.simulation_steps.map((step, index) => (
                  <li key={index} className="mb-1">
                    <span className="font-medium">{step.step}:</span> {step.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      } else if ('blocks' in simulationDetails) {
        return (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 overflow-auto h-72">
            <h4 className="font-medium mb-2">CBC Padding Oracle Attack</h4>
            <div className="mb-2">
              <span className="font-medium">IV:</span> {simulationDetails.iv}
            </div>
            <div className="mb-2">
              <span className="font-medium">Encrypted Message:</span> {simulationDetails.encrypted_message}
            </div>
            <div className="mb-4">
              <h5 className="font-medium mb-1">Blocks:</h5>
              <div className="grid grid-cols-2 gap-2">
                {simulationDetails.blocks.map((block) => (
                  <div 
                    key={block.index}
                    className={`p-2 rounded ${block.decrypted ? 'bg-green-50' : 'bg-gray-100'}`}
                  >
                    <div><span className="font-medium">Block {block.index}:</span> {block.data}</div>
                    {block.decrypted && (
                      <div className="text-green-600">{block.decrypted_data}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <h5 className="font-medium mb-1">Simulation Steps:</h5>
              <ul className="list-disc list-inside">
                {simulationDetails.simulation_steps.map((step, index) => (
                  <li key={index} className="mb-1">
                    <span className="font-medium">{step.step}:</span> {step.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      } else if ('participants' in simulationDetails) {
        return (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 overflow-auto h-72">
            <h4 className="font-medium mb-2">MITM Attack Simulation</h4>
            <div className="mb-2">
              <span className="font-medium">Protocol:</span> {simulationDetails.protocol}
            </div>
            <div className="mb-2">
              <span className="font-medium">Status:</span>{' '}
              <span className={simulationDetails.success ? 'text-green-600' : 'text-red-600'}>
                {simulationDetails.success ? 'Attack Successful' : 'Attack Failed'}
              </span>
            </div>
            <div className="mb-4">
              <h5 className="font-medium mb-1">Participants:</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                {simulationDetails.participants.map((participant) => (
                  <div key={participant.id} className="p-2 bg-gray-100 rounded">
                    <div><span className="font-medium">{participant.name}</span> ({participant.id})</div>
                    {participant.key && <div className="text-xs truncate">Key: {participant.key}</div>}
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <h5 className="font-medium mb-1">Messages:</h5>
              <div className="space-y-2">
                {simulationDetails.messages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`p-2 rounded ${msg.intercepted ? 'bg-yellow-50' : 'bg-gray-100'}`}
                  >
                    <div className="text-xs">{msg.sender_id} → {msg.receiver_id}</div>
                    <div className={`${msg.modified ? 'text-red-600' : ''}`}>
                      {msg.content}
                    </div>
                    {msg.modified && (
                      <div className="text-xs text-gray-500">Original: {msg.original_content}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
    }
    
    return (
      <div className="bg-gray-50 p-4 rounded-lg mb-4 overflow-auto h-72">
        <pre className="text-sm">{JSON.stringify(simulationResult, null, 2)}</pre>
      </div>
    );
  };
  
  if (loading) {
    return <LoadingAnimation />;
  }
  
  if (error || !challenge) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-2">Challenge Not Found</h2>
        <p className="text-gray-600 mb-6">{error || "The requested challenge doesn't exist or is not available yet."}</p>
        <Link 
          to="/challenges"
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
        >
          Browse Available Challenges
        </Link>
      </div>
    );
  }
  
  if (result?.success && (challenge.type !== ChallengeType.MULTI_STAGE || result.correct_stages === challenge.stages?.length)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-lg shadow-md text-center"
        >
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold mb-2">Challenge Completed!</h2>
          <p className="text-gray-600 mb-6">{result.feedback}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{result.score}</div>
              <div className="text-gray-500">Points Earned</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{formatTime(result.time_spent_seconds)}</div>
              <div className="text-gray-500">Time Spent</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{result.hints_used}</div>
              <div className="text-gray-500">Hints Used</div>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate('/challenges')}>
              Back to Challenges
            </Button>
            
            {result.next_challenge_id && (
              <Button onClick={() => navigate(`/challenges/${result.next_challenge_id}`)}>
                Next Challenge
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{challenge.name}</h1>
            <p className="text-gray-600">{challenge.description}</p>
          </div>
          
          {timeLeft !== null && (
            <div className={`text-xl font-bold px-4 py-2 rounded-lg ${
              timeLeft < 60 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              Time Left: {formatTime(timeLeft)}
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap items-center mt-4 gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
            challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            challenge.difficulty === 'Hard' ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
          }`}>
            {challenge.difficulty}
          </span>
          
          {challenge.type && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              challenge.type === ChallengeType.CTF ? 'bg-purple-100 text-purple-800' :
              challenge.type === ChallengeType.TIMED ? 'bg-blue-100 text-blue-800' :
              challenge.type === ChallengeType.BLIND ? 'bg-indigo-100 text-indigo-800' :
              'bg-teal-100 text-teal-800'
            }`}>
              {challenge.type === ChallengeType.CTF ? 'CTF' :
               challenge.type === ChallengeType.TIMED ? 'Timed' :
               challenge.type === ChallengeType.BLIND ? 'Blind' :
               'Multi-Stage'}
            </span>
          )}
          
          {challenge.points && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {challenge.points} points
            </span>
          )}
          
          {challenge.tags.map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            {challenge.type === ChallengeType.MULTI_STAGE && currentStage && (
              <>
                <div className="mb-4 pb-4 border-b">
                  <h3 className="text-lg font-medium mb-2">Current Stage: {currentStage.name}</h3>
                  <p className="text-gray-600">{currentStage.description}</p>
                </div>
              </>
            )}
            
            {renderSimulationVisualization()}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Submit Your Answer</h3>
            
            {result && !result.success && (
              <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4">
                {result.feedback}
              </div>
            )}
            
            <div className="mb-4">
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 focus:outline-none"
                rows={4}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your solution here..."
              />
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={requestHint}
                className="text-primary-600 hover:text-primary-800 transition-colors"
                disabled={submitting}
              >
                Get a Hint
              </button>
              
              <Button
                onClick={handleSubmitAnswer}
                disabled={submitting || !answer.trim()}
              >
                {submitting ? 'Submitting...' : 'Submit Answer'}
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-medium mb-4">Challenge Overview</h3>
            
            {challenge.type === ChallengeType.MULTI_STAGE && challenge.stages && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Stages</h4>
                <div className="space-y-2">
                  {challenge.stages.map((stage, index) => (
                    <div 
                      key={stage.id}
                      className={`p-2 rounded-lg flex items-center justify-between ${
                        currentStage?.id === stage.id 
                          ? 'bg-primary-50 border border-primary-200' 
                          : index < (attempt?.current_stage_index || 0)
                            ? 'bg-green-50'
                            : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        {index < (attempt?.current_stage_index || 0) ? (
                          <span className="text-green-500 mr-2">✓</span>
                        ) : (
                          <span className="text-gray-400 mr-2">{index + 1}</span>
                        )}
                        <span>{stage.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{stage.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {showHint && hint && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Hint</h4>
                <div className="bg-yellow-50 p-3 rounded-lg text-sm">
                  {hint}
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Points</h4>
              <div className="text-lg font-bold text-primary-600">{challenge.points}</div>
            </div>
            
            {challenge.time_limit_seconds && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Time Limit</h4>
                <div className="text-lg font-bold">
                  {Math.floor(challenge.time_limit_seconds / 60)}:{(challenge.time_limit_seconds % 60).toString().padStart(2, '0')}
                </div>
              </div>
            )}
          </div>
          
          <Link
            to="/challenges"
            className="block text-center py-2 text-primary-600 hover:text-primary-800 transition-colors"
          >
            ← Back to Challenges
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetailPage;