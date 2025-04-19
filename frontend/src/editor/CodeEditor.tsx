import React from 'react';
import { useEditor } from './EditorContext';
import Editor from '@monaco-editor/react';

const CodeEditor: React.FC = () => {
  const { content, setContent } = useEditor();
  
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
    }
  };
  
  return (
    <div>
      <h3>Code Editor</h3>
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
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
