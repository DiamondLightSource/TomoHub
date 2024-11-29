import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Normalisation from './method_components/Normalisation';
import CenterOfRotation from './method_components/CenterOfRotation';
import Reconstruction from './method_components/Reconstruction';
import React  from 'react';
import InputOutput from './Inputdata';

type DropdownProps = {
    name:string;
}

 const Dropdown:React.FC<DropdownProps> = (props) =>{

  function renderMethods(){
    if(props.name=="Input/Output"){
      return <InputOutput />
    }
    else if(props.name=="Normalisation"){
      return <Normalisation />
    }
    else if(props.name==="Center of Rotation"){
      return <CenterOfRotation />
    }
    else if(props.name=="Reconstruction"){
      return <Reconstruction />
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
            {renderMethods()}
        </AccordionDetails>
      </Accordion>
    )
}
export default Dropdown