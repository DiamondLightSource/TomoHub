import {
  Box,
  Grid2,
  Slider,
  Input,
  Button,
  Tooltip,
  Select,
  MenuItem,
} from "@mui/material";
import Undo from "@mui/icons-material/Undo";
import PlayArrowOutlined from "@mui/icons-material/PlayArrowOutlined";
import StopOutlined from "@mui/icons-material/StopOutlined";
import Clear from "@mui/icons-material/Clear";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import type { SelectionOperations } from "./SelectionOperations";
import { useRef, useState } from "react";
import { SelectionMode } from "../../types/crop.ts";

interface ImageNavbarProps {
  totalImages: number;
  currentImageIndex: number;
  setImageIndex: React.Dispatch<React.SetStateAction<number>>;
  selectionOperations: SelectionOperations;
  selectionMode: SelectionMode;
  setSelectionMode: (value: SelectionMode) => void;
}

export default function ImageNavbar({
  totalImages: totalImages,
  currentImageIndex,
  setImageIndex: setImageIndex,
  selectionOperations,
  selectionMode: selectionMode,
  setSelectionMode: setSelectionMode,
}: ImageNavbarProps) {
  // id value of the interval that is playing the animation
  // cant use state for this as the initial value will be copied into the interval function and it will not be updated
  const animationIntervalID = useRef(0);
  const [animationPlaying, setAnimationPlaying] = useState(false);
  // records the imageIndex when an animation is started
  const preanimationImageIndex = useRef(0);
  // the image index whilst animation is playing
  // cant use currentImageIndex directly as this messes with the interval function
  const animationIndex = useRef(0);

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
    } else if (currentImageIndex > totalImages - 1) {
      setImageIndex(totalImages - 1);
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
            max={totalImages - 1}
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
                max: totalImages - 1,
                type: "number",
                "aria-labelledby": "input-slider",
              }}
            />
          </Tooltip>
        </Grid2>
        <Grid2>
          <Box display="flex" justifyContent="center">
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={
                selectionMode === SelectionMode.Single ? "Single" : "Multi"
              }
              label="Age"
              onChange={(e) => {
                if (e.target.value === "Single") {
                  setSelectionMode(SelectionMode.Single);
                } else if (e.target.value === "Multi") {
                  setSelectionMode(SelectionMode.Multi);
                }
              }}
            >
              <MenuItem value={"Single"}>Single</MenuItem>
              <MenuItem value={"Multi"}>Multi</MenuItem>
            </Select>
          </Box>
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2} sx={{ alignItems: "center" }}>
        <Grid2 size="grow">
          <Tooltip title="Undo last action">
            <Button
              variant="outlined"
              fullWidth
              onClick={selectionOperations.toPrevious}
              disabled={!selectionOperations.undoPossible}
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
                      // stop button pressed
                      setImageIndex(preanimationImageIndex.current);
                      clearInterval(animationIntervalID.current);
                      setAnimationPlaying(false);
                    }
                  : () => {
                      // store index of the image before animation starts
                      preanimationImageIndex.current = currentImageIndex;
                      animationIndex.current = 0;
                      const timeBetweenFrames = 300; // in ms
                      setAnimationPlaying(true);

                      // play the animation
                      animationIntervalID.current = setInterval(() => {
                        // reached the end of the animation
                        if (animationIndex.current === totalImages) {
                          setImageIndex(preanimationImageIndex.current);
                          clearInterval(animationIntervalID.current);
                          setAnimationPlaying(false);
                        }
                        // play next frame
                        else {
                          setImageIndex(animationIndex.current);
                          animationIndex.current = animationIndex.current + 1;
                        }
                      }, timeBetweenFrames);
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
              onClick={selectionOperations.removeSelection}
              disabled={
                selectionMode === SelectionMode.Single ||
                selectionOperations.selectionsEmpty
              }
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
              onClick={selectionOperations.removeAll}
              disabled={
                selectionMode === SelectionMode.Single ||
                selectionOperations.selectionsEmpty
              }
            >
              <Clear />
            </Button>
          </Tooltip>
        </Grid2>
      </Grid2>
    </Box>
  );
}
