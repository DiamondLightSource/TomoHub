import React from 'react';
import {
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import { useMethods } from "../MethodsContext";
import { ClearAll } from '@mui/icons-material';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit"

export default function Steps() {
  const { methods, clearMethods, removeMethod } = useMethods();

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
            <Box
              key={`${method.id}-method-listItem`}
              sx={{
                background: '#fff',
                color: '#000',
                margin: '10px 0',
                borderRadius: 2,
                p: 1.5,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography fontSize={16} fontWeight={"bold"}>{method.id}</Typography>
                <Box marginLeft={"auto"}>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  size='small'
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="start"
                  aria-label="delete"
                  size='small'
                  onClick={() => removeMethod(method.id)}
                >
                  <DeleteIcon />
                </IconButton>
                </Box>
              </Box>
              <List dense>
                {method.parameters &&
                  Object.entries(method.parameters).map(([key, value]) => (
                    <ListItem key={`${method.id}-${key}`} sx={{ py: 0 }}>
                      <ListItemText
                        primary={`${key}: ${value}`}
                        primaryTypographyProps={{ variant: 'body2',fontSize:'small' }}
                      />
                    </ListItem>
                  ))}
              </List>
            </Box>
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
          height: 700,
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
