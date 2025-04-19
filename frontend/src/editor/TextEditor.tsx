import React from 'react';
import { useEditor } from './EditorContext';
import Editor from '@monaco-editor/react';

const TextEditor: React.FC = () => {
  const { content, setContent } = useEditor();
  
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
    }
  };

  return (
    <div>
      <h3>Text Editor</h3>
      <div style={{ height: '400px', border: '1px solid #ccc' }}>
        <Editor
          height="100%"
          defaultLanguage="plaintext"
          value={content}
          onChange={handleEditorChange}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            wordWrap: 'on',
            lineNumbers: 'on',
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};

export default TextEditor;
