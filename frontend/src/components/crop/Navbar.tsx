import { Box, Grid2, Slider, Input } from "@mui/material";
import { useState } from "react";

export default function ImageNavbar() {
  const [currentImageIndex, imageIndexSetter] = useState(0);
  const total_images = 100;

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue == "number") {
      imageIndexSetter(newValue);
    } else {
      imageIndexSetter(newValue[0]);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    imageIndexSetter(
      event.target.value === "" ? 0 : Number(event.target.value)
    );
  };

  const handleBlur = () => {
    if (currentImageIndex < 0) {
      imageIndexSetter(0);
    } else if (currentImageIndex > total_images) {
      imageIndexSetter(total_images);
    }
  };

  return (
    <Box style={{ display: "grid", height: "49vh" }}>
      <Grid2 container spacing={2} sx={{ alignItems: "center" }}>
        <Grid2 size="grow">
          <Slider
            value={
              typeof currentImageIndex === "number" ? currentImageIndex : 0
            }
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            max={total_images}
          />
        </Grid2>
        <Grid2>
          <Input
            value={currentImageIndex}
            size="small"
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step: 1,
              min: 0,
              max: total_images,
              type: "number",
              "aria-labelledby": "input-slider",
            }}
          />
        </Grid2>
      </Grid2>
    </Box>
  );
}
