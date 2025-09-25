import React from "react";

import raw_image from "./crop_test_data/real-projection.json";
import type { NDT } from "@diamondlightsource/davidia";
import ndarray from "ndarray";
import ImagePlot from "../crop/Plot";

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
      current_copy.push(image_NDT.get(y, x));
    }
  }

  const downsampled_image_NDT = ndarray(new Uint16Array(current_copy), [
    Math.floor(image_height / sample_rate),
    Math.floor(image_width / sample_rate),
  ]) as NDT;

  return (
    <div>
      <h1>Cropping page</h1>
      <ImagePlot
        image={downsampled_image_NDT}
        max_pixel_value={max_pixel_value}
      />
    </div>
  );
};

export default Crop;
