import React, { useState, useEffect } from 'react';
import { useEditor } from './EditorContext';
import Editor from '@monaco-editor/react';

const TextEditor: React.FC = () => {
  const { content, setContent } = useEditor();
  const [editorHeight, setEditorHeight] = useState('70vh');
  const [isEditorReady, setIsEditorReady] = useState(false);
  
  useEffect(() => {
    // Adjust height on window resize for responsiveness
    const handleResize = () => {
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      setEditorHeight(`${vh * 0.7}px`);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial size
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
    }
  };

  const handleEditorDidMount = () => {
    setIsEditorReady(true);
  };

  return (
    <div className="editor-container" style={{ width: '100%', margin: '10px 0' }}>
      <div className="editor-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '8px', 
        background: '#f3f3f3', 
        color: '#333333',
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <h3 style={{ margin: 0 }}>Text Editor</h3>
        {isEditorReady && (
          <span style={{ fontSize: '0.8rem', color: '#6b6b6b' }}>
            Ready
          </span>
        )}
      </div>
      <div style={{ 
        height: editorHeight, 
        border: '2px solid #e0e0e0', 
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        position: 'relative'
      }}>
        <Editor
          height="100%"
          defaultLanguage="plaintext"
          value={content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineHeight: 24,
            padding: { top: 10, bottom: 10 },
            wordWrap: 'on',
            lineNumbers: 'on',
            automaticLayout: true,
            fontFamily: 'Consolas, "Courier New", monospace',
            renderLineHighlight: 'all',
            scrollbar: {
              verticalScrollbarSize: 12,
              horizontalScrollbarSize: 12
            },
            folding: true,
            glyphMargin: false,
            contextmenu: true
          }}
          loading={<div style={{ 
            display: 'flex', 
            height: '100%', 
            justifyContent: 'center', 
            alignItems: 'center',
            color: '#6b6b6b'
          }}>Loading editor...</div>}
        />
      </div>
    </div>
  );
};

export default TextEditor;
