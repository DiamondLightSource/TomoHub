import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useMethods } from '../MethodsContext';
import { ClearAll } from '@mui/icons-material';
import VisualiserMethods from './VisualiserMethods';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { useAccordionExpansion } from '../AccordionExpansionContext';

const Visualiser:React.FC = () => {
  const { methods, clearMethods, removeMethod, setMethods } = useMethods();
  const { expandMethodAndParent } = useAccordionExpansion(); // Use the context

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.name !== over.id) {
      setMethods((methods) => {
        const oldIndex = methods.findIndex((method) => method.method_name === active.id);
        const newIndex = methods.findIndex((method) => method.method_name === over.id);
        
        return arrayMove(methods, oldIndex, newIndex);
      });
    }
  };

  const handleEditMethod = (methodName: string) => {
    // Determine the parent accordion based on method name
    const getParentAccordion = (methodName: string) => {
      const parentMappings = {
        'save_to_images' : 'Image Saving',
        'rescale_to_int' : 'Image Saving',
        'binary_thresholding' : 'Segmentation',
        'data_reducer' : 'Morphological Operations',
        'sino_360_to_180' : 'Morphological Operations',
        'data_resampler' : 'Morphological Operations',
        'normalize': 'Normalisation',
        'paganin_filter' : 'Phase Retrieval',
        'paganin_filter_savu' : 'Phase Retrieval',
        'paganin_filter_tomopy' : 'Phase Retrieval',
        'remove_stripe_based_sorting' : 'Stripe Removal',
        'remove_stripe_ti' : 'Stripe Removal',
        'remove_all_stripe' : 'Stripe Removal',
        'raven_filter' : 'Stripe Removal',
        'distortion_correction_proj_discorpy' : 'Distortion Correction',
        'find_center_vo': 'Rotation Center Finding',
        'find_center_pc': 'Rotation Center Finding',
        'find_center_360' : 'Rotation Center Finding',        
        'FBP' : 'Reconstruction',
        'LPRec' : 'Reconstruction',
        'SIRT' : 'Reconstruction',
        'CGLS' : 'Reconstruction',
        'remove_outlier' : 'Image denoising / Aretefacts Removal',
        'median_filter' : 'Image denoising / Aretefacts Removal',
        'total_variation_PD' : 'Image denoising / Aretefacts Removal',
        'total_variation_ROF' : 'Image denoising / Aretefacts Removal',
      };

      // Find a matching key or default to a parent if exact match not found
      const parentKey = Object.keys(parentMappings).find(key => 
        methodName.includes(key)
      );

      return parentKey ? parentMappings[parentKey] : 'Center of Rotation';
    };

    const parentAccordion = getParentAccordion(methodName);
    
    // Expand both parent and method
    expandMethodAndParent(parentAccordion, methodName);
  } 
  
  const methodsDisplay = () => {
    if (methods.length === 0) {
      return (
        <Box sx={{ m: 'auto', alignSelf: 'center' }}>
          <Typography>No methods selected</Typography>
        </Box>
      );
    } else {
      return (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={methods.map(method => method.method_name)} strategy={verticalListSortingStrategy}>
            <Box sx={{ width: '100%' }}>
              {methods.map((method) => (
                <VisualiserMethods
                  key={method.method_name}
                  method={method}
                  removeMethod={removeMethod}
                  editMethod={handleEditMethod}
                />
              ))}
            </Box>
          </SortableContext>
        </DndContext>
      );
    }
  };

  return (
    <Box
      sx={{
        width: 400,
        backgroundColor: '#222725',
        color: '#fff',
        padding: 2,
        borderRadius: 2,
        height: 'max-content',
      }}
    >
      <Box
        sx={{
          backgroundColor: '#646464',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          borderRadius: 2,
          height: 500,
          overflowY: 'scroll',
        }}
      >
        {methodsDisplay()}
      </Box>
      <Button
        variant="contained"
        size="medium"
        sx={{ marginTop: 1 }}
        color="error"
        fullWidth
        startIcon={<ClearAll />}
        onClick={() => clearMethods()}
      >
        Clear all methods
      </Button>
    </Box>
  );
}

export default Visualiser;