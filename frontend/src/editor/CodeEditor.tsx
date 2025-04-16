import React from 'react';
import { useEditor } from './EditorContext';

const CodeEditor: React.FC = () => {
  const { content, setContent } = useEditor();
  return (
    <div>
      <h3>Code Editor</h3>
      <textarea
        value={content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
        rows={10}
        cols={60}
        style={{ fontFamily: 'monospace', width: '100%' }}
      />
    </div>
  );
};

export default CodeEditor;
