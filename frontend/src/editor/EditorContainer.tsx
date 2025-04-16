import React, { useState } from 'react';
import { EditorProvider } from './EditorContext';
import CodeEditor from './CodeEditor';
import TextEditor from './TextEditor';
import SimulationEditor from './SimulationEditor';

const EditorContainer: React.FC = () => {
  const [active, setActive] = useState<'code' | 'text' | 'simulation'>('code');

  return (
    <EditorProvider>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setActive('code')}>Code Editor</button>
        <button onClick={() => setActive('text')}>Text Editor</button>
        <button onClick={() => setActive('simulation')}>Simulation Editor</button>
      </div>
      {active === 'code' && <CodeEditor />}
      {active === 'text' && <TextEditor />}
      {active === 'simulation' && <SimulationEditor />}
    </EditorProvider>
  );
};

export default EditorContainer;
