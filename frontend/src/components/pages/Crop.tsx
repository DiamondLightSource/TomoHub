import React, { useState, useMemo } from "react";
import raw_image from "./crop_test_data/real-projection.json";
import type { NDT } from "@diamondlightsource/davidia";
import ndarray from "ndarray";
import ImagePlot from "../crop/Plot";
import ImageNavbar from "../crop/Navbar";

const image_width = 2560;
const image_height = 2160;
const max_pixel_value = 60000;
const copies = 10;
// turn up sample rate to sample less pixels, maybe needs renaming?
const sample_rate = 10;

// the initial image is copied [copies] times
// each copy is shifted to the left by an increasing number of pixels
// the copies are then added to shifted_images
const image_array: Uint16Array = new Uint16Array(raw_image as number[]);
const image_NDT = ndarray(image_array, [image_height, image_width]) as NDT;

function computeShiftedImages(): NDT[] {
  const result: NDT[] = [];

  // will loop [copies] times
  for (let i = 0; i < copies; i++) {
    const shift = Math.floor((image_width / copies) * i);
    const current_copy: number[] = [];
    // loops through every pixel in the frame
    for (let y = 0; y < image_height; y += sample_rate) {
      for (let x = 0; x < image_width; x += sample_rate) {
        // the modulo operator here creates the wrapping effect
        current_copy.push(image_NDT.get(y, (x + shift) % image_width));
      }
    }

    const current_frame_NDT = ndarray(new Uint16Array(current_copy), [
      Math.floor(image_height / sample_rate),
      Math.floor(image_width / sample_rate),
    ]) as NDT;
    result.push(current_frame_NDT);
  }
  return result;
}

function downsampleImage(image: NDT, factor: number): NDT {
  const [height, width] = image.shape;
  const downsampled: number[] = [];

  for (let y = 0; y < height; y += factor) {
    for (let x = 0; x < width; x += factor) {
      downsampled.push(image.get(y, x));
    }
  }

  return ndarray(new Uint16Array(downsampled), [
    Math.floor(height / factor),
    Math.floor(width / factor),
  ]) as NDT;
}

const Crop: React.FC = () => {
  const [imageIndex, setImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const shiftedImages = useMemo(() => computeShiftedImages(), []);
  const fullResImage = shiftedImages[imageIndex];
  const lowResImage = useMemo(
    () => downsampleImage(fullResImage, 10),
    [fullResImage]
  );

  return (
    <div>
      <h1>Cropping page</h1>
      {isDragging ? (
        <ImagePlot image={lowResImage} max_pixel_value={max_pixel_value} />
      ) : (
        <ImagePlot image={fullResImage} max_pixel_value={max_pixel_value} />
      )}
      <ImageNavbar
        total_images={copies}
        currentImageIndex={imageIndex}
        imageIndexSetter={setImageIndex}
        setIsDragging={setIsDragging}
      />
    </div>
  );
};

export default Crop;
