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
        const oldIndex = methods.findIndex((method) => method.name === active.id);
        const newIndex = methods.findIndex((method) => method.name === over.id);
        
        return arrayMove(methods, oldIndex, newIndex);
      });
    }
  };

  const handleEditMethod = (methodName: string) => {
    // Determine the parent accordion based on method name
    const getParentAccordion = (methodName: string) => {
      const parentMappings = {
        'find_center_vo': 'Center of Rotation',
        'find_center_pc': 'Center of Rotation',
        'normalize': 'Normalisation',
        'minus_log': 'Normalisation',
        'recon' : 'Reconstruction'
        // Add more mappings as needed
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
          <SortableContext items={methods.map(method => method.name)} strategy={verticalListSortingStrategy}>
            <Box sx={{ width: '100%' }}>
              {methods.map((method) => (
                <VisualiserMethods
                  key={method.name}
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