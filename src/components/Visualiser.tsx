import  React from 'react';
import {Button,Box,Typography,List,ListItem,ListItemText,IconButton,Divider} from '@mui/material';
import { useMethods } from "../MethodsContext";
import { ClearAll } from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete"

  export default function Steps() {
    const { methods,clearMethods,removeMethod } = useMethods();

    const methodsDisplay = () =>{ 
      if(methods.length===0){
        return(
          <Box sx={{m:'auto',alignSelf:'center'}}>
          <Typography>
            No methods selected
          </Typography>
          </Box>
        );
      }
      else{
        return (
          <List dense={true} sx={{width:'100%'}}>
          {methods.map((method) => (
            <ListItem
            sx={{background:'#fff',color:'#000',margin:'10px 0',borderRadius:2}}
              key={`${method.id}-method-listItem`} // Use a unique key for each item
              secondaryAction={
                <IconButton edge="start" aria-label="delete" onClick={()=>removeMethod(method.id)}>
                  <DeleteIcon />
                </IconButton>
                
              }
            >
              <ListItemText primary={method.id} 
              secondary={
                <List dense={true}>
                  {method.parameters &&
                    Object.entries(method.parameters).map(([key, value]) => (
                      <ListItem key={`${method.id}-${key}`} sx={{ py: 0 }}>
                        <ListItemText
                          primary={`${key}: ${value}`}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                </List>
              }
              />
            </ListItem>
            
          ))}
          
        </List>
        );
      }
    };

    return (
      <Box sx={{ width: 400,backgroundColor:'#222725',color:'#fff',padding:2,borderRadius:2,height:'max-content' }}>
        <Box sx={{backgroundColor:'#646464',width:'100%',display:'flex',p:2,borderRadius:2,height:700,overflowY:"scroll"}}>
          {methodsDisplay()}
        </Box>
        <Button variant="contained" size="medium" sx={{marginTop:1}} color='error' fullWidth startIcon={<ClearAll/>} onClick={() => clearMethods()}>
          Clear all methods
        </Button>
        
      </Box>
    );
  }