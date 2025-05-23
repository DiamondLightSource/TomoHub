import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PipelineMethodProps {
  method: {
    method_name: string;
    parameters?: Record<string, any>;
  };
  removeMethod: (name: string) => void;
  editMethod: (name: string) => void;

}

const PipelineMethod: React.FC<PipelineMethodProps> = ({ 
  method, 
  removeMethod, 
  editMethod
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: method.method_name });

  const style = {
    transform: transform
    ? CSS.Transform.toString({ ...transform, x: 0 }) // Force `x` to always be `0`
    : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasParameters = method.parameters && Object.keys(method.parameters).length > 0;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        background: '#fff',
        color: '#000',
        margin: '10px 0',
        borderRadius: 2,
        p: 0.5,
        position: 'relative',
      }}
    >
      <Box 
        {...attributes} 
        {...listeners}
        sx={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'move',
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          px: 1,
        }}
      >
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
      }}>
        <DragIndicatorIcon />
        <Typography fontSize={method.method_name.length > 25 ? 11 : 15} fontWeight="bold">
          {method.method_name}
        </Typography>
        <Box marginLeft="auto">
          <IconButton 
            edge="end" 
            aria-label="edit" 
            size="small" 
            onClick={()=>editMethod(method.method_name)}
            disabled
          >
            <EditIcon />
          </IconButton>
          <IconButton 
            edge="start" 
            aria-label="delete" 
            size="small" 
            onClick={() => removeMethod(method.method_name)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
      
      {hasParameters && (
        <Accordion
          sx={{
            backgroundColor: '#fff', 
            marginTop: 1,
            pointerEvents: 'auto', // Ensure accordion is clickable
            p:0,
            boxShadow:0,
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`parameters-content-${method.method_name}`}
            id={`parameters-header-${method.method_name}`}
            sx={{
              m:0,
              p:"0 10px",
              minHeight:0,
              '&.Mui-expanded': {
                minHeight:0
              },
            }}
          >
            <Typography variant="body2" color="textSecondary" fontSize={13}>Parameters</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{p:0.2}}>
            <List dense sx={{p:0,mb:1}}>
              {method.parameters &&
                Object.entries(method.parameters).map(([key, value]) => (
                  <ListItem key={`${method.method_name}-${key}`} sx={{ py: 0 , pl:1,pr:1}}>
                    <ListItemText
                      primary={`${key}: ${value}`}
                      primaryTypographyProps={{ variant: 'body2', fontSize: 'small' }}
                    />
                  </ListItem>
                ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

export default PipelineMethod;