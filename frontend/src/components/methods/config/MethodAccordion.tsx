import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '../../../components/methods/config/StyledAccordion';
import { MethodHeader } from '../../../components/methods/config/MethodHeader';
import { MethodParameter } from '../../../components/methods/config/MethodParameter';
import Method from '../../../types/method';

interface MethodAccordionProps {
  method: Method;
  isExpanded: boolean;
  isMethodAdded: boolean;
  currentParameters: { [key: string]: any };
  onExpand: (isExpanded: boolean) => void;
  onAddMethod: () => void;
  onRemoveMethod: () => void;
  onParameterChange: (paramName: string, value: any) => void;
}

export const MethodAccordion: React.FC<MethodAccordionProps> = ({
  method,
  isExpanded,
  isMethodAdded,
  currentParameters,
  onExpand,
  onAddMethod,
  onRemoveMethod,
  onParameterChange,
}) => (
  <Accordion
    expanded={isExpanded}
    onChange={(_, newExpanded) => onExpand(newExpanded)}
  >
    <AccordionSummary
      aria-controls={`${method.method_name}-content`}
      id={`${method.method_name}-header`}
    >
      <Typography>{method.method_name}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Grid container spacing={1}>
        <MethodHeader
          id={method.method_desc}
          linkToDoc={method.method_doc}
          isMethodAdded={isMethodAdded}
          onAddMethod={onAddMethod}
          onRemoveMethod={onRemoveMethod}
        />
        {Object.entries(method.parameters).map(([paramName, paramDetails]) => (
          <MethodParameter
            key={paramName}
            methodId={method.method_name}
            paramName={paramName}
            paramDetails={paramDetails}
            value={currentParameters?.[paramName]}
            isEnabled={isMethodAdded}
            onChange={value => onParameterChange(paramName, value)}
          />
        ))}
      </Grid>
    </AccordionDetails>
  </Accordion>
);
