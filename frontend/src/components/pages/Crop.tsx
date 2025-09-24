import React from "react";

import { HeatmapPlot, ScaleType } from "@diamondlightsource/davidia";
import big_test_data from "./crop_test_data/real-projection.json";
import type { NDT } from "@diamondlightsource/davidia";
import ndarray from "ndarray";

const Crop: React.FC = () => {
  const big_test_data_array: Uint16Array = new Uint16Array(
    big_test_data as number[]
  );
  const big_test_data_NDT = ndarray(big_test_data_array, [2160, 2560]) as NDT;

  const heatMap = (
    <HeatmapPlot
      aspect="auto"
      colourMap="Purples"
      domain={[0, 60000]}
      heatmapScale={ScaleType.Linear}
      plotConfig={{
        title: "Sample Heatmap Plot",
        xLabel: "x-axis",
        yLabel: "y-axis",
      }}
      values={big_test_data_NDT}
      selectionsListener={(e, f, g) => {
        console.log(g);
      }}
      updateSelection={undefined}
    />
  );

  return (
    <div>
      <h1>Cropping page</h1>
      <div style={{ display: "grid", height: "49vh" }}>{heatMap}</div>
    </div>
  );
};

export default Crop;
