import React from 'react';
import { useMethods } from "../../MethodsContext";
import { corMethods } from "./methods_config/Methods";
import { MethodAccordion } from './methods_config/MethodAccordion';
import { useAccordionExpansion } from '../../AccordionExpansionContext';

export default function CenterOfRotation() {
  const { 
    expandedMethod, 
    expandedParent, 
    toggleMethodExpansion, 
  } = useAccordionExpansion();
  const { methods, addMethod, removeMethod, updateMethodParameter } = useMethods();
  console.log(expandedMethod);
  const isMethodAdded = (methodName: string) =>
    methods.some((method) => method.name === methodName);

  const handleAddMethod = (methodId: string) => {
    const methodTemplate = corMethods.find((method) => method.id === methodId);
    if (methodTemplate) {
      const defaultParams = Object.fromEntries(
        Object.entries(methodTemplate.parameters).map(
          ([key, [, , ,defaultValue]]) => [key, defaultValue]
        )
      );
      addMethod(methodId, defaultParams);
    }
  };

  return (
    <div>
      {corMethods.map((method) => (
        <MethodAccordion
          key={method.id}
          method={method}
          isExpanded={
            expandedMethod === method.id && 
            expandedParent === 'Center of Rotation' // Add parent check
          }
          isMethodAdded={isMethodAdded(method.id)}
          currentParameters={
            methods.find((m) => m.name === method.id)?.parameters ?? {}
          }
          onExpand={() => {
            toggleMethodExpansion(method.id);
          }}
          onAddMethod={() => handleAddMethod(method.id)}
          onRemoveMethod={() => removeMethod(method.id)}
          onParameterChange={(paramName, value) =>
            updateMethodParameter(method.id, paramName, value)
          }
        />
      ))}
    </div>
  );
}