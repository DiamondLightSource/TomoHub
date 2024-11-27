// DraggableMethodItem.tsx
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
import { ConnectableElement, useDrag, useDrop } from 'react-dnd';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface VisualiserMethodProps {
  method: {
    id: string;
    parameters?: Record<string, any>;
  };
  removeMethod: (id: string) => void;
  moveMethod: (draggedId: string, hoverId: string) => void;
}

const VisualiserMethod: React.FC<VisualiserMethodProps> = ({ method, removeMethod, moveMethod }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'METHOD_ITEM',
    item: { id: method.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop({
    accept: 'METHOD_ITEM',
    hover: (draggedItem: { id: string }) => {
      if (draggedItem.id !== method.id) {
        moveMethod(draggedItem.id, method.id);
        draggedItem.id = method.id;
      }
    },
  });

  const hasParameters = method.parameters && Object.keys(method.parameters).length > 0;

  return (
    <Box
      ref={(node: ConnectableElement) => drag(drop(node))}
      sx={{
        background: '#fff',
        color: '#000',
        margin: '10px 0',
        borderRadius: 2,
        p: 1.5,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography fontSize={16} fontWeight="bold">{method.id}</Typography>
        <Box marginLeft="auto">
          <IconButton edge="end" aria-label="edit" size="small">
            <EditIcon />
          </IconButton>
          <IconButton edge="start" aria-label="delete" size="small" onClick={() => removeMethod(method.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
      {hasParameters && (
                <Accordion
                sx={{
                  backgroundColor: '#f5f5f5', 
                  marginTop: 1,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`parameters-content-${method.id}`}
                  id={`parameters-header-${method.id}`}
                >
                  <Typography variant="body2" color="textSecondary">Parameters</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {method.parameters &&
                      Object.entries(method.parameters).map(([key, value]) => (
                        <ListItem key={`${method.id}-${key}`} sx={{ py: 0 }}>
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

export default VisualiserMethod;
