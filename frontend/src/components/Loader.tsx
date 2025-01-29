import React, { useState } from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  Modal,
} from "@mui/material";
import ContrastIcon from "@mui/icons-material/Contrast";
import PreviewIcon from "@mui/icons-material/Visibility"; // Icon for the preview button
import { useLoader } from "../contexts/LoaderContext"; // Import the custom hook
import LoaderPreview from "./LoaderPreview"; // Import the new modal component

const Loader: React.FC = () => {
  const {
    method,
    module_path,
    parameters,
    setDataPath,
    setImageKeyPath,
    setRotationAnglesDataPath,
    setUserDefinedRotationAngles,
    setDarks,
    setFlats,
    removeDarksAndFlats,
  } = useLoader();

  const [mode, setMode] = useState("setAddress");
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false); // State for modal visibility

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  const toggleExtraFields = () => {
    if (showExtraFields) {
      removeDarksAndFlats(); // Remove darks and flats when the option is deselected
    }
    setShowExtraFields(!showExtraFields);
  };

  const handlePreviewClick = () => {
    setIsPreviewModalOpen(true); // Open the modal
  };

  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false); // Close the modal
  };

  return (
    <Card variant="outlined" sx={{ mx: "auto", mb: 2, p: 2, border: "1px solid #89987880", borderRadius: "4px" }}>
      {/* Title and Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography gutterBottom variant="h6" color="primary" component="div">
          <strong>Loader</strong>
        </Typography>
        <Box>
          <Button
            variant="contained"
            onClick={toggleExtraFields}
            endIcon={<ContrastIcon />}
            sx={{ fontSize: "0.7rem", mr: 1 }} // Add margin to separate buttons
          >
            {showExtraFields ? "Remove" : "Load separate darks and flats"}
          </Button>
          <Button
            variant="contained"
            onClick={handlePreviewClick}
            endIcon={<PreviewIcon />}
            sx={{ fontSize: "0.7rem" }}
          >
            Enable Preview
          </Button>
        </Box>
      </Box>

      {/* Input Field */}
      <TextField
        label="data path"
        variant="outlined"
        fullWidth
        size="small"
        value={parameters.data_path}
        onChange={(e) => setDataPath(e.target.value)}
        placeholder="Enter memory address or reference"
        sx={{ mb: 1 }}
      />

      {/* Conditionally render the image_key_path text field */}
      {!showExtraFields && (
        <TextField
          label="image path"
          variant="outlined"
          fullWidth
          size="small"
          value={parameters.image_key_path || ""}
          onChange={(e) => setImageKeyPath(e.target.value)}
          placeholder="Enter memory address or reference"
          sx={{ mb: 1 }}
        />
      )}

      {/* Toggle Button */}
      <ToggleButtonGroup
        value={mode}
        exclusive
        size="small"
        color="primary"
        onChange={handleModeChange}
        aria-label="Rotation Angle Mode"
        fullWidth
        sx={{ mb: 1 }}
      >
        <ToggleButton value="setAddress" aria-label="Set Address">
          use rotation angle within data
        </ToggleButton>
        <ToggleButton value="defineCustom" aria-label="Define Custom">
          set custom rotation angle
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Input Fields */}
      {mode === "setAddress" ? (
        <TextField
          label="Path to rotation angle"
          variant="outlined"
          fullWidth
          size="small"
          value={parameters.rotation_angles.data_path || ""}
          onChange={(e) => setRotationAnglesDataPath(e.target.value)}
          placeholder="Enter memory address or reference"
          sx={{ mb: 1 }}
        />
      ) : (
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={4}>
            <TextField
              label="Start angle"
              variant="outlined"
              fullWidth
              size="small"
              value={parameters.rotation_angles.user_defined?.start_angle || ""}
              onChange={(e) =>
                setUserDefinedRotationAngles(
                  e.target.value,
                  parameters.rotation_angles.user_defined?.stop_angle || "",
                  parameters.rotation_angles.user_defined?.angles_total || ""
                )
              }
              placeholder="Enter X-axis rotation"
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Stop angle"
              variant="outlined"
              fullWidth
              size="small"
              value={parameters.rotation_angles.user_defined?.stop_angle || ""}
              onChange={(e) =>
                setUserDefinedRotationAngles(
                  parameters.rotation_angles.user_defined?.start_angle || "",
                  e.target.value,
                  parameters.rotation_angles.user_defined?.angles_total || ""
                )
              }
              placeholder="Enter Y-axis rotation"
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Total angle"
              variant="outlined"
              fullWidth
              size="small"
              value={parameters.rotation_angles.user_defined?.angles_total || ""}
              onChange={(e) =>
                setUserDefinedRotationAngles(
                  parameters.rotation_angles.user_defined?.start_angle || "",
                  parameters.rotation_angles.user_defined?.stop_angle || "",
                  e.target.value
                )
              }
              placeholder="Enter Z-axis rotation"
            />
          </Grid>
        </Grid>
      )}

      {/* Extra Fields */}
      {showExtraFields && (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle1" gutterBottom>
              Darks
            </Typography>
            <TextField
              label="Path to darks file"
              variant="outlined"
              fullWidth
              size="small"
              value={parameters.darks?.file || ""}
              onChange={(e) => setDarks(e.target.value, parameters.darks?.data_path || "")}
              sx={{ mb: 1 }}
            />
            <TextField
              label="Data path"
              variant="outlined"
              fullWidth
              size="small"
              value={parameters.darks?.data_path || ""}
              onChange={(e) => setDarks(parameters.darks?.file || "", e.target.value)}
              sx={{ mb: 1 }}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle1" gutterBottom>
              Flats
            </Typography>
            <TextField
              label="Path"
              variant="outlined"
              fullWidth
              size="small"
              value={parameters.flats?.file || ""}
              onChange={(e) => setFlats(e.target.value, parameters.flats?.data_path || "")}
              sx={{ mb: 1 }}
              placeholder="Path to flats file"
            />
            <TextField
              label="Data path"
              variant="outlined"
              fullWidth
              size="small"
              value={parameters.flats?.data_path || ""}
              onChange={(e) => setFlats(parameters.flats?.file || "", e.target.value)}
              sx={{ mb: 1 }}
            />
          </Grid>
        </Grid>
      )}

      {/* Modal for Preview */}
      <Modal open={isPreviewModalOpen} onClose={handleClosePreviewModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 1,
            borderRadius: 1,
          }}
        >
          <LoaderPreview onClose={handleClosePreviewModal} /> {/* Pass the close handler */}
        </Box>
      </Modal>
    </Card>
  );
};

export default Loader;