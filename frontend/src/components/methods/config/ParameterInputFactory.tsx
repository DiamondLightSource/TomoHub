import React from 'react';
import {
  NumericInput,
  BooleanInput,
  LiteralInput,
  CenterInput,
  TextInput,
  TupleInput,
} from "../../../components/methods/config/inputs";

interface ParameterInputFactoryProps {
  paramName: string;
  paramDetails: any;
  value: any;
  isEnabled: boolean;
  onChange: (value: any) => void;
  sweepProps?: {
    onSweepOpen: () => void;
    onSweepCancel: () => void;
    sweepDisplayText: string;
    isSweepActive: boolean;
    isSweepDisabled: boolean;
  };
}

export const ParameterInputFactory: React.FC<ParameterInputFactoryProps> = ({
  paramName,
  paramDetails,
  value,
  isEnabled,
  onChange,
  sweepProps,
}) => {
  const getActualType = (type: string) => {
    return type.replace('Optional[', '').replace(']', '');
  };

  const actualType = getActualType(paramDetails.type);

  // Special case for center parameter
  if (paramName === 'center') {
    return (
      <CenterInput
        paramName={paramName}
        paramDetails={paramDetails}
        value={value}
        isEnabled={isEnabled}
        onChange={onChange}
      />
    );
  }

  // Handle Literal types
  if (actualType.startsWith('Literal[')) {
    return (
      <LiteralInput
        paramName={paramName}
        paramDetails={paramDetails}
        value={value}
        isEnabled={isEnabled}
        onChange={onChange}
      />
    );
  }

  // Handle different parameter types
  switch (actualType) {
    case 'int':
    case 'float':
      return (
        <NumericInput
          paramName={paramName}
          paramDetails={paramDetails}
          value={value}
          isEnabled={isEnabled}
          onChange={onChange}
          {...sweepProps}
        />
      );

    case 'bool':
      return (
        <BooleanInput
          paramName={paramName}
          paramDetails={paramDetails}
          value={value}
          isEnabled={isEnabled}
          onChange={onChange}
        />
      );

    case 'tuple[float, float, float, int]':
      return (
        <TupleInput
          paramName={paramName}
          paramDetails={paramDetails}
          value={value}
          isEnabled={isEnabled}
          onChange={onChange}
        />
      );

    case 'str':
    case 'list':
    case 'Union[float, str, NoneType]':
    case 'ndarray':
      return (
        <TextInput
          paramName={paramName}
          paramDetails={paramDetails}
          value={value}
          isEnabled={isEnabled}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
};
