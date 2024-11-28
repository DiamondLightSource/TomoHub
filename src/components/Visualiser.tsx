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

export default function Visualiser() {
  const { methods, clearMethods, removeMethod, setMethods } = useMethods();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setMethods((methods) => {
        const oldIndex = methods.findIndex((method) => method.id === active.id);
        const newIndex = methods.findIndex((method) => method.id === over.id);
        
        return arrayMove(methods, oldIndex, newIndex);
      });
    }
  };
  console.log(methods);
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
          <SortableContext items={methods.map(method => method.id)} strategy={verticalListSortingStrategy}>
            <Box sx={{ width: '100%' }}>
              {methods.map((method) => (
                <VisualiserMethods
                  key={method.id}
                  method={method}
                  removeMethod={removeMethod}
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