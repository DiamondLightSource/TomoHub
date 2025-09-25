import raw_image from "../pages/crop_test_data/real-projection.json";
import type { NDT } from "@diamondlightsource/davidia";
import ndarray from "ndarray";

export default function load_data(
  image_width: number,
  image_height: number,
  copies: number,
  sample_rate: number
): NDT[] {
  // the initial image is copied [copies] times
  // each copy is shifted to the left by an increasing number of pixels
  // the copies are then added to shifted_images
  const shifted_images: NDT[] = [];
  const image_array: Uint16Array = new Uint16Array(raw_image as number[]);

  const image_NDT = ndarray(image_array, [image_height, image_width]) as NDT;

  // will loop [copies] times
  for (
    let shift = 0;
    shift < image_width;
    shift += Math.floor(image_width / copies)
  ) {
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
    shifted_images.push(current_frame_NDT);
  }

  return shifted_images;
}
