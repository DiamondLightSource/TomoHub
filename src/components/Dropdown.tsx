import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Normalisation from './method_components/Normalisation';

type DropdownProps = {
    name:string;
}

export default function Dropdown(props:DropdownProps){
  function renderMethods(){
    if(props.name=="Data Loader"){
      return <TextField id="dataPath--input" label="Data" variant="outlined" required helperText="Please enter path to your data file" fullWidth/>
    }
    else if(props.name=="Normalisation"){
      return <Normalisation />
    }
  }
  return (
        <Accordion>
        <AccordionSummary
          expandIcon={<ArrowDownwardIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography>{props.name}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{background:'#fff',p:2,borderRadius:1.5}}>
            {renderMethods()}
          </Box>
        </AccordionDetails>
      </Accordion>
    )
}