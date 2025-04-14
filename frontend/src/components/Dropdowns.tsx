import React from "react";
import { Card, Tabs, Tab, Box, Typography } from "@mui/material";
import Dropdown from "./Dropdown";
import Loader from "./Loader";
import Guide from "./Guide";
import useDeployment from "../hooks/useDeployment";

const Dropdowns: React.FC = () => {
  const [value, setValue] = React.useState(0); // State to manage the active tab
  const { isLocal } = useDeployment(); // Get deployment status

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue); // Update the active tab
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", mt: 5 }}>
      {/* Main content area with tabs and panels */}
      <Box sx={{ display: "flex" }}>
        {/* Vertical Tabs */}
        <Tabs
          orientation="vertical"
          value={value}
          variant="standard"
          onChange={handleChange}
          sx={{
            borderRight: 1,
            borderColor: "divider",
            width: "200px",
            minWidth: "200px"
          }}
        >
          <Tab sx={{ fontSize: "0.9rem" }} label="Start" />
          <Tab sx={{ fontSize: "0.9rem" }} label="Loader" />
          <Tab sx={{ fontSize: "0.9rem" }} label="Pre-processing" />
          <Tab sx={{ fontSize: "0.9rem" }} label="Reconstruction" />
          <Tab sx={{ fontSize: "0.9rem" }} label="Image Saving" />
          <Tab sx={{ fontSize: "0.9rem" }} label="Post-processing" />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 2, maxWidth: "700px" }}>
          {value === 0 && <Guide />}
          {value === 1 && <Loader />}
          {value === 2 && (
            <Card
              variant="outlined"
              sx={{
                mx: "auto",
                mb: 2,
                p: 2,
                border: "1px solid #89987880",
                borderRadius: "4px",
                minWidth:"650px"
              }}
            >
              <Typography gutterBottom sx={{mb:1}} variant="h6" color="primary" component="div">
                  <strong>Pre-processing methods</strong>
              </Typography>
              <Dropdown name="Normalisation" />
              <Dropdown name="Phase Retrieval" />
              <Dropdown name="Stripe Removal" />
              <Dropdown name="Distortion Correction" />
              <Dropdown name="Rotation Center Finding" />
              <Dropdown name="Morphological Operations" />
            </Card>
          )}
  
          {value === 3 && (
            <Card
              variant="outlined"
              sx={{
                mx: "auto",
                mb: 2,
                p: 2,
                border: "1px solid #89987880",
                borderRadius: "4px",
                minWidth:"650px"
              }}
            >
              <Typography gutterBottom sx={{mb:1}} variant="h6" color="primary" component="div">
                  <strong>Reconstruction algorithms</strong>
              </Typography>
              <Dropdown name="Algorithms" />
            </Card>
          )}
          {value === 4 && (
            <Card
              variant="outlined"
              sx={{
                mx: "auto",
                mb: 2,
                p: 2,
                border: "1px solid #89987880",
                borderRadius: "4px",
                minWidth:"650px"
              }}
            >
              <Typography gutterBottom sx={{mb:1}} variant="h6" color="primary" component="div">
                <strong>Post-proccessing methods</strong>
              </Typography>
              <Dropdown name="Image Saving" />
            </Card>
          )}
  
          {value === 5 && (
            <Card
              variant="outlined"
              sx={{
                mx: "auto",
                mb: 2,
                p: 2,
                border: "1px solid #89987880",
                borderRadius: "4px",
                minWidth:"650px"
              }}
            >
              <Typography gutterBottom sx={{mb:1}} variant="h6" color="primary" component="div">
                <strong>Post-proccessing methods</strong>
              </Typography>
              <Dropdown name="Segmentation" />
              <Dropdown name="Image denoising / Aretefacts Removal" />
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dropdowns;