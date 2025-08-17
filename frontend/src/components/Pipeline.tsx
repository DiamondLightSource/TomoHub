import React, { useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useMethods } from '../contexts/MethodsContext';
import { ClearAll } from '@mui/icons-material';
import PipelineMethod from './PipelineMethod';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useCenter } from '@/contexts/CenterContext';
import { EditMethodModal } from '@/components/EditMethodModal';
import { Method } from '@/contexts/MethodsContext';

const Pipeline: React.FC = () => {
  const { methods, clearMethods, removeMethod, setMethods, updateMethodParameter } = useMethods();
  const { selectedCenter } = useCenter();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<Method | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.name !== over.id) {
      setMethods(methods => {
        const oldIndex = methods.findIndex(
          method => method.method_name === active.id
        );
        const newIndex = methods.findIndex(
          method => method.method_name === over.id
        );

        return arrayMove(methods, oldIndex, newIndex);
      });
    }
  };

  const handleEditMethod = (methodName: string) => {
    const method = methods.find(m => m.method_name === methodName);
    if (method) {
      setSelectedMethod(method);
      setEditModalOpen(true);
    }
  };

  const handleSaveEditedMethod = (methodName: string, updatedParameters: Record<string, any>) => {
    // Update all parameters for the method
    Object.entries(updatedParameters).forEach(([paramName, value]) => {
      updateMethodParameter(methodName, paramName, value);
    });
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedMethod(null);
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={methods.map(method => method.method_name)}
            strategy={verticalListSortingStrategy}
          >
            <Box sx={{ width: '100%' }}>
              {methods
                .filter(
                  method => !method.method_name.startsWith('standard_tomo')
                )
                .map(method => (
                  <PipelineMethod
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

  const centerDisplayText =
    selectedCenter !== 0 ? selectedCenter.toString() : 'auto';

  return (
    <>
      <Box
        sx={{
          width: 350,
          backgroundColor: '#222725',
          color: '#fff',
          padding: 2,
          borderRadius: 2,
          height: 'max-content',
          mt: 2,
        }}
      >
        <Typography
          gutterBottom
          sx={{
            fontWeight: 'bold',
            marginBottom: 1,
            fontSize: '13px',
            textAlign: 'center',
            color: selectedCenter !== 0 ? '#4caf50' : '#fff', // Green when selected, white when auto
          }}
        >
          Pipeline Center of Rotation : {centerDisplayText}
          {selectedCenter !== 0 && (
            <Typography
              component="span"
              sx={{
                fontSize: '10px',
                color: '#4caf50',
                ml: 0.5,
              }}
            >
              ✓
            </Typography>
          )}
        </Typography>

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

      <EditMethodModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        method={selectedMethod}
        onSave={handleSaveEditedMethod}
      />
    </>
  );
};

export default Pipeline;
