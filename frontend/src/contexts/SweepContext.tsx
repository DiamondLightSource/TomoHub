import React, { createContext, useContext, useState } from 'react';

interface SweepContextType {
  activeSweep: { methodId: string; paramName: string } | null;
  setActiveSweep: (methodId: string, paramName: string) => void;
  clearActiveSweep: () => void;
}

const SweepContext = createContext<SweepContextType | undefined>(undefined);

export const SweepProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSweep, setActiveSweepState] = useState<{ methodId: string; paramName: string } | null>(null);

  const setActiveSweep = (methodId: string, paramName: string) => {
    setActiveSweepState({ methodId, paramName });
  };

  const clearActiveSweep = () => {
    setActiveSweepState(null);
  };

  return (
    <SweepContext.Provider value={{ activeSweep, setActiveSweep, clearActiveSweep }}>
      {children}
    </SweepContext.Provider>
  );
};

export const useSweep = () => {
  const context = useContext(SweepContext);
  if (!context) {
    throw new Error('useSweep must be used within a SweepProvider');
  }
  return context;
};