import { Box, Grid2, Slider, Input, Button, Tooltip } from "@mui/material";
import Undo from "@mui/icons-material/Undo";
import PlayArrowOutlined from "@mui/icons-material/PlayArrowOutlined";
import StopOutlined from "@mui/icons-material/StopOutlined";
import Clear from "@mui/icons-material/Clear";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import type { SelectionOperations } from "./SelectionOperations";
import { useRef, useState } from "react";

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// waits 300ms and then changes image index state
async function playFrame(
  setImageIndex: React.Dispatch<React.SetStateAction<number>>,
  frameIndex: number,
  endOfAnimation: boolean,
  setMidAnimation: React.Dispatch<React.SetStateAction<boolean>>,
  preanimationImageIndex: React.MutableRefObject<number | undefined>
) {
  await sleep(300);
  setImageIndex(frameIndex);
  if (endOfAnimation) {
    setMidAnimation(false);
    preanimationImageIndex.current = undefined;
  }
}

// checks if the play animation should be playing
function checkAnimation(
  currentImageIndex: number,
  preanimationImageIndex: React.MutableRefObject<number | undefined>,
  totalImages: number,
  midAnimation: boolean,
  setMidAnimation: React.Dispatch<React.SetStateAction<boolean>>,
  setImageIndex: React.Dispatch<React.SetStateAction<number>>
) {
  if (preanimationImageIndex.current === undefined) {
    // no animation is playing
    return;
  }
  if (midAnimation) {
    // reached the end of the animation
    if (currentImageIndex === totalImages - 1) {
      playFrame(
        setImageIndex,
        preanimationImageIndex.current,
        true,
        setMidAnimation,
        preanimationImageIndex
      );
    } else {
      // go to the next frame in animation
      // this will cause a change in state, causing a refresh of the component
      // letting us iterate through all images
      playFrame(
        setImageIndex,
        currentImageIndex + 1,
        false,
        setMidAnimation,
        preanimationImageIndex
      );
    }
  }
  // the animation has been stopped but the image has not been set back to what it was before
  // this happens when the stop button is pressed mid animation
  else {
    playFrame(
      setImageIndex,
      preanimationImageIndex.current,
      true,
      setMidAnimation,
      preanimationImageIndex
    );
  }
}

interface ImageNavbarProps {
  totalImages: number;
  currentImageIndex: number;
  setImageIndex: React.Dispatch<React.SetStateAction<number>>;
  selectionOperations: SelectionOperations;
}

export default function ImageNavbar({
  totalImages: totalImages,
  currentImageIndex,
  setImageIndex: setImageIndex,
  selectionOperations,
}: ImageNavbarProps) {
  // set to true when an animation is started
  // when the last frame of the animation is reached, this is set to false
  const [midAnimation, setMidAnimation] = useState(false);
  // records the imageIndex when an animation is started
  // if its undefined, there is no animation playing
  const preanimationImageIndex = useRef<number | undefined>(undefined);

  // will cause a state change (and refresh) if an animation should be playing
  checkAnimation(
    currentImageIndex,
    preanimationImageIndex,
    totalImages,
    midAnimation,
    setMidAnimation,
    setImageIndex
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
                midAnimation
                  ? () => {
                      setMidAnimation(false);
                    }
                  : () => {
                      preanimationImageIndex.current = currentImageIndex;
                      setImageIndex(0);
                      setMidAnimation(true);
                    }
              }
            >
              {midAnimation ? <StopOutlined /> : <PlayArrowOutlined />}
            </Button>
          </Tooltip>
        </Grid2>
        <Grid2 size="grow">
          <Tooltip title="Remove current selection">
            <Button
              variant="outlined"
              fullWidth
              onClick={selectionOperations.removeSelection}
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
            >
              <Clear />
            </Button>
          </Tooltip>
        </Grid2>
      </Grid2>
    </Box>
  );
}
