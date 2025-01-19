import React,{createContext, useState, ReactNode, useContext } from "react";

export type Method = {
  method_name: string; // The name of the method
  method_module:string;
  parameters: { 
    [key: string]: { // Each key is a parameter name
      type: string;  // The type of the parameter
      desc: string;  // A description of the parameter
      value: any;    // The value of the parameter (can be any type)
    };
  };
};

type MethodsContextType = {
  methods: Method[];
  addMethod: (methodName: string,methodModule:string, defaultParams: { [key: string]: any }) => void;
  removeMethod: (methodName: string) => void;
  updateMethodParameter: (methodName: string, paramName: string, value: any) => void;
  clearMethods: () => void;
  setMethods: React.Dispatch<React.SetStateAction<Method[]>>;
};

const MethodsContext = createContext<MethodsContextType | undefined>(undefined);

export const MethodsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [methods, setMethods] = useState<Method[]>([]);

  const addMethod = (methodName: string, methodModule:string,defaultParams: { [key: string]: any }) => {
    setMethods((prev) => [
      ...prev,
      { method_name: methodName,method_module:methodModule, parameters: { ...defaultParams } },
    ]);
  };

  const removeMethod = (methodId: string) => {
    setMethods((prev) => prev.filter((method) => method.method_name !== methodId));
  };

  const updateMethodParameter = (methodName: string, paramName: string, value: any) => {
    setMethods((prev) =>
      prev.map((method) =>
        method.method_name === methodName
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

  const clearMethods = () => {
    setMethods([]); 
  };

  return (
    <MethodsContext.Provider value={{ methods, addMethod, removeMethod, updateMethodParameter, clearMethods, setMethods }}>
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