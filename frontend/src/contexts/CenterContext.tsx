import React, { createContext, useContext, useState, ReactNode } from "react";

interface CenterContextProps {
  selectedCenter: number; // Change type to number
  setSelectedCenter: (center: number) => void; // Update setter to accept a number
}

const CenterContext = createContext<CenterContextProps | undefined>(undefined);

export const CenterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCenter, setSelectedCenter] = useState<number>(0); // Default value is 0

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