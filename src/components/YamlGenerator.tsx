import { stringify } from 'yaml';
import { useMethods } from '../MethodsContext';
import {Button,Box } from '@mui/material';
import TextField from '@mui/material/TextField';
import { paths } from './modulePaths';
import React from 'react';

const YMLG = () => {
  const {methods} = useMethods();
  const [yamlFileName,setYamlFileName] = React.useState<string>("config");
  const changeFileName = (event:React.ChangeEvent<HTMLInputElement>) =>{
    setYamlFileName(event.target.value);
  }
  const createAndDownloadYAML = () => {


    // Convert methods context state to YAML
    const transformedMethods = methods.map((method) => {
      // Construct the new object with modifications
      const transformedMethod = {
        method: method.name, // Replace "name" with "method"\
        module_path: paths[method.name as keyof typeof paths], // Explicit type assertion
        parameters: { ...method.parameters }, // Copy parameters
      };
    
      // Add conditional extra data
      if (method.name === "method2") {
        return {
          ...transformedMethod,
          extra_object: { extraKey: "extraValue" }, // Add an extra object if the condition is met
        };
      }
    
      return transformedMethod;
    });
    
    const yamlContent = stringify(transformedMethods);
    console.log(yamlContent);
    // Create a Blob object with YAML content
    const blob = new Blob([yamlContent], { type: 'application/x-yaml' });
  
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${yamlFileName}.yaml`;
  
    // Programmatically trigger the download
    link.click();
  
    // Clean up
    URL.revokeObjectURL(link.href);
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
