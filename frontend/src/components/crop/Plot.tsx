import { Box } from "@mui/material";
import { HeatmapPlot, ScaleType } from "@diamondlightsource/davidia";
import type { NDT, SelectionBase } from "@diamondlightsource/davidia";
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
            setCurrentSelection([selection]);
          }
        }}
        selections={currentSelection}
      />
    </Box>
  );
}
