import React, { useState } from 'react';
import { JsonForms } from '@jsonforms/react';
import {
  materialCells,
  materialRenderers,
} from '@jsonforms/material-renderers';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { Box, Button, Typography } from '@mui/material';

interface SweepRUNFormProps {
  schema: JsonSchema;
  uiSchema: UISchemaElement;
  onSubmit: (parameters: object) => void;
}

const SweepRUNForm: React.FC<SweepRUNFormProps> = ({
  schema,
  uiSchema,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<object>({});
  const [errors, setErrors] = useState<any[]>([]);

  const handleSubmit = () => {
    if (errors.length === 0) {
      onSubmit(formData);
    } else {
      console.error('Form validation errors:', errors);
    }
  };

  return (
    <Box>
      <Typography variant="h5" align="center" gutterBottom>
        Sweep Run Form
      </Typography>
      <JsonForms
        schema={schema}
        uischema={uiSchema}
        data={formData}
        renderers={materialRenderers}
        cells={materialCells}
        onChange={({ data, errors }) => {
          setFormData(data);
          setErrors(errors || []);
        }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ mt: 2 }}
      >
        Submit
      </Button>
    </Box>
  );
};

export default SweepRUNForm;