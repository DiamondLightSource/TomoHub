import React from 'react';
import { Grid, Typography } from "@mui/material";
import { Accordion, AccordionSummary, AccordionDetails } from './StyledAccordion';
import { MethodHeader } from './MethodHeader';
import { MethodParameter } from './MethodParameter';
import Method from '../uitypes';

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
      aria-controls={`${method.id}-content`}
      id={`${method.id}-header`}
    >
      <Typography>{method.methodName}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Grid container spacing={1}>
        <MethodHeader
          id={method.id}
          linkToDoc={method.linkToDoc}
          isMethodAdded={isMethodAdded}
          onAddMethod={onAddMethod}
          onRemoveMethod={onRemoveMethod}
        />
        {Object.entries(method.parameters).map(([paramName, paramDetails]) => (
          <MethodParameter
            key={paramName}
            methodId={method.id}
            paramName={paramName}
            paramDetails={paramDetails}
            value={currentParameters?.[paramName]}
            isEnabled={isMethodAdded}
            onChange={(value) => onParameterChange(paramName, value)}
          />
        ))}
      </Grid>
    </AccordionDetails>
  </Accordion>
);