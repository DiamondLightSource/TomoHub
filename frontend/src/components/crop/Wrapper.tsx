import React, { useState } from "react";

import ImagePlot from "../crop/Plot";
import ImageNavbar from "../crop/Navbar";
import type { NDT } from "@diamondlightsource/davidia";

interface WrapperProps {
  max_pixel_value: number;
  copies: number;
  images: NDT[];
}

export default function DisplayAreaWrapper({
  max_pixel_value,
  copies,
  images,
}: WrapperProps) {
  const [imageIndex, setImageIndex] = useState(0);

  return (
    <div>
      <ImagePlot
        image={images[imageIndex]}
        max_pixel_value={max_pixel_value}
        index={imageIndex}
        copies={copies}
      />
      <ImageNavbar
        totalImages={copies}
        currentImageIndex={imageIndex}
        imageIndexSetter={setImageIndex}
      />
    </div>
  );
}
