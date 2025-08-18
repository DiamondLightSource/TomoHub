import React from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  TextField,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface SweepModalProps {
  isOpen: boolean;
  onClose: () => void;
  paramName: string;
  activeTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  start: number | null;
  stop: number | null;
  step: number | null;
  values: string;
  onStartChange: (value: number) => void;
  onStopChange: (value: number) => void;
  onStepChange: (value: number) => void;
  onValuesChange: (value: string) => void;
  onDone: () => void;
  isFormValid: boolean;
}

export const SweepModal: React.FC<SweepModalProps> = ({
  isOpen,
  onClose,
  paramName,
  activeTab,
  onTabChange,
  start,
  stop,
  step,
  values,
  onStartChange,
  onStopChange,
  onStepChange,
  onValuesChange,
  onDone,
  isFormValid,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 2,
          borderRadius: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography id="modal-title" sx={{ fontSize: 15 }}>
            <strong>Sweep {paramName} Parameter</strong>
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Tabs value={activeTab} onChange={onTabChange} aria-label="tabs">
          <Tab sx={{ width: '50%' }} label="Range" />
          <Tab sx={{ width: '50%' }} label="Values" />
        </Tabs>

        {activeTab === 0 && (
          <Box sx={{ mt: 1 }}>
            <TextField
              label="Start"
              type="number"
              fullWidth
              required
              size="small"
              value={start ?? ''}
              onChange={e => onStartChange(parseFloat(e.target.value))}
              sx={{ mb: 1 }}
            />
            <TextField
              label="Stop"
              type="number"
              fullWidth
              required
              size="small"
              value={stop ?? ''}
              onChange={e => onStopChange(parseFloat(e.target.value))}
              sx={{ mb: 1 }}
            />
            <TextField
              label="Step"
              type="number"
              fullWidth
              required
              size="small"
              value={step ?? ''}
              onChange={e => onStepChange(parseFloat(e.target.value))}
              sx={{ mb: 1 }}
            />
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ mt: 1 }}>
            <TextField
              label="Values"
              type="text"
              fullWidth
              size="small"
              required
              value={values}
              onChange={e => onValuesChange(e.target.value)}
              sx={{ mb: 1 }}
              placeholder="Enter comma-separated numbers (e.g., 1, 2, 3)"
            />
          </Box>
        )}

        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={onDone}
            disabled={!isFormValid}
            fullWidth
          >
            Done
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
