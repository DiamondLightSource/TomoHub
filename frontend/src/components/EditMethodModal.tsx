import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  CircularProgress,
  Box,
  Alert,
  IconButton,
} from '@mui/material';
import { methodsService } from '../api/services';
import { ParameterInputFactory } from './method_components/methods_config/ParameterInputFactory';
import { Method } from '../contexts/MethodsContext';
import InfoIcon from '@mui/icons-material/Info';

interface EditMethodModalProps {
  open: boolean;
  onClose: () => void;
  method: Method | null;
  onSave: (methodName: string, updatedParameters: Record<string, any>) => void;
}

interface MethodSchema {
  method_name: string;
  module_path: string;
  method_desc: string;
  method_doc: string;
  parameters: Record<string, {
    type: string;
    value: any;
    desc: string;
  }>;
}

export const EditMethodModal: React.FC<EditMethodModalProps> = ({
  open,
  onClose,
  method,
  onSave,
}) => {
  const [methodSchema, setMethodSchema] = useState<MethodSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (open && method) {
      fetchMethodSchema();
    }
  }, [open, method]);

  const fetchMethodSchema = async () => {
    if (!method) return;

    setLoading(true);
    setError(null);

    try {
      const allMethodsResponse = await methodsService.getAllMethods();
      
      // Find the method schema by matching module_path and method_name
      let foundSchema: MethodSchema | null = null as MethodSchema | null;
      
        // Type assertion to handle the response structure
      const methodsData = allMethodsResponse as Record<string, Record<string, any>>;
      
      Object.entries(methodsData).forEach(([modulePath, methods]) => {
        if (methods && typeof methods === 'object') {
          Object.entries(methods).forEach(([methodName, schema]) => {
            if (
              methodName === method.method_name &&
              modulePath === method.method_module
            ) {
              foundSchema = schema as MethodSchema;
            }
          });
        } 
      });

      if (!foundSchema) {
        throw new Error(`Method ${method.method_name} not found in API response`);
      }

      setMethodSchema(foundSchema);

      // Initialize parameter values with current method values
      const initialValues: Record<string, any> = {};
      
      // Add type assertion for foundSchema.parameters
      const schemaParameters = foundSchema.parameters as Record<string, {
        type: string;
        value: any;
        desc: string;
      }>;
      
      Object.entries(schemaParameters).forEach(([paramName, paramSchema]) => {
        // Use current method value if it exists, otherwise use schema default
        if (method.parameters && method.parameters[paramName] !== undefined) {
          // Extract the value from the parameter object structure
          const currentParam = method.parameters[paramName];
          // Check if currentParam has a 'value' property (parameter object structure)
          // or if it's just the raw value
          initialValues[paramName] = (currentParam && typeof currentParam === 'object' && 'value' in currentParam) 
            ? currentParam.value 
            : currentParam;
        } else {
          initialValues[paramName] = paramSchema.value;
        }
      });

      setParameterValues(initialValues);
    } catch (err) {
      console.error('Error fetching method schema:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch method schema');
    } finally {
      setLoading(false);
    }
  };

  const handleParameterChange = (paramName: string, value: any) => {
    setParameterValues(prev => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const handleSave = () => {
    if (!method) return;

    // Transform parameter values to match the expected format
    const formattedParameters: Record<string, any> = {};
    Object.entries(parameterValues).forEach(([paramName, value]) => {
      formattedParameters[paramName] = value;
    });

    onSave(method.method_name, formattedParameters);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!method) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh', maxHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Edit Method: {method.method_name}
          {methodSchema && methodSchema.method_doc && (
            <IconButton 
              size="small" 
              href={methodSchema.method_doc} 
              target="_blank"
              sx={{ ml: 1 }}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Module: {method.method_module}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {methodSchema && !loading && (
          <Box>
            {methodSchema.method_desc && (
              <Typography variant="body2" sx={{ mb: 3, fontStyle: 'italic' }}>
                {methodSchema.method_desc}
              </Typography>
            )}

            <Grid container spacing={2}>
              {Object.entries(methodSchema.parameters).map(([paramName, paramDetails]) => (
                <Grid item xs={12} sm={6} key={paramName}>
                  <ParameterInputFactory
                    paramName={paramName}
                    paramDetails={paramDetails}
                    value={parameterValues[paramName]}
                    isEnabled={true}
                    onChange={(value) => handleParameterChange(paramName, value)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={loading || !!error}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};