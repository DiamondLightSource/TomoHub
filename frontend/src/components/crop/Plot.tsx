import { Box } from "@mui/material";
import { HeatmapPlot, ScaleType } from "@diamondlightsource/davidia";
import type { NDT } from "@diamondlightsource/davidia";

interface ImagePlotProps {
  image: NDT;
  max_pixel_value: number;
}

export default function ImagePlot({ image, max_pixel_value }: ImagePlotProps) {
  return (
    <Box style={{ display: "grid", height: "49vh" }}>
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
      />
    </Box>
  );
}
