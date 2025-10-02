import { Box } from "@mui/material";
import { HeatmapPlot, ScaleType } from "@diamondlightsource/davidia";
import {
  NDT,
  SelectionBase,
  RectangularSelection,
} from "@diamondlightsource/davidia";
import type { SelectionOperations } from "./SelectionOperations";

interface ImagePlotProps {
  image: NDT;
  on_screen_selections: SelectionBase[];
  max_pixel_value: number;
  selection_operations: SelectionOperations;
}

export default function ImagePlot({
  image,
  on_screen_selections,
  max_pixel_value,
  selection_operations,
}: ImagePlotProps) {
  return (
    <Box style={{ display: "grid", height: "49vh", minHeight: "400px" }}>
      <HeatmapPlot
        aspect="auto"
        colourMap="Purples"
        domain={[0, max_pixel_value]}
        heatmapScale={ScaleType.Linear}
        plotConfig={{
          title: "Sample Heatmap Plot",
          xLabel: "x-axis",
          yLabel: "y-axis",
        }}
        values={image}
        selectionsListener={(eventType, dragging, selection) => {
          if (selection === undefined) {
            return;
          }
          if (eventType === "created") {
            if (selection instanceof RectangularSelection) {
              selection_operations.createSelection(selection);
            } else {
              // selection area is not a rectangle
              // dont add anything to the list and force refresh so it disapears
              selection_operations.forceRefresh();
            }
          } else if (eventType === "removed") {
            selection_operations.removeSelection();
          } else if (
            eventType === "updated" &&
            !dragging &&
            !selection_operations.onScreenBeingModified(selection)
          ) {
            selection_operations.createSelection(selection);
          }
        }}
        selections={on_screen_selections}
      />
    </Box>
  );
}
