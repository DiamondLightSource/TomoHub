import * as React from "react";
import { styled } from "@mui/material/styles";
import { TextField, Select, MenuItem, Typography, Grid, Button, Stack, IconButton, Accordion as MuiAccordion, AccordionSummary as MuiAccordionSummary, AccordionDetails as MuiAccordionDetails, AccordionProps, AccordionSummaryProps } from "@mui/material";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import { useMethods } from "../../MethodsContext";

// Define Method template
const corMethods = [
  {
    id: "find_center_vo",
    methodName: "find COR using Naghia Vo's method ",
    linkToDoc: "https://tomopy.readthedocs.io/en/stable/api/tomopy.recon.rotation.html#tomopy.recon.rotation.find_center_vo",
    parameters: {
      ind: ["int","Index of the slice to be used for reconstruction", null],
      smin: ["int","Coarse search radius", -50],
      smax: ["int","Coarse search radius", 50],
      srad: ["float","Fine search radius", 6],
      step: ["float","Step of fine searching", 0.25],
      ratio: ["float","The ratio between the FOV of the camera and the size of object", 0.5],
      drop: ["int","Drop lines around vertical center of the mask", 20],
      ncore: ["int","Number of cores that will be assigned to jobs", null],
    },
  },
  {
    id:"find_center_pc",
    methodName: "find COR using phase correlation in Fourier space",
    linkToDoc : "https://tomopy.readthedocs.io/en/stable/api/tomopy.recon.rotation.html#tomopy.recon.rotation.find_center_pc",
    parameters : {}
  }
];

// Styled MUI Accordion components
const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": { borderBottom: 0 },
  "&::before": { display: "none" },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />} {...props} />
))(({ theme }) => ({
  backgroundColor: "#F7F7F2",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": { transform: "rotate(90deg)" },
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
  const { methods, addMethod, removeMethod } = useMethods();

  const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  };

  // Check if the method is added
  const isMethodAdded = (methodId: string) => methods.some((method) => method.id === methodId);

  // Add method handler
  const handleAddMethod = (methodId: string) => {
    addMethod({ id: methodId });
  };

  // Remove method handler
  const handleRemoveMethod = (methodId: string) => {
    removeMethod(methodId);
  };

  // Render parameter inputs based on type
  const renderParameterInput = (paramName: string, [type, helperText ,defaultValue]: [string, string,any], isEnabled: boolean) => {
    switch (type) {
      case "int":
      case "float":
        return (
          <TextField
            key={paramName}
            label={paramName}
            type="number"
            defaultValue={defaultValue}
            variant="outlined"
            size="small"
            disabled={!isEnabled}
            helperText={helperText}
            fullWidth
          />
        );
      case "select":
        return (
          <Select
            key={paramName}
            defaultValue={defaultValue}
            disabled={!isEnabled}
            fullWidth
            variant="outlined"
            size="small"
          >
            {/* Placeholder values for select options */}
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
      {corMethods.map((method) => {
        const isAdded = isMethodAdded(method.id);
        return (
          <Accordion key={method.id} expanded={expanded === method.id} onChange={handleChange(method.id)}>
            <AccordionSummary aria-controls={`${method.id}-content`} id={`${method.id}-header`}>
              <Typography>{method.methodName}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1}>
                <Grid item xs={8}>
                  <Typography>
                    {method.id}
                    <IconButton size="small" href={method.linkToDoc} target="_blank">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <IconButton onClick={() => handleRemoveMethod(method.id)} disabled={!isAdded}>
                      <DeleteIcon />
                    </IconButton>
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<AddIcon />}
                      onClick={() => handleAddMethod(method.id)}
                      disabled={isAdded}
                    >
                      Add
                    </Button>
                  </Stack>
                </Grid>
                {Object.entries(method.parameters).map(([paramName, paramDetails]) => (
                  <Grid item xs={6} key={paramName}>
                    {renderParameterInput(paramName, paramDetails as [string,string, any], isAdded)}
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
}
