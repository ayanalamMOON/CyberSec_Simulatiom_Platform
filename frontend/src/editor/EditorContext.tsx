import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface EditorContextType {
  content: string;
  setContent: (value: string) => void;
}

interface EditorProviderProps {
  children: ReactNode;
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditor must be used within an EditorProvider');
  return context;
};

export const EditorProvider: React.FC<EditorProviderProps> = ({ 
  children, 
  initialContent = '', 
  onContentChange 
}) => {
  const [content, setContent] = useState(initialContent);
  
  // Notify parent component when content changes
  useEffect(() => {
    if (onContentChange) {
      onContentChange(content);
    }
  }, [content, onContentChange]);

  return (
    <EditorContext.Provider value={{ content, setContent }}>
      {children}
    </EditorContext.Provider>
  );
};
