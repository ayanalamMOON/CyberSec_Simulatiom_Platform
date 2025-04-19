import React, { useState } from 'react';
import { MITMAttackRequest, MITMAttackResponse, simulationApi } from '../api/simulationApi';
import { VisualizationProvider } from '../visualizations/VisualizationContext';
import MITMAttackVisualizer from '../visualizations/components/MITMAttackVisualizer';
import { EditorProvider } from '../editor/EditorContext';
import TextEditor from '../editor/TextEditor';

const MITMAttackPage: React.FC = () => {
  const [protocol, setProtocol] = useState<string>("TLS");
  const [interceptMode, setInterceptMode] = useState<string>("passive");
  const [encryptionStrength, setEncryptionStrength] = useState<number>(128);
  const [messageCount, setMessageCount] = useState<number>(5);
  const [customMessages, setCustomMessages] = useState<string>("");
  const [enableCertificates, setEnableCertificates] = useState<boolean>(true);
  const [response, setResponse] = useState<MITMAttackResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showVisualizer, setShowVisualizer] = useState<boolean>(true);

  const handleEditorContentChange = (content: string) => {
    setCustomMessages(content);
  };

  // Parse custom messages from editor content
  const parseCustomMessages = (): string[] | undefined => {
    if (!customMessages.trim()) return undefined;
    
    // Split by newlines and filter out empty lines
    const messages = customMessages
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    return messages.length > 0 ? messages : undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResponse(null);

    const parsedMessages = parseCustomMessages();
    
    const params: MITMAttackRequest = {
      protocol,
      intercept_mode: interceptMode,
      encryption_strength: encryptionStrength,
      message_count: messageCount,
      enable_certificates: enableCertificates,
      ...(parsedMessages && { custom_messages: parsedMessages })
    };

    try {
      const result = await simulationApi.runMITMAttack(params);
      setResponse(result);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Man-in-the-Middle Attack Simulation</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="mb-2">
          A Man-in-the-Middle (MITM) attack occurs when an attacker secretly intercepts and potentially 
          alters communications between two parties who believe they are directly communicating with each other.
          This simulation demonstrates various MITM techniques across different protocols.
        </p>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Simulation Parameters</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 mb-2">Protocol</label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                className="w-full border rounded px-3 py-2"
                disabled={loading}
              >
                <option value="HTTP">HTTP (Insecure)</option>
                <option value="HTTPS">HTTPS</option>
                <option value="TLS">TLS</option>
                <option value="SSH">SSH</option>
                <option value="Telnet">Telnet (Insecure)</option>
                <option value="FTP">FTP (Insecure)</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">Choose the communication protocol to simulate</p>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Interception Mode</label>
              <select
                value={interceptMode}
                onChange={(e) => setInterceptMode(e.target.value)}
                className="w-full border rounded px-3 py-2"
                disabled={loading}
              >
                <option value="passive">Passive (Monitor Only)</option>
                <option value="active">Active (Modify Traffic)</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Passive mode only observes traffic; Active mode can modify messages
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 mb-2">Encryption Strength (bits)</label>
              <select
                value={encryptionStrength}
                onChange={(e) => setEncryptionStrength(parseInt(e.target.value))}
                className="w-full border rounded px-3 py-2"
                disabled={loading}
              >
                <option value={64}>64 (Weak)</option>
                <option value={128}>128 (Standard)</option>
                <option value={256}>256 (Strong)</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Only applies to encrypted protocols
              </p>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Message Count</label>
              <input
                type="number"
                min={1}
                max={20}
                value={messageCount}
                onChange={(e) => setMessageCount(parseInt(e.target.value))}
                className="w-full border rounded px-3 py-2"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-1">
                Number of messages to exchange (1-20)
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={enableCertificates}
                onChange={() => setEnableCertificates(!enableCertificates)}
                className="mr-2"
                disabled={loading}
              />
              <span className="text-gray-700">Enable Certificate Validation</span>
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Only applies to protocols that use certificates (TLS, HTTPS, SSH)
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Custom Messages (Optional)</label>
            <div style={{ height: '200px', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <EditorProvider 
                initialContent={customMessages} 
                onContentChange={handleEditorContentChange}
              >
                <TextEditor />
              </EditorProvider>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Enter custom messages (one per line) or leave blank to use default messages
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
              <MITMAttackVisualizer 
                data={response} 
                width={800}
                height={600}
                className="mb-6"
              />
            </VisualizationProvider>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-2">Attack Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">Protocol:</p>
                    <p>{response.protocol}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">Attack Type:</p>
                    <p>{response.attack_type}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">Vulnerable to MITM:</p>
                    <p>{response.vulnerable ? 'Yes' : 'No with proper implementation'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">Recommended Mitigation:</p>
                    <p>{response.mitigation}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-2">Participants</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {response.participants.map((participant, index) => (
                    <div key={participant.id} className="bg-gray-50 p-3 rounded">
                      <p className="font-semibold">{participant.name}</p>
                      {participant.key && (
                        <p className="text-xs font-mono mt-1">Key: {participant.key.substring(0, 16)}...</p>
                      )}
                      {participant.certificate && (
                        <p className="text-xs font-mono mt-1">Has Certificate: Yes</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-2">Messages</h3>
                <div className="space-y-3">
                  {response.messages.map((message, index) => (
                    <div key={index} className={`p-3 rounded ${
                      message.modified ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                    }`}>
                      <div className="flex justify-between">
                        <p className="font-semibold">
                          From {message.sender_id === 'alice' ? 'Alice' : 'Bob'} to {message.receiver_id === 'alice' ? 'Alice' : 'Bob'}
                        </p>
                        <div className="flex space-x-2">
                          {message.encrypted && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Encrypted</span>
                          )}
                          {message.intercepted && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Intercepted</span>
                          )}
                          {message.modified && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Modified</span>
                          )}
                        </div>
                      </div>
                      <p className="mt-2">{message.content}</p>
                      {message.original_content && (
                        <div className="mt-2 pt-2 border-t border-red-200">
                          <p className="text-sm text-gray-500">Original message:</p>
                          <p className="text-sm">{message.original_content}</p>
                        </div>
                      )}
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
                      <p className="text-gray-700 whitespace-pre-line">{step.description}</p>
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

export default MITMAttackPage;