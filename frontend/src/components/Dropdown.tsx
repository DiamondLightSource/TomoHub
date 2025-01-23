import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import * as MethodComponents from './method_components';
import { useAccordionExpansion } from '../contexts/AccordionExpansionContext';

type DropdownProps = {
    name: string;
}

const methodComponents = {
    "Image Saving": MethodComponents.ImageSaving,
    "Segmentation": MethodComponents.Segmentation,
    "Morphological Operations": MethodComponents.Morphological,
    "Normalisation": MethodComponents.Normalisation,
    "Phase Retrieval": MethodComponents.PhaseRetrieval,
    "Stripe Removal": MethodComponents.StripeRemoval,
    "Image denoising / Aretefacts Removal": MethodComponents.ImageDenoiseArtefactRemoval,
    "Distortion Correction": MethodComponents.DistortionCorrection,
    "Rotation Center Finding": MethodComponents.RotationCenterFinding,
    "Algorithms": MethodComponents.Reconstruction,
    
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
    );
};

export default Dropdown;