import React from 'react';
import { useEditor } from './EditorContext';

const TextEditor: React.FC = () => {
  const { content, setContent } = useEditor();
  return (
    <div>
      <h3>Text Editor</h3>
      <textarea
        value={content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
        rows={10}
        cols={60}
        style={{ width: '100%' }}
      />
    </div>
  );
};

export default TextEditor;
