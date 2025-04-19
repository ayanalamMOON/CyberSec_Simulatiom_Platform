import React, { useState } from 'react';
import { HastadAttackRequest, HastadAttackResponse, simulationApi, TaskResponse } from '../api/simulationApi';
import TaskStatusTracker from '../components/TaskStatusTracker';
import { VisualizationProvider } from '../visualizations/VisualizationContext';
import HastadAttackVisualizer from '../visualizations/components/HastadAttackVisualizer';
import { EditorProvider } from '../editor/EditorContext';
import CodeEditor from '../editor/CodeEditor';
import TextEditor from '../editor/TextEditor';

const HastadAttackPage: React.FC = () => {
  const [exponent, setExponent] = useState<number>(3);
  const [keySize, setKeySize] = useState<number>(512);
  const [message, setMessage] = useState<string>('');
  const [response, setResponse] = useState<HastadAttackResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // New state for async execution
  const [isAsyncMode, setIsAsyncMode] = useState<boolean>(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskCompleted, setTaskCompleted] = useState<boolean>(false);
  // Visualization toggle state
  const [showVisualizer, setShowVisualizer] = useState<boolean>(true);
  // Editor state
  const [editorType, setEditorType] = useState<'code' | 'text'>('text');

  const handleEditorContentChange = (content: string) => {
    setMessage(content);
  };
  
  // Helper function to convert message to a number or undefined
  const parseMessageToNumber = (msg: string): number | undefined => {
    if (msg.trim() === '') return undefined;
    const parsed = parseInt(msg, 10);
    return isNaN(parsed) ? undefined : parsed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResponse(null);
    setTaskId(null);
    setTaskCompleted(false);

    // Parse the message to a number or undefined
    const messageValue = parseMessageToNumber(message);

    const params: HastadAttackRequest = {
      exponent: exponent,
      key_size: keySize,
      ...(messageValue !== undefined ? { message: messageValue } : {})
    };

    try {
      if (isAsyncMode) {
        // Run simulation asynchronously
        const taskResponse: TaskResponse = await simulationApi.runHastadAttackAsync(params);
        setTaskId(taskResponse.task_id);
      } else {
        // Run simulation synchronously (original behavior)
        const result = await simulationApi.runHastadAttack(params);
        setResponse(result);
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle task completion
  const handleTaskComplete = async (completedTaskId: string) => {
    try {
      // Fetch the task status one more time to get result info
      const taskStatus = await simulationApi.getTaskStatus(completedTaskId);
      
      if (taskStatus.has_result) {
        // Parse message to number again for consistency
        const messageValue = parseMessageToNumber(message);

        // If the task has a result, fetch the complete simulation result
        const result = await simulationApi.runHastadAttack({
          exponent: exponent,
          key_size: keySize,
          ...(messageValue !== undefined ? { message: messageValue } : {})
        });
        setResponse(result);
      }
      
      setTaskCompleted(true);
    } catch (err) {
      setError(`Error retrieving results: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Handle task error
  const handleTaskError = (errorMsg: string) => {
    setError(errorMsg);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Håstad's Broadcast Attack Simulation</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="mb-2">
          Håstad's broadcast attack exploits RSA when the same message is encrypted with the same small exponent 
          (typically e=3) to multiple recipients. Using the Chinese Remainder Theorem, an attacker can recover 
          the original message without knowing any private keys.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Simulation Parameters</h2>
        
        {/* Editor type selector */}
        <div className="mb-4 flex">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setEditorType('text')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                editorType === 'text' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-blue-600 hover:bg-gray-100'
              }`}
            >
              Text Editor
            </button>
            <button
              type="button"
              onClick={() => setEditorType('code')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                editorType === 'code' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-blue-600 hover:bg-gray-100'
              }`}
            >
              Code Editor
            </button>
          </div>
        </div>
        
        {/* Monaco Editor */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Message (Optional)</label>
          <div style={{ height: '300px', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <EditorProvider 
              initialContent={message} 
              onContentChange={handleEditorContentChange}
            >
              {editorType === 'text' ? (
                <TextEditor />
              ) : (
                <CodeEditor />
              )}
            </EditorProvider>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Enter a number or leave blank for a random message. Non-numeric input will be ignored.
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 mb-2">Public Exponent (e)</label>
              <input
                type="number"
                min="3"
                value={exponent}
                onChange={(e) => setExponent(parseInt(e.target.value))}
                className="w-full border rounded px-3 py-2"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-1">Recommended: 3 (must be ≥ 3)</p>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Key Size (bits)</label>
              <input
                type="number"
                min="256"
                max="2048"
                step="64"
                value={keySize}
                onChange={(e) => setKeySize(parseInt(e.target.value))}
                className="w-full border rounded px-3 py-2"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-1">Range: 256-2048 bits</p>
            </div>
          </div>
          
          {/* New option for async mode */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isAsyncMode}
                onChange={() => setIsAsyncMode(!isAsyncMode)}
                className="mr-2"
                disabled={loading}
              />
              <span className="text-gray-700">Run simulation asynchronously</span>
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Recommended for complex simulations or larger key sizes
            </p>
          </div>

          <button
            type="submit"
            className={`px-4 py-2 rounded text-white font-medium ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={loading}
          >
            {loading ? 'Running Simulation...' : 'Run Simulation'}
          </button>
        </form>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Task status tracker */}
      {taskId && !taskCompleted && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Simulation Progress</h2>
          <TaskStatusTracker 
            taskId={taskId} 
            onComplete={handleTaskComplete}
            onError={handleTaskError}
          />
        </div>
      )}

      {/* Results display */}
      {response && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Simulation Results</h2>
          
          {/* Toggle between visualization and raw data views */}
          <div className="mb-4 flex justify-end">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setShowVisualizer(true)}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  showVisualizer 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-blue-600 hover:bg-gray-100'
                }`}
              >
                Visualization
              </button>
              <button
                type="button"
                onClick={() => setShowVisualizer(false)}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  !showVisualizer 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-blue-600 hover:bg-gray-100'
                }`}
              >
                Raw Data
              </button>
            </div>
          </div>

          {/* Visualization view */}
          {showVisualizer ? (
            <VisualizationProvider>
              <HastadAttackVisualizer 
                data={response} 
                width={800}
                height={600}
                className="mb-6"
              />
            </VisualizationProvider>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-2">Message Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">Original Message:</p>
                    <p className="font-mono break-all">{response.original_message}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">Recovered Message:</p>
                    <p className="font-mono break-all">{response.recovered_message}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-2">Recipients</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {response.recipients.map((recipient, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <p className="font-semibold">Recipient {recipient.index}</p>
                      <p className="text-xs font-mono mt-1">n: {recipient.n.substring(0, 20)}...</p>
                      <p className="text-xs font-mono mt-1">p: {recipient.p.substring(0, 20)}...</p>
                      <p className="text-xs font-mono mt-1">q: {recipient.q.substring(0, 20)}...</p>
                      <p className="text-sm mt-2 font-bold text-purple-700">Ciphertext:</p>
                      <p className="text-xs font-mono">{response.ciphertexts[index].substring(0, 20)}...</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-2">Simulation Steps</h3>
                <div className="bg-gray-50 p-4 rounded">
                  {response.simulation_steps.map((step, index) => (
                    <div key={index} className="mb-3 pb-3 border-b border-gray-200 last:border-0">
                      <p className="font-semibold">{step.step}</p>
                      <p className="text-gray-700">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HastadAttackPage;