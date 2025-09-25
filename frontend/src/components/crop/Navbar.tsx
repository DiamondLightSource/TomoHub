import React, { useRef } from "react";
import { Box, Grid2, Slider, Input } from "@mui/material";

interface ImageNavbarProps {
  total_images: number;
  currentImageIndex: number;
  imageIndexSetter: React.Dispatch<React.SetStateAction<number>>;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ImageNavbar({
  total_images,
  currentImageIndex,
  imageIndexSetter,
  setIsDragging,
}: ImageNavbarProps) {
  const timeoutRef = useRef<number | null>(null);

  const handleSliderChange = (
    _event: Event | React.SyntheticEvent<Element, Event>,
    newValue: number | number[]
  ) => {
    if (typeof newValue == "number") {
      imageIndexSetter(newValue);
    } else {
      imageIndexSetter(newValue[0]);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "" ? 0 : Number(event.target.value);
    setIsDragging(true);
    imageIndexSetter(value);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsDragging(false);
    }, 300);
  };

  const handleBlur = () => {
    if (currentImageIndex < 0) {
      imageIndexSetter(0);
    } else if (currentImageIndex > total_images - 1) {
      imageIndexSetter(total_images - 1);
    }
  };

  return (
    <Box style={{ display: "grid", height: "49vh" }}>
      <Grid2 container spacing={2} sx={{ alignItems: "center" }}>
        <Grid2 size="grow">
          <Slider
            value={currentImageIndex}
            onChange={(e, val) => {
              setIsDragging(true);
              handleSliderChange(e, val);
            }}
            onChangeCommitted={(e, val) => {
              setIsDragging(false);
              handleSliderChange(e, val);
            }}
            max={total_images - 1}
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
              max: total_images - 1,
              type: "number",
              "aria-labelledby": "input-slider",
            }}
          />
        </Grid2>
      </Grid2>
    </Box>
  );
}
