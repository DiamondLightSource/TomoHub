// Visualiser.tsx
import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useMethods } from '../MethodsContext';
import { ClearAll } from '@mui/icons-material';
import VisualiserMethods from './VisualiserMethods';

export default function Visualiser() {
  const { methods, clearMethods, removeMethod, setMethods } = useMethods();

  const moveMethod = (draggedId: string, hoverId: string) => {
    const draggedIndex = methods.findIndex((method) => method.id === draggedId);
    const hoverIndex = methods.findIndex((method) => method.id === hoverId);
    if (draggedIndex === -1 || hoverIndex === -1) return;
    const updatedMethods = [...methods];
    const [draggedMethod] = updatedMethods.splice(draggedIndex, 1);
    updatedMethods.splice(hoverIndex, 0, draggedMethod);
    setMethods(updatedMethods); // Update the context state
  };

  const methodsDisplay = () => {
    if (methods.length === 0) {
      return (
        <Box sx={{ m: 'auto', alignSelf: 'center' }}>
          <Typography>No methods selected</Typography>
        </Box>
      );
    } else {
      return (
        <Box sx={{ width: '100%' }}>
          {methods.map((method) => (
            <VisualiserMethods
              key={method.id}
              method={method}
              removeMethod={removeMethod}
              moveMethod={moveMethod}
            />
          ))}
        </Box>
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
