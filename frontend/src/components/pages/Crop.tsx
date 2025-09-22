import React from "react";

import { HeatmapPlot, ScaleType } from "@diamondlightsource/davidia";
import test_data from "./crop_test_data/test-projection.json";
import type { NDT } from "@diamondlightsource/davidia";
import ndarray from "ndarray";

const Crop: React.FC = () => {
  const test_data_typed: Uint16Array = new Uint16Array(test_data);
  const test_data_NDT = ndarray(test_data_typed, [128, 160]) as NDT;

  const heatMap = (
    <HeatmapPlot
      aspect="auto"
      colourMap="Purples"
      domain={[0, 110]}
      heatmapScale={ScaleType.Linear}
      plotConfig={{
        title: "Sample Heatmap Plot",
        xLabel: "x-axis",
        yLabel: "y-axis",
      }}
      values={test_data_NDT}
      selectionsListener={(e, f, g) => {
        console.log(g);
      }}
      updateSelection={undefined}
    />
  );

  return (
    <div>
      <h1>Cropping page</h1>
      {heatMap}
    </div>
  );
};

export default Crop;
