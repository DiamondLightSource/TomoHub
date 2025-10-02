import { Box, Grid2, Slider, Input, Button, Tooltip } from "@mui/material";
import Undo from "@mui/icons-material/Undo";
import PlayArrowOutlined from "@mui/icons-material/PlayArrowOutlined";
import Clear from "@mui/icons-material/Clear";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import type { SelectionOperations } from "./SelectionOperations";

interface ImageNavbarProps {
  totalImages: number;
  currentImageIndex: number;
  imageIndexSetter: React.Dispatch<React.SetStateAction<number>>;
  selectionOperations: SelectionOperations;
}

export default function ImageNavbar({
  totalImages: totalImages,
  currentImageIndex,
  imageIndexSetter,
  selectionOperations: selectionOperations,
}: ImageNavbarProps) {
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
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
    } else if (currentImageIndex > totalImages - 1) {
      imageIndexSetter(totalImages - 1);
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
            <Button variant="outlined" fullWidth>
              <Undo />
            </Button>
          </Tooltip>
        </Grid2>
        <Grid2 size="grow">
          <Tooltip title="Show selection at each angle">
            <Button variant="outlined" fullWidth>
              <PlayArrowOutlined />
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
            <Button variant="outlined" fullWidth>
              <Clear />
            </Button>
          </Tooltip>
        </Grid2>
      </Grid2>
    </Box>
  );
}
