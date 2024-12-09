import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of the context
interface AccordionExpansionContextType {
  expandedMethod: string | null;
  expandedParent: string | null;
  setExpandedMethod: (methodId: string | null) => void;
  setExpandedParent: (parentId: string | null) => void;
  toggleMethodExpansion: (methodId: string) => void;
  toggleParentExpansion: (parentId: string) => void;
  expandMethodAndParent: (parentId: string, methodId: string) => void;
}

// Create the context
const AccordionExpansionContext = createContext<AccordionExpansionContextType | undefined>(undefined);

// Create a provider component
export const AccordionExpansionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);
  const [expandedParent, setExpandedParent] = useState<string | null>(null);

  const toggleMethodExpansion = (methodId: string) => {
    // If the method is already expanded, collapse it; otherwise, expand it
    setExpandedMethod(prev => prev === methodId ? null : methodId);
  };

  const toggleParentExpansion = (parentId: string) => {
    // If the parent is already expanded, collapse it; otherwise, expand it
    setExpandedParent(prev => prev === parentId ? null : parentId);
  };

  const expandMethodAndParent = (parentId: string, methodId: string) => {
    // Ensure both parent and method are expanded
    setExpandedMethod(prev => prev === methodId ? null : methodId);
    setExpandedParent(prev => prev === parentId ? null : parentId);
  };

  return (
    <AccordionExpansionContext.Provider 
      value={{ 
        expandedMethod, 
        expandedParent,
        setExpandedMethod, 
        setExpandedParent,
        toggleMethodExpansion, 
        toggleParentExpansion,
        expandMethodAndParent
      }}
    >
      {children}
    </AccordionExpansionContext.Provider>
  );
};

// Custom hook to use the accordion expansion context
export const useAccordionExpansion = () => {
  const context = useContext(AccordionExpansionContext);
  
  if (context === undefined) {
    throw new Error('useAccordionExpansion must be used within an AccordionExpansionProvider');
  }
  
  return context;
};