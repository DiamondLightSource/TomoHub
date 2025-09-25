import { Box } from "@mui/material";
import { HeatmapPlot, ScaleType } from "@diamondlightsource/davidia";
import {
  NDT,
  SelectionBase,
  RectangularSelection,
} from "@diamondlightsource/davidia";
import { useState } from "react";

interface ImagePlotProps {
  image: NDT;
  max_pixel_value: number;
}

export default function ImagePlot({ image, max_pixel_value }: ImagePlotProps) {
  const [currentSelection, setCurrentSelection] = useState<SelectionBase[]>([]);

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
        selectionsListener={(eventType, _, selection) => {
          if (eventType == "created" && selection != undefined) {
            if (selection instanceof RectangularSelection) {
              setCurrentSelection([selection]);
            } else {
              // copy the value of currentSelection and set it to that again (dont change it)
              // this stops regions being added if theyre not a rectangle
              // however, the component still needs to refresh as the new selection region will be visible otherwise
              // lmk if theres a better way to "force refresh" a component
              setCurrentSelection([...currentSelection]);
            }
          }
        }}
        selections={currentSelection}
      />
    </Box>
  );
}
