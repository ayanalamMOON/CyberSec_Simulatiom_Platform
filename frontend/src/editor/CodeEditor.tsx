import React, { useState, useEffect } from 'react';
import { useEditor } from './EditorContext';
import Editor from '@monaco-editor/react';

const CodeEditor: React.FC = () => {
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
        background: '#252526', 
        color: 'white',
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px'
      }}>
        <h3 style={{ margin: 0 }}>Code Editor</h3>
        {isEditorReady && (
          <span style={{ fontSize: '0.8rem', color: '#8c8c8c' }}>
            Ready
          </span>
        )}
      </div>
      <div style={{ 
        height: editorHeight, 
        border: '2px solid #252526', 
        borderRadius: '4px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        position: 'relative'
      }}>
        <Editor
          height="100%"
          defaultLanguage="python"
          value={content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineHeight: 24,
            padding: { top: 10, bottom: 10 },
            automaticLayout: true,
            fontFamily: 'Consolas, "Courier New", monospace',
            renderLineHighlight: 'all',
            rulers: [80],
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            formatOnPaste: true,
            scrollbar: {
              verticalScrollbarSize: 12,
              horizontalScrollbarSize: 12
            }
          }}
          loading={<div style={{ 
            display: 'flex', 
            height: '100%', 
            justifyContent: 'center', 
            alignItems: 'center',
            color: '#8c8c8c'
          }}>Loading editor...</div>}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
