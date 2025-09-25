import React from "react";

import { HeatmapPlot, ScaleType } from "@diamondlightsource/davidia";
import raw_image from "./crop_test_data/real-projection.json";
import type { NDT } from "@diamondlightsource/davidia";
import ndarray from "ndarray";

const Crop: React.FC = () => {
  const image_width = 2560;
  const image_height = 2160;
  const max_pixel_value = 60000;

  const image_array: Uint16Array = new Uint16Array(raw_image as number[]);

  const image_NDT = ndarray(image_array, [image_height, image_width]) as NDT;

  const sample_rate = 10;

  const current_copy: number[] = [];
  // loops through every pixel in the frame
  for (let y = 0; y < image_height; y += sample_rate) {
    for (let x = 0; x < image_width; x += sample_rate) {
      // the modulo operator here creates the wrapping effect
      current_copy.push(image_NDT.get(y, x));
    }
  }

  const downsampled_image_NDT = ndarray(new Uint16Array(current_copy), [
    Math.floor(image_height / sample_rate),
    Math.floor(image_width / sample_rate),
  ]) as NDT;

  const heatMap = (
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
      values={downsampled_image_NDT}
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
