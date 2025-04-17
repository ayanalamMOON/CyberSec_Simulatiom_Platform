import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define types for our visualization context
export type VisualizationMode = 'static' | 'animated' | 'interactive';

export interface VisualizationState {
  mode: VisualizationMode;
  speed: number;
  showLabels: boolean;
  showTooltips: boolean;
  colorScheme: string;
}

interface VisualizationContextType {
  state: VisualizationState;
  setState: React.Dispatch<React.SetStateAction<VisualizationState>>;
  resetState: () => void;
}

// Default visualization settings
const defaultState: VisualizationState = {
  mode: 'static',
  speed: 1,
  showLabels: true,
  showTooltips: true,
  colorScheme: 'default'
};

// Create the context
const VisualizationContext = createContext<VisualizationContextType | undefined>(undefined);

// Provider component
interface VisualizationProviderProps {
  children: ReactNode;
}

export const VisualizationProvider: React.FC<VisualizationProviderProps> = ({ children }) => {
  const [state, setState] = useState<VisualizationState>(defaultState);

  const resetState = () => {
    setState(defaultState);
  };

  return (
    <VisualizationContext.Provider value={{ state, setState, resetState }}>
      {children}
    </VisualizationContext.Provider>
  );
};

// Custom hook for using the visualization context
export const useVisualization = (): VisualizationContextType => {
  const context = useContext(VisualizationContext);
  if (context === undefined) {
    throw new Error('useVisualization must be used within a VisualizationProvider');
  }
  return context;
};

export default VisualizationContext;