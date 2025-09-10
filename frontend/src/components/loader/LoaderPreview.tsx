import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Grid2,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import { useLoader, PreviewType } from "../../contexts/LoaderContext";

interface LoaderPreviewProps {
  onClose: () => void;
}

const LoaderPreview: React.FC<LoaderPreviewProps> = ({ onClose }) => {
  const { parameters, setDetectorX, setDetectorY, removePreview } = useLoader();
  const [enableDetectorX, setEnableDetectorX] = useState<boolean>(false);
  const [enableDetectorY, setEnableDetectorY] = useState<boolean>(false);
  const [detectorX, setDetectorXState] = useState<PreviewType>({});
  const [detectorY, setDetectorYState] = useState<PreviewType>({});
  const [showStartOffsetX, setShowStartOffsetX] = useState<boolean>(false);
  const [showStopOffsetX, setShowStopOffsetX] = useState<boolean>(false);
  const [showStartOffsetY, setShowStartOffsetY] = useState<boolean>(false);
  const [showStopOffsetY, setShowStopOffsetY] = useState<boolean>(false);
  const [errors, setErrors] = useState({
    detectorX: false,
    detectorY: false,
  });

  // Sync with context when modal opens
  useEffect(() => {
    if (parameters.preview?.detector_x) {
      setEnableDetectorX(true);
      setDetectorXState(parameters.preview.detector_x);
      setShowStartOffsetX(!!parameters.preview.detector_x.start_offset);
      setShowStopOffsetX(!!parameters.preview.detector_x.stop_offset);
    }
    if (parameters.preview?.detector_y) {
      setEnableDetectorY(true);
      setDetectorYState(parameters.preview.detector_y);
      setShowStartOffsetY(!!parameters.preview.detector_y.start_offset);
      setShowStopOffsetY(!!parameters.preview.detector_y.stop_offset);
    }
  }, [parameters.preview]);

  const validateDetectors = () => {
    const xError = enableDetectorX && (!detectorX.start || !detectorX.stop);
    const yError = enableDetectorY && (!detectorY.start || !detectorY.stop);
    setErrors({
      detectorX: xError,
      detectorY: yError,
    });

    return !xError && !yError;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDetectors()) {
      return;
    }

    if (enableDetectorX) {
      setDetectorX(detectorX);
    } else {
      setDetectorX(null);
    }

    if (enableDetectorY) {
      setDetectorY(detectorY);
    } else {
      setDetectorY(null);
    }

    if (!enableDetectorX && !enableDetectorY) {
      removePreview();
    }
    onClose();
  };

  const handlePresetChange = (
    detector: "x" | "y",
    field: "start" | "stop",
    value: string | null
  ) => {
    const setState = detector === "x" ? setDetectorXState : setDetectorYState;
    setState((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const renderDetectorControls = (
    detector: "x" | "y",
    state: PreviewType,
    setState: React.Dispatch<React.SetStateAction<PreviewType>>,
    showStartOffset: boolean,
    setShowStartOffset: (show: boolean) => void,
    showStopOffset: boolean,
    setShowStopOffset: (show: boolean) => void,
    error: boolean
  ) => {
    return (
      <>
        {/* Start Controls */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Start Position
          </Typography>
          <Grid2 container spacing={1} alignItems="center">
            <Grid2>
              <TextField
                label="Custom Start"
                variant="outlined"
                fullWidth
                type="number"
                size="small"
                value={typeof state.start === "number" ? state.start : ""}
                onChange={(e) =>
                  setState({ ...state, start: Number(e.target.value) })
                }
                disabled={typeof state.start === "string"}
                error={error && !state.start}
                helperText={
                  error && !state.start ? "Start position is required" : ""
                }
                sx={{ paddingRight: -14 }}
                InputProps={{
                  startAdornment: state.start && (
                    <InputAdornment position="start">
                      <IconButton
                        size="small"
                        onClick={() => setState({ ...state, start: undefined })}
                        edge="start"
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <ToggleButtonGroup
                        value={state.start?.toString() || null}
                        exclusive
                        onChange={(_, value) =>
                          handlePresetChange(detector, "start", value)
                        }
                        size="small"
                        sx={{ marginRight: "-14px" }}
                      >
                        <ToggleButton value="begin">Begin</ToggleButton>
                        <ToggleButton value="mid">Mid</ToggleButton>
                        <ToggleButton value="end">End</ToggleButton>
                      </ToggleButtonGroup>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid2>
            <Grid2>
              <Button
                variant="outlined"
                onClick={() => setShowStartOffset(!showStartOffset)}
                size="small"
                sx={{ padding: 0.7 }}
              >
                {showStartOffset ? "Remove Offset" : "Add Offset"}
              </Button>
            </Grid2>
          </Grid2>
        </Box>

        {/* Start Offset */}
        {showStartOffset && (
          <TextField
            label="Start Offset"
            variant="outlined"
            fullWidth
            type="number"
            size="small"
            value={state.start_offset || ""}
            onChange={(e) =>
              setState({ ...state, start_offset: Number(e.target.value) })
            }
            sx={{ mb: 1 }}
          />
        )}

        {/* Stop Controls */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Stop Position
          </Typography>
          <Grid2 container spacing={1} alignItems="center">
            <Grid2>
              <TextField
                label="Custom Stop"
                variant="outlined"
                fullWidth
                type="number"
                size="small"
                value={typeof state.stop === "number" ? state.stop : ""}
                onChange={(e) =>
                  setState({ ...state, stop: Number(e.target.value) })
                }
                disabled={typeof state.stop === "string"}
                error={error && !state.stop}
                helperText={
                  error && !state.stop ? "Stop position is required" : ""
                }
                InputProps={{
                  startAdornment: state.stop && (
                    <InputAdornment position="start">
                      <IconButton
                        size="small"
                        onClick={() => setState({ ...state, stop: undefined })}
                        edge="start"
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <ToggleButtonGroup
                        value={state.stop?.toString() || null}
                        exclusive
                        onChange={(_, value) =>
                          handlePresetChange(detector, "stop", value)
                        }
                        size="small"
                        sx={{ marginRight: "-14px" }}
                      >
                        <ToggleButton value="begin">Begin</ToggleButton>
                        <ToggleButton value="mid">Mid</ToggleButton>
                        <ToggleButton value="end">End</ToggleButton>
                      </ToggleButtonGroup>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid2>
            <Grid2>
              <Button
                variant="outlined"
                onClick={() => setShowStopOffset(!showStopOffset)}
                size="small"
                sx={{ padding: 0.7 }}
              >
                {showStopOffset ? "Remove Offset" : "Add Offset"}
              </Button>
            </Grid2>
          </Grid2>
        </Box>

        {/* Stop Offset */}
        {showStopOffset && (
          <TextField
            label="Stop Offset"
            variant="outlined"
            fullWidth
            type="number"
            size="small"
            value={state.stop_offset || ""}
            onChange={(e) =>
              setState({ ...state, stop_offset: Number(e.target.value) })
            }
            sx={{ mb: 1 }}
          />
        )}
      </>
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ position: "relative" }}>
      {/* Close Icon at the top-right corner */}
      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", top: 8, right: 8 }}
      >
        <CloseIcon />
      </IconButton>

      <Typography variant="h6" gutterBottom>
        Configure Preview
      </Typography>

      {/* Detector X Section */}
      <Box sx={{ mb: 1, p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={enableDetectorX}
              onChange={(e) => {
                setEnableDetectorX(e.target.checked);
                if (!e.target.checked) {
                  setDetectorXState({});
                }
                setErrors((prev) => ({ ...prev, detectorX: false }));
              }}
            />
          }
          label="Enable Detector X"
        />
        {enableDetectorX &&
          renderDetectorControls(
            "x",
            detectorX,
            setDetectorXState,
            showStartOffsetX,
            setShowStartOffsetX,
            showStopOffsetX,
            setShowStopOffsetX,
            errors.detectorX
          )}
      </Box>

      {/* Detector Y Section */}
      <Box sx={{ mb: 1, p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={enableDetectorY}
              onChange={(e) => {
                setEnableDetectorY(e.target.checked);
                if (!e.target.checked) {
                  setDetectorYState({});
                }
                setErrors((prev) => ({ ...prev, detectorY: false }));
              }}
            />
          }
          label="Enable Detector Y"
        />
        {enableDetectorY &&
          renderDetectorControls(
            "y",
            detectorY,
            setDetectorYState,
            showStartOffsetY,
            setShowStartOffsetY,
            showStopOffsetY,
            setShowStopOffsetY,
            errors.detectorY
          )}
      </Box>

      {/* Save Button */}
      <Button type="submit" variant="contained" fullWidth>
        Save
      </Button>
    </Box>
  );
};

export default LoaderPreview;
