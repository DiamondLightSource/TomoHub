import { Box } from "@mui/material";
import { HeatmapPlot, ScaleType } from "@diamondlightsource/davidia";
import { NDT, RectangularSelection } from "@diamondlightsource/davidia";
import type { SelectionOperations } from "./SelectionOperations";

interface ImagePlotProps {
  image: NDT;
  on_screen_selections: RectangularSelection[];
  max_pixel_value: number;
  selection_operations: SelectionOperations;
  singleSelection: boolean;
}

export default function ImagePlot({
  image,
  on_screen_selections,
  max_pixel_value,
  selection_operations,
  singleSelection,
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
              // dont allow creating on single selection, force refresh
              if (
                selection instanceof RectangularSelection &&
                !singleSelection
              ) {
                selection_operations.createSelection(selection, false);
              } else {
                // selection area is not a rectangle
                // dont add anything to the list and force refresh so it disapears
                selection_operations.forceRefresh();
              }
            } else if (eventType === "removed") {
              if (singleSelection) {
                // dont allow removing on single selection, force refresh
                selection_operations.forceRefresh();
              } else {
                selection_operations.removeSelection();
              }
            } else if (eventType === "updated" && !dragging) {
              if (
                selection instanceof RectangularSelection &&
                !selection_operations.onScreenBeingModified(selection)
              ) {
                // when a box is modified on single selection
                // make a new one to represent the modification and make sure no others exist
                selection_operations.createSelection(
                  selection,
                  singleSelection
                );
              }
            }
          }
        }
        selections={on_screen_selections}
      />
    </Box>
  );
}
