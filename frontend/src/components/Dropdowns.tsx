import React from "react";
import Dropdown from "./Dropdown";
import { Card, Grid } from "@mui/material"; // Import Grid component
import Loader from "./Loader";
import Guide from "./Guide";

const Dropdowns: React.FC = () => {
  return (
    <Grid container spacing={2}>
      {/* Row 1 */}
      <Grid item xs={6}>
        <Guide />
      </Grid>
      <Grid item xs={6}>
        <Loader />
      </Grid>

      {/* Row 2 */}
      <Grid item xs={6}>
        <Card
          variant="outlined"
          sx={{
            mx: "auto",
            mb: 2,
            p: 2,
            border: "1px solid #89987880",
            borderRadius: "4px",
          }}
        >
          <Dropdown name="Normalisation" />
          <Dropdown name="Phase Retrieval" />
          <Dropdown name="Stripe Removal" />
          <Dropdown name="Distortion Correction" />
          <Dropdown name="Rotation Center Finding" />
          <Dropdown name="Morphological Operations" />
        </Card>
      </Grid>
      <Grid item xs={6}>
        <Dropdown name="Reconstruction" />
        <Dropdown name="Image Saving" />
      </Grid>

      {/* Row 3 */}
      <Grid item xs={6}>
        <Card
          variant="outlined"
          sx={{
            mx: "auto",
            mb: 2,
            p: 2,
            border: "1px solid #89987880",
            borderRadius: "4px",
          }}
        >
          <Dropdown name="Segmentation" />
          <Dropdown name="Image denoising / Artefacts Removal" />
        </Card>
      </Grid>
    </Grid>
  );
};

export default Dropdowns;