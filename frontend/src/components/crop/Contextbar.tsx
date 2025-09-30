import { Box, Button, Grid2 } from "@mui/material";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import FileOpenOutlined from "@mui/icons-material/FileOpenOutlined";
import { useLoader, PreviewType } from "../../contexts/LoaderContext";
import type { RectangularSelection } from "@diamondlightsource/davidia";

interface ContextbarProps {
  selections: RectangularSelection[][];
  sample_rate: number;
}

export default function Contextbar({
  selections,
  sample_rate,
}: ContextbarProps) {
  const { setDetectorX, setDetectorY } = useLoader();

  return (
    <Box style={{ height: "6vh", minHeight: "50px" }}>
      <Grid2 container spacing={2} sx={{ alignItems: "center" }}>
        <Grid2 size={1} />
        <Grid2 size={1}>
          <Button variant="outlined" sx={{ margin: "auto" }}>
            <FileOpenOutlined fontSize="large" />
          </Button>
        </Grid2>
        <Grid2 size={8} />
        <Grid2 size={1}>
          <Button
            variant="outlined"
            onClick={() => {
              console.log("selections: ");
              console.log(selections);
              let min_x = -1;
              let max_x = -1;
              let min_y = -1;
              let max_y = -1;
              // should be a for each loop
              for (const selection_list of selections) {
                if (selection_list.length > 0) {
                  const selection = selection_list[0];
                  const x_length =
                    Math.cos(selection.angle) * selection.lengths[0] -
                    Math.sin(selection.angle) * selection.lengths[1];
                  const y_length =
                    Math.sin(selection.angle) * selection.lengths[0] +
                    Math.cos(selection.angle) * selection.lengths[1];
                  let x1 = selection.start[0];
                  let x2 = x1 + x_length;
                  if (x1 > x2) {
                    const temp = x1;
                    x1 = x2;
                    x2 = temp;
                  }
                  let y1 = selection.start[1];
                  let y2 = y1 + y_length;
                  if (y1 > y2) {
                    const temp = y1;
                    y1 = y2;
                    y2 = temp;
                  }
                  console.log("x1: " + x1);
                  console.log("x1: " + x2);
                  console.log("x1: " + y1);
                  console.log("x1: " + y2);
                  if (min_x == -1) {
                    min_x = x1;
                    max_x = x2;
                    min_y = y1;
                    max_y = y2;
                    continue;
                  }
                  if (x1 < min_x) {
                    min_x = x1;
                  }
                  if (x2 > max_x) {
                    max_x = x2;
                  }
                  if (y1 < min_y) {
                    min_y = y1;
                  }
                  if (y2 > max_y) {
                    max_y = y2;
                  }
                }
              }

              console.log("running!");
              const xValues: PreviewType = {
                start: Math.floor(min_x * sample_rate),
                stop: Math.floor(max_x * sample_rate),
              };
              setDetectorX(xValues);
              const yValues: PreviewType = {
                start: Math.floor(min_y * sample_rate),
                stop: Math.floor(max_y * sample_rate),
              };
              setDetectorY(yValues);
            }}
          >
            <SaveOutlined fontSize="large" />
          </Button>
        </Grid2>
        <Grid2 size={1} />
      </Grid2>
    </Box>
  );
}
