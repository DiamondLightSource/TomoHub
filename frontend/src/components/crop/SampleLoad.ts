import rawImage from "./crop_test_data/real-projection.json";
import type { NDT } from "@diamondlightsource/davidia";
import ndarray from "ndarray";
import { proxyService } from "../../api/services";
import pixels from "image-pixels";

export function loadData2(
  imageWidth: number,
  imageHeight: number,
  copies: number,
  sampleRate: number
): NDT[] {
  // the initial image is copied [copies] times
  // each copy is shifted to the left by an increasing number of pixels
  // the copies are then added to shifted_images
  const shiftedImages: NDT[] = [];
  const imageArray: Uint16Array = new Uint16Array(rawImage as number[]);

  const imageNDT = ndarray(imageArray, [imageHeight, imageWidth]) as NDT;

  // will loop [copies] times
  for (
    let shift = 0;
    shift < imageWidth;
    shift += Math.floor(imageWidth / copies)
  ) {
    const currentCopy: number[] = [];
    // loops through every pixel in the frame
    for (let y = 0; y < imageHeight; y += sampleRate) {
      for (let x = 0; x < imageWidth; x += sampleRate) {
        // the modulo operator here creates the wrapping effect
        currentCopy.push(imageNDT.get(y, (x + shift) % imageWidth));
      }
    }

    const currentFrameNDT = ndarray(new Uint16Array(currentCopy), [
      Math.floor(imageHeight / sampleRate),
      Math.floor(imageWidth / sampleRate),
    ]) as NDT;
    shiftedImages.push(currentFrameNDT);
  }

  return shiftedImages;
}

export default async function loadData(
  tifURL: string,
  sampleRate: number
): Promise<NDT[]> {
  console.log("load data 2 called");
  const images: NDT[] = [];

  console.log("using url: " + tifURL);

  const {
    page_count: pageCount,
    width,
    height,
  } = await proxyService.getTiffMetadata(tifURL);

  for (let i = 0; i < pageCount; i++) {
    console.log("loading image " + i + " of " + pageCount);
    const pngAsString: string = await proxyService.getTiffPage(tifURL, i);

    const { data } = await pixels(pngAsString);

    const currentPage: number[] = [];
    for (let y = 0; y < height; y += sampleRate) {
      for (let x = 0; x < width; x += sampleRate) {
        const index = y * width + x;
        // gets the r value at index
        currentPage.push(data[index * 4]);
      }
    }
    const currentPageNDT = ndarray(new Uint16Array(currentPage), [
      Math.floor(height / sampleRate),
      Math.floor(width / sampleRate),
    ]) as NDT;
    images.push(currentPageNDT);
  }

  return images;
}
