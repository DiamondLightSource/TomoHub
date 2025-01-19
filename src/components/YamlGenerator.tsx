import { stringify } from 'yaml';
import { useMethods } from '../MethodsContext';
import {Button,Box,Typography,Alert } from '@mui/material';
import TextField from '@mui/material/TextField';
import React from 'react';

const YMLG = () => {
  const {methods} = useMethods();
  const [yamlFileName,setYamlFileName] = React.useState<string>("config");
  // const [showRunCommand, setShowRunCommand] = React.useState<boolean>(false); // State to control
  const changeFileName = (event:React.ChangeEvent<HTMLInputElement>) =>{
    setYamlFileName(event.target.value);
  }
  const createAndDownloadYAML = () => {

    // Convert methods context state to YAML
    const transformedMethods = methods.map((method) => {
      // Construct the new object with modifications
      const transformedMethod = {
        method: method.method_name, // Replace "name" with "method"\
        module_path: method.method_module, // Explicit type assertion
        parameters: { ...method.parameters }, // Copy parameters
      };
    
      // Add conditional extra data
      if (method.method_name === "find_center_vo" || method.method_name === "find_center_pc") {
        return {
          ...transformedMethod,
          id : "centering",
          sideoutput : { cor: "center_of_rotation" }, // Add an extra object if the condition is met
        };
      }    
      return transformedMethod;
    });
  
    const yamlContent = stringify(transformedMethods);
    
    // Create a Blob object with YAML content
    const blob = new Blob([yamlContent], { type: 'application/x-yaml' });
  
    // Create a download link and download 
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${yamlFileName}.yaml`;
    link.click();
    // Clean up
    URL.revokeObjectURL(link.href);
    // setShowRunCommand(true);
  };
  
  return (
    <Box
        sx={{
          display: 'flex',
          gap: 2, // Adds space between the buttons
        }}
      >
    <TextField id="standard-basic" label="select a name for your config file" sx={{ flex: 1.5}} variant="standard" value={yamlFileName} onChange={changeFileName}/>
     <Button variant="contained" onClick={createAndDownloadYAML} sx={{ flex: 1}} size='large'>
        get conifg 
     </Button>
    </Box>  
);
};

export default YMLG;
