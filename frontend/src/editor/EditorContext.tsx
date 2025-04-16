import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EditorContextType {
  content: string;
  setContent: (value: string) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditor must be used within an EditorProvider');
  return context;
};

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState('');
  return (
    <EditorContext.Provider value={{ content, setContent }}>
      {children}
    </EditorContext.Provider>
  );
};
