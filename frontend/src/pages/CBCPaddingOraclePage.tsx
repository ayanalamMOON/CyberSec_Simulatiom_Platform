import React, { useState } from 'react';
import { simulationApi, CBCPaddingOracleRequest, CBCPaddingOracleResponse } from '../api/simulationApi';
import { VisualizationProvider } from '../visualizations/VisualizationContext';
import CBCPaddingOracleVisualizer from '../visualizations/components/CBCPaddingOracleVisualizer';
import { EditorProvider } from '../editor/EditorContext';
import CodeEditor from '../editor/CodeEditor';
import TextEditor from '../editor/TextEditor';

const CBCPaddingOraclePage: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [keySize, setKeySize] = useState<number>(128);
  const [autoDecrypt, setAutoDecrypt] = useState<boolean>(true);
  const [response, setResponse] = useState<CBCPaddingOracleResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showVisualizer, setShowVisualizer] = useState<boolean>(true);
  const [editorType, setEditorType] = useState<'code' | 'text'>('text');

  const handleEditorContentChange = (content: string) => {
    setMessage(content);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResponse(null);
    const params: CBCPaddingOracleRequest = {
      ...(message ? { message } : {}),
      key_size: keySize,
      auto_decrypt: autoDecrypt,
    };
    try {
      const result = await simulationApi.runCBCPaddingOracle(params);
      setResponse(result);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">CBC Padding Oracle Attack Simulation</h1>
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p>
          This simulation demonstrates how a padding oracle vulnerability in CBC mode encryption can be exploited to decrypt ciphertext without knowing the key. You can provide a message and key size, or use the defaults.
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
          <label className="block text-gray-700 mb-2">Enter Message (optional)</label>
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
            Leave blank to use the default message.
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Key Size (bits)</label>
            <select
              value={keySize}
              onChange={e => setKeySize(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
              disabled={loading}
            >
              <option value={128}>128</option>
              <option value={192}>192</option>
              <option value={256}>256</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoDecrypt}
                onChange={() => setAutoDecrypt(!autoDecrypt)}
                className="mr-2"
                disabled={loading}
              />
              <span className="text-gray-700">Automatically decrypt all blocks</span>
            </label>
          </div>
          <button
            type="submit"
            className={`px-4 py-2 rounded text-white font-medium ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            disabled={loading}
          >
            {loading ? 'Running Simulation...' : 'Run Simulation'}
          </button>
        </form>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
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
              <CBCPaddingOracleVisualizer 
                data={response} 
                width={800}
                height={400}
                className="mb-6"
              />
            </VisualizationProvider>
          ) : (
            <>
              <div className="mb-4">
                <strong>Original Message:</strong>
                <div className="font-mono break-all bg-gray-50 p-2 rounded mt-1">{response.original_message}</div>
              </div>
              <div className="mb-4">
                <strong>Encrypted (base64):</strong>
                <div className="font-mono break-all bg-gray-50 p-2 rounded mt-1">{response.encrypted_message}</div>
              </div>
              <div className="mb-4">
                <strong>IV (base64):</strong>
                <div className="font-mono break-all bg-gray-50 p-2 rounded mt-1">{response.iv}</div>
              </div>
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-2">Blocks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {response.blocks.map(block => (
                    <div key={block.index} className="bg-gray-100 p-3 rounded">
                      <div>Block #{block.index}</div>
                      <div className="font-mono text-xs break-all">{block.data}</div>
                      {block.decrypted && block.decrypted_data && (
                        <div className="mt-2 text-green-700 font-semibold">Decrypted: <span className="font-mono">{block.decrypted_data}</span></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h3 className="font-medium text-lg mb-2">Decrypted Blocks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {response.decrypted_blocks.map((blk, idx) => (
                    <div key={idx} className="bg-green-50 p-3 rounded">
                      <div>Block #{blk.block_index}</div>
                      <div>Hex: <span className="font-mono text-xs break-all">{blk.decrypted_hex}</span></div>
                      <div>Text: <span className="font-mono">{blk.decrypted_text}</span></div>
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

export default CBCPaddingOraclePage;
