import { createContext, useState, ReactNode, useContext } from "react";

type Method = {
  id : string;
  parameters?:{ [key:string] : string | number | boolean | object};
};

type MethodsContextType = {
    methods: Method[];
    addMethod: (method: Method) => void;
    removeMethod: (methodId: string) => void;
};

const MethodsContext = createContext<MethodsContextType | undefined>(undefined);

export const MethodsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [methods, setMethods] = useState<Method[]>([]);

  const addMethod = (method: Method) => {
    setMethods((prev) => [...prev, method]);
  };

  const removeMethod = (methodId: string) => {
    setMethods((prev) => prev.filter((method) => method.id !== methodId));
  };

  return (
    <MethodsContext.Provider value={{ methods, addMethod, removeMethod }}>
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