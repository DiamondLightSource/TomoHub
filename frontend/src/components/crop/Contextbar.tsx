import { Box, Button, Grid2, Tooltip } from "@mui/material";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import FileOpenOutlined from "@mui/icons-material/FileOpenOutlined";
import { useLoader, PreviewType } from "../../contexts/LoaderContext";
import type { RectangularSelection } from "@diamondlightsource/davidia";
import { useTifURLContext } from "../../contexts/CropContext";

interface ContextbarProps {
  selections: RectangularSelection[][];
  sampleRate: number;
}

export default function Contextbar({
  selections,
  sampleRate: sampleRate,
}: ContextbarProps) {
  const { setDetectorX, setDetectorY } = useLoader();
  const { setTifURL } = useTifURLContext();

  return (
    <Box style={{ height: "6vh", minHeight: "50px" }}>
      <Grid2 container spacing={2} sx={{ alignItems: "center" }}>
        <Grid2 size={1} />
        <Grid2 size={1}>
          <Button
            variant="outlined"
            sx={{ margin: "auto" }}
            onClick={() => {
              setTifURL(undefined);
            }}
          >
            <FileOpenOutlined fontSize="large" />
          </Button>
        </Grid2>
        <Grid2 size={8} />
        <Grid2 size={1}>
          <Tooltip title="Save loader preview configuration">
            <Button
              variant="outlined"
              onClick={() => {
                let minX: number | undefined = undefined;
                let maxX: number | undefined = undefined;
                let minY: number | undefined = undefined;
                let maxY: number | undefined = undefined;
                for (const selectionList of selections) {
                  if (selectionList.length > 0) {
                    const selection = selectionList[0];
                    const xLength =
                      Math.cos(selection.angle) * selection.lengths[0] -
                      Math.sin(selection.angle) * selection.lengths[1];
                    const yLength =
                      Math.sin(selection.angle) * selection.lengths[0] +
                      Math.cos(selection.angle) * selection.lengths[1];
                    let x1 = selection.start[0];
                    let x2 = x1 + xLength;
                    if (x1 > x2) {
                      const temp = x1;
                      x1 = x2;
                      x2 = temp;
                    }
                    let y1 = selection.start[1];
                    let y2 = y1 + yLength;
                    if (y1 > y2) {
                      const temp = y1;
                      y1 = y2;
                      y2 = temp;
                    }
                    if (
                      minX === undefined ||
                      maxX === undefined ||
                      minY === undefined ||
                      maxY === undefined
                    ) {
                      minX = x1;
                      maxX = x2;
                      minY = y1;
                      maxY = y2;
                      continue;
                    } else {
                      if (x1 < minX) {
                        minX = x1;
                      }
                      if (x2 > maxX) {
                        maxX = x2;
                      }
                      if (y1 < minY) {
                        minY = y1;
                      }
                      if (y2 > maxY) {
                        maxY = y2;
                      }
                    }
                  }
                }

                if (
                  minX !== undefined &&
                  maxX !== undefined &&
                  minY !== undefined &&
                  maxY !== undefined
                ) {
                  const xValues: PreviewType = {
                    start: Math.floor(minX * sampleRate),
                    stop: Math.floor(maxX * sampleRate),
                  };
                  setDetectorX(xValues);
                  const yValues: PreviewType = {
                    start: Math.floor(minY * sampleRate),
                    stop: Math.floor(maxY * sampleRate),
                  };
                  setDetectorY(yValues);
                }
              }}
            >
              <SaveOutlined fontSize="large" />
            </Button>
          </Tooltip>
        </Grid2>
        <Grid2 size={1} />
      </Grid2>
    </Box>
  );
}
