import React from 'react';
import { useEditor } from './EditorContext';

const SimulationEditor: React.FC = () => {
  const { content, setContent } = useEditor();
  return (
    <div>
      <h3>Simulation Editor</h3>
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

export default SimulationEditor;
