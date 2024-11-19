import { createContext, useState, ReactNode, useContext } from "react";

// Define Method type
type Method = {
  id: string;
  parameters: { [key: string]: any };  
};

// Define context type
type MethodsContextType = {
  methods: Method[];
  addMethod: (methodId: string, defaultParams: { [key: string]: any }) => void;
  removeMethod: (methodId: string) => void;
  updateMethodParameter: (methodId: string, paramName: string, value: any) => void;
};

const MethodsContext = createContext<MethodsContextType | undefined>(undefined);

export const MethodsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [methods, setMethods] = useState<Method[]>([]);

  // Add method to the context with default parameters
  const addMethod = (methodId: string, defaultParams: { [key: string]: any }) => {
    setMethods((prev) => [
      ...prev,
      { id: methodId, parameters: { ...defaultParams } },
    ]);
  };

  // Remove method by its ID
  const removeMethod = (methodId: string) => {
    setMethods((prev) => prev.filter((method) => method.id !== methodId));
  };

  // Update a specific method parameter value
  const updateMethodParameter = (methodId: string, paramName: string, value: any) => {
    setMethods((prev) =>
      prev.map((method) =>
        method.id === methodId
          ? {
              ...method,
              parameters: {
                ...method.parameters,
                [paramName]: value,
              },
            }
          : method
      )
    );
  };

  return (
    <MethodsContext.Provider value={{ methods, addMethod, removeMethod, updateMethodParameter }}>
      {children}
    </MethodsContext.Provider>
  );
};

export const useMethods = () => {
  const context = useContext(MethodsContext);
  if (!context) {
    throw new Error('useMethods must be used within a MethodsProvider');
  }
  return context;
};
