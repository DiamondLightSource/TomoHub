import React, { useState, useEffect } from 'react';
import { useMethods } from '../../contexts/MethodsContext';
import { MethodAccordion } from './config/MethodAccordion';
import {
  ApiMethodsSchema,
  Method,
  MethodComponentConfig,
} from '../../types/APIresponse';

export function createMethodComponent({
  methodType,
  fetchMethod,
}: MethodComponentConfig) {
  return function MethodComponent() {
    const [methods, setMethods] = useState<Method[]>([]);
    const [expandedMethod, setExpandedMethod] = useState<string | null>(null);

    useEffect(() => {
      const fetchMethods = async () => {
        try {
          const response = await fetchMethod();
          const methodsList = Object.entries(
            response as ApiMethodsSchema
          ).flatMap(([_modulePath, moduleMethods]) =>
            Object.values(moduleMethods)
          );
          setMethods(methodsList);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchMethods();
    }, []);

    const toggleMethodExpansion = (methodName: string) => {
      setExpandedMethod(prev => (prev === methodName ? null : methodName));
    };

    const {
      methods: selectedMethods,
      addMethod,
      removeMethod,
      updateMethodParameter,
    } = useMethods();
    const isMethodAdded = (methodName: string) =>
      selectedMethods.some(method => method.method_name === methodName);

    const handleAddMethod = (methodName: string, methodModule: string) => {
      const methodTemplate = methods.find(
        method => method.method_name === methodName
      );
      if (methodTemplate) {
        const defaultParams = Object.fromEntries(
          Object.entries(methodTemplate.parameters).map(
            ([key, paramDetails]) => [key, paramDetails.value]
          )
        );
        addMethod(methodName, methodModule, defaultParams);
      }
    };

    return (
      <div>
        {methods.map(method => (
          <MethodAccordion
            key={method.method_name}
            method={method}
            isExpanded={expandedMethod === method.method_name}
            isMethodAdded={isMethodAdded(method.method_name)}
            currentParameters={
              selectedMethods.find(m => m.method_name === method.method_name)
                ?.parameters ?? {}
            }
            onExpand={expanded => {
              if (expanded) {
                toggleMethodExpansion(method.method_name);
              } else {
                setExpandedMethod(null);
              }
            }}
            onAddMethod={() =>
              handleAddMethod(method.method_name, method.module_path)
            }
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
