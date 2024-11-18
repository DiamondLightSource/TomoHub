import * as React from "react";
import { styled } from "@mui/material/styles";
import {
  TextField,
  Select,
  MenuItem,
  Typography,
  Grid,
  Button,
  Stack,
  IconButton,
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  AccordionProps,
  AccordionSummaryProps,
  Tooltip
} from "@mui/material";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import { useMethods } from "../../MethodsContext";
import { corMethods } from "./Methods";


// Styled MUI Accordion components
const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": { borderBottom: 0 },
  "&::before": { display: "none" },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: "#F7F7F2",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": { marginLeft: theme.spacing(1) },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
  background: "#F7F7F2",
}));

// Main component
export default function CenterOfRotation() {
  const [expanded, setExpanded] = React.useState<string | false>("");
  const { methods, addMethod, removeMethod, updateMethodParameter } =
    useMethods();

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };
  
    // Check if the method is added
  const isMethodAdded = (methodId: string) => methods.some((method) => method.id === methodId);

  const handleAddMethod = (methodId: string) => {
    const methodTemplate = corMethods.find((method) => method.id === methodId);
    if (methodTemplate) {
      const defaultParams = Object.fromEntries(
        Object.entries(methodTemplate.parameters).map(
          ([key, [, , defaultValue]]) => [key, defaultValue]
        )
      );
      addMethod(methodId, defaultParams);
    }
  };

  const handleRemoveMethod = (methodId: string) => {
    removeMethod(methodId);
  };

  const renderParameterInput = (
    methodId: string,
    paramName: string,
    [type, helperText, defaultValue]: [string, string, any]
  ) => {
    const method = methods.find((m) => m.id === methodId);
    const currentValue = method?.parameters[paramName] ?? defaultValue;

    const handleInputChange = (
      event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
    ) => {
      const value =
        type === "int"
          ? parseInt(event.target.value as string)
          : parseFloat(event.target.value as string);
      updateMethodParameter(methodId, paramName, value); // Update the specific parameter in context
    };
    const isEnabled = isMethodAdded(methodId);
    switch (type) {
      case "int":
      case "float":
        return (
            <Tooltip title="Integer value" placement="top-start">
          <TextField
            key={paramName}
            label={paramName}
            type="number"
            value={currentValue}
            onChange={handleInputChange}
            variant="outlined"
            disabled={!isEnabled}
            size="small"
            fullWidth
            helperText={helperText}
          />
          </Tooltip>
        );
      case "string":
        return (
            <TextField
              key={paramName}
              label={paramName}
              type="text"
              value={currentValue}
              onChange={handleInputChange}
              variant="outlined"
              disabled={!isEnabled}
              size="small"
              fullWidth
              helperText={helperText}
            />
          );
      case "select":
        return (
          <Select
            key={paramName}
            value={currentValue}
            fullWidth
            variant="outlined"
            size="small"
          >
            {/* Placeholder options for the select input */}
            <MenuItem value="Option 1">Option 1</MenuItem>
            <MenuItem value="Option 2">Option 2</MenuItem>
            <MenuItem value="Option 3">Option 3</MenuItem>
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {corMethods.map((method) => (
        <Accordion
          key={method.id}
          expanded={expanded === method.id}
          onChange={handleChange(method.id)}
        >
          <AccordionSummary
            aria-controls={`${method.id}-content`}
            id={`${method.id}-header`}
          >
            <Typography>{method.methodName}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              <Grid item xs={8}>
                <Typography>
                  {method.id}
                  <IconButton
                    size="small"
                    href={method.linkToDoc}
                    target="_blank"
                  >
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                  <IconButton
                    onClick={() => handleRemoveMethod(method.id)}
                    disabled={!methods.some((m) => m.id === method.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<AddIcon />}
                    onClick={() => handleAddMethod(method.id)}
                    disabled={methods.some((m) => m.id === method.id)}
                  >
                    Add
                  </Button>
                </Stack>
              </Grid>
              {Object.entries(method.parameters).map(
                ([paramName, paramDetails]) => (
                  <Grid item xs={6} key={paramName}>
                    {renderParameterInput(method.id, paramName, paramDetails)}
                  </Grid>
                )
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}
