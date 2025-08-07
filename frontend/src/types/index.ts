export interface UIParameterType {
    type: string;
    value: any;
    desc: string;
  }
  
  export interface MethodParameterProps {
    methodId: string;
    paramName: string;
    paramDetails: UIParameterType;
    value: any;
    isEnabled: boolean;
    onChange: (value: any) => void;
  }
  
  export interface SweepConfig {
    type: 'range' | 'values';
    start?: number;
    stop?: number;
    step?: number;
    values?: string;
  }

  