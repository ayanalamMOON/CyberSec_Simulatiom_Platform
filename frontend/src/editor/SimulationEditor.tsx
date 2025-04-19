import React from 'react';
import { useEditor } from './EditorContext';
import Editor from '@monaco-editor/react';

const SimulationEditor: React.FC = () => {
  const { content, setContent } = useEditor();
  
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
    }
  };

  return (
    <div>
      <h3>Simulation Editor</h3>
      <div style={{ height: '400px', border: '1px solid #ccc' }}>
        <Editor
          height="100%"
          defaultLanguage="python"
          value={content}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
};

export default SimulationEditor;
