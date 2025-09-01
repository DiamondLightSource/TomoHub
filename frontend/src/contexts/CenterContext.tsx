import React, { createContext, useContext, useState, ReactNode } from "react";

interface CenterContextProps {
  selectedCenter: number;
  setSelectedCenter: (center: number) => void;
}

const CenterContext = createContext<CenterContextProps | undefined>(undefined);

export const CenterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCenter, setSelectedCenter] = useState<number>(0);

  return (
    <CenterContext.Provider value={{ selectedCenter, setSelectedCenter }}>
      {children}
    </CenterContext.Provider>
  );
};

export const useCenter = () => {
  const context = useContext(CenterContext);
  if (!context) {
    throw new Error("useCenter must be used within a CenterProvider");
  }
  return context;
};
