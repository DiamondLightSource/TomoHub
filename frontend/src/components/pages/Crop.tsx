import React, { useState } from "react";

import ImagePlot from "../crop/Plot";
import ImageNavbar from "../crop/Navbar";
import load_data from "../crop/SampleLoad";
import type { NDT } from "@diamondlightsource/davidia";

const image_width = 2560;
const image_height = 2160;
const max_pixel_value = 60000;
const copies = 10;
const sample_rate = 10;
let shifted_images: NDT[] = [];

const Crop: React.FC = () => {
  // only "loads" data if its not been loaded already
  if (shifted_images.length == 0) {
    shifted_images = load_data(image_width, image_height, copies, sample_rate);
  }

  const [imageIndex, setImageIndex] = useState(0);

  return (
    <div>
      <h1>Cropping page</h1>
      <ImagePlot
        image={shifted_images[imageIndex]}
        max_pixel_value={max_pixel_value}
      />
      <ImageNavbar
        totalImages={copies}
        currentImageIndex={imageIndex}
        imageIndexSetter={setImageIndex}
      />
    </div>
  );
};

export default Crop;
