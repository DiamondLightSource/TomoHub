import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Normalisation from './method_components/Normalisation';
import CenterOfRotation from './method_components/CenterOfRotation';
import Reconstruction from './method_components/Reconstruction';
import InputOutput from './Inputdata';
import { useAccordionExpansion } from '../AccordionExpansionContext';

type DropdownProps = {
    name: string;
}

const methodComponents = {
    "Input/Output": InputOutput,
    "Normalisation": Normalisation,
    "Center of Rotation": CenterOfRotation,
    "Reconstruction": Reconstruction
};

const Dropdown: React.FC<DropdownProps> = (props) => {
    const { expandedParent, toggleParentExpansion } = useAccordionExpansion();
    
    const MethodComponent = methodComponents[props.name];

    return (
        <Accordion
            expanded={expandedParent === props.name}
            onChange={() => toggleParentExpansion(props.name)}
        >
            <AccordionSummary
                expandIcon={<ArrowDownwardIcon />}
                aria-controls={`${props.name}-content`}
                id={`${props.name}-header`}
            >
                <Typography>{props.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                {MethodComponent ? <MethodComponent /> : null}
            </AccordionDetails>
        </Accordion>
    )
}

export default Dropdown;