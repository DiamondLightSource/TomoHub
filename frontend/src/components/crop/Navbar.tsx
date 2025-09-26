import { Box, Grid2, Slider, Input, Button, Tooltip } from "@mui/material";
import Undo from "@mui/icons-material/Undo";
import PlayArrowOutlined from "@mui/icons-material/PlayArrowOutlined";
import Clear from "@mui/icons-material/Clear";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import type { SelectionOperations } from "./SelectionOperations";

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue == "number") {
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
              onClick={async () => {
                const starting_image_index = currentImageIndex;
                for (let i = 0; i < total_images; i++) {
                  setImageIndex(i);
                  await sleep(300);
                }
                setImageIndex(starting_image_index);
              }}
            >
              <PlayArrowOutlined />
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
