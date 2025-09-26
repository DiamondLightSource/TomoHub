import { Box, Grid2, Slider, Input, Button, Tooltip } from "@mui/material";
import Undo from "@mui/icons-material/Undo";
import PlayArrowOutlined from "@mui/icons-material/PlayArrowOutlined";
import StopOutlined from "@mui/icons-material/StopOutlined";
import Clear from "@mui/icons-material/Clear";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import type { SelectionOperations } from "./SelectionOperations";
import { useState } from "react";

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// waits 300ms and then changes image index state
async function playFrame(
  setImageIndex: React.Dispatch<React.SetStateAction<number>>,
  frame_index: number
) {
  await sleep(300);
  setImageIndex(frame_index);
}

// checks if the play animation should be playing
function checkAnimation(
  currentImageIndex: number,
  preanimationImageIndex: number,
  total_images: number,
  animationPlaying: boolean,
  setAnimationPlaying: React.Dispatch<React.SetStateAction<boolean>>,
  setImageIndex: React.Dispatch<React.SetStateAction<number>>,
  setPreanimationImageIndex: React.Dispatch<React.SetStateAction<number>>
) {
  if (animationPlaying) {
    // reached the end of the animation
    if (currentImageIndex == total_images - 1) {
      setAnimationPlaying(false);
      playFrame(setImageIndex, preanimationImageIndex);
      setPreanimationImageIndex(-1);
    } else {
      // go to the next frame in animation
      // this will cause a change in state, causing a refresh of the component
      // letting us iterate through all images
      playFrame(setImageIndex, currentImageIndex + 1);
    }
  }
  // animation stopped prematurely
  else if (preanimationImageIndex != -1) {
    playFrame(setImageIndex, preanimationImageIndex);
    setPreanimationImageIndex(-1);
  }
}

interface ImageNavbarProps {
  totalImages: number;
  currentImageIndex: number;
  setImageIndex: React.Dispatch<React.SetStateAction<number>>;
  selection_operations: SelectionOperations;
}

export default function ImageNavbar({
  totalImages: total_images,
  currentImageIndex,
  setImageIndex: setImageIndex,
  selection_operations,
}: ImageNavbarProps) {
  const [animationPlaying, setAnimationPlaying] = useState(false);
  const [preanimationImageIndex, setPreanimationImageIndex] = useState(-1);

  // will cause a state change (and refresh) if an animation should be playing
  checkAnimation(
    currentImageIndex,
    preanimationImageIndex,
    total_images,
    animationPlaying,
    setAnimationPlaying,
    setImageIndex,
    setPreanimationImageIndex
  );

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      setImageIndex(newValue);
    } else {
      setImageIndex(newValue[0]);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageIndex(event.target.value === "" ? 0 : Number(event.target.value));
  };

  const handleBlur = () => {
    if (currentImageIndex < 0) {
      setImageIndex(0);
    } else if (currentImageIndex > total_images - 1) {
      setImageIndex(total_images - 1);
    }
  };

  return (
    <Box style={{ display: "grid", height: "15vh", minHeight: "100px" }}>
      <Grid2 container spacing={6} sx={{ alignItems: "center" }}>
        <Grid2 size="grow">
          <Slider
            style={{ margin: "15px" }}
            value={
              typeof currentImageIndex === "number" ? currentImageIndex : 0
            }
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            max={total_images - 1}
          />
        </Grid2>
        <Grid2>
          <Tooltip title="Current viewing angle">
            <Input
              value={currentImageIndex}
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
          </Tooltip>
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2} sx={{ alignItems: "center" }}>
        <Grid2 size="grow">
          <Tooltip title="Undo last action">
            <Button
              variant="outlined"
              fullWidth
              onClick={selection_operations.toPrevious}
              disabled={!selection_operations.undo_possible}
            >
              <Undo />
            </Button>
          </Tooltip>
        </Grid2>
        <Grid2 size="grow">
          <Tooltip title="Show selection at each angle">
            <Button
              variant="outlined"
              fullWidth
              onClick={
                animationPlaying
                  ? () => {
                      setAnimationPlaying(false);
                    }
                  : () => {
                      setPreanimationImageIndex(currentImageIndex);
                      setImageIndex(0);
                      setAnimationPlaying(true);
                    }
              }
            >
              {animationPlaying ? <StopOutlined /> : <PlayArrowOutlined />}
            </Button>
          </Tooltip>
        </Grid2>
        <Grid2 size="grow">
          <Tooltip title="Remove current selection">
            <Button
              variant="outlined"
              fullWidth
              onClick={selection_operations.removeSelection}
            >
              <DeleteOutline />
            </Button>
          </Tooltip>
        </Grid2>
        <Grid2 size="grow">
          <Tooltip title="Remove all selections">
            <Button
              variant="outlined"
              fullWidth
              onClick={selection_operations.removeAll}
            >
              <Clear />
            </Button>
          </Tooltip>
        </Grid2>
      </Grid2>
    </Box>
  );
}
