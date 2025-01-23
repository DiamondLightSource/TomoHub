import React, { useState, useEffect } from 'react';
import { useMethods } from "../MethodsContext";
import { MethodAccordion } from '../components/method_components/methods_config/MethodAccordion';
import { useAccordionExpansion } from './AccordionExpansionContext';
import { ApiSchema, Method, MethodComponentConfig } from '../types/APIresponse';

export function createMethodComponent({ methodType, fetchMethod }: MethodComponentConfig) {
  return function MethodComponent() {
    const [methods, setMethods] = useState<Method[]>([]);
    useEffect(() => {
      const fetchMethods = async () => {
        try {
          const response = await fetchMethod();
          const methodsList = Object.entries(response as ApiSchema)
            .flatMap(([_modulePath, moduleMethods]) => Object.values(moduleMethods));
          setMethods(methodsList);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchMethods();
    }, []);
    
    const { 
      expandedMethod, 
      expandedParent, 
      toggleMethodExpansion, 
    } = useAccordionExpansion();
    const { methods: selectedMethods, addMethod, removeMethod, updateMethodParameter } = useMethods();
    const isMethodAdded = (methodName: string) =>
      selectedMethods.some((method) => method.method_name === methodName);

    const handleAddMethod = (methodName: string,methodModule:string) => {
      const methodTemplate = methods.find((method) => method.method_name === methodName);
      if (methodTemplate) {
        const defaultParams = Object.fromEntries(
          Object.entries(methodTemplate.parameters).map(
            ([key, paramDetails]) => [key, paramDetails.value]
          )
        );
        addMethod(methodName,methodModule,defaultParams);
      }
    };

    return (
      <div>
        {methods.map((method) => (
          <MethodAccordion
            key={method.method_name}
            method={method}
            isExpanded={
              expandedMethod === method.method_name && 
              expandedParent === methodType
            }
            isMethodAdded={isMethodAdded(method.method_name)}
            currentParameters={
              selectedMethods.find((m) => m.method_name === method.method_name)?.parameters ?? {}
            }
            onExpand={() => toggleMethodExpansion(method.method_name)}
            onAddMethod={() => handleAddMethod(method.method_name,method.module_path)}
            onRemoveMethod={() => removeMethod(method.method_name)}
            onParameterChange={(paramName, value) =>
              updateMethodParameter(method.method_name, paramName, value)
            }
          />
        ))}
      </div>
    );
  };
}