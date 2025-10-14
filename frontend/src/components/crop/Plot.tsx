import { Box } from "@mui/material";
import { HeatmapPlot, ScaleType } from "@diamondlightsource/davidia";
import { NDT, RectangularSelection } from "@diamondlightsource/davidia";
import type { SelectionOperations } from "./SelectionOperations";
import { SelectionMode } from "../../types/crop.ts";

interface ImagePlotProps {
  image: NDT;
  onScreenSelections: RectangularSelection[];
  maxPixelValue: number;
  selectionOperations: SelectionOperations;
  selectionMode: SelectionMode;
}

export default function ImagePlot({
  image,
  onScreenSelections: onScreenSelections,
  maxPixelValue: maxPixelValue,
  selectionOperations: selectionOperations,
  selectionMode: selectionMode,
}: ImagePlotProps) {
  return (
    <Box style={{ display: "grid", height: "49vh", minHeight: "400px" }}>
      <HeatmapPlot
        aspect="auto"
        colourMap="Purples"
        domain={[0, maxPixelValue]}
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
              selectionMode === SelectionMode.Multi
            ) {
              selectionOperations.createSelection(selection, false);
            } else {
              // selection area is not a rectangle
              // dont add anything to the list and force refresh so it disapears
              selectionOperations.forceRefresh();
            }
          } else if (eventType === "removed") {
            if (selectionMode === SelectionMode.Single) {
              // dont allow removing on single selection, force refresh
              selectionOperations.forceRefresh();
            } else {
              selectionOperations.removeSelection();
            }
          } else if (
            eventType === "updated" &&
            !dragging &&
            selection instanceof RectangularSelection &&
            !selectionOperations.onScreenBeingModified(selection)
          ) {
            // when a box is modified on single selection
            // make a new one to represent the modification and make sure no others exist
            selectionOperations.createSelection(
              selection,
              selectionMode === SelectionMode.Single
            );
          }
        }}
        selections={onScreenSelections}
      />
    </Box>
  );
}
