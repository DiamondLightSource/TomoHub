import type { NDT } from "@diamondlightsource/davidia";
import ndarray from "ndarray";
import { proxyService } from "../../api/services";
import pixels from "image-pixels";

export default async function loadData(
  tifURL: string,
  sampleRate: number,
  setLoadingImageIndex: React.Dispatch<
    React.SetStateAction<number | undefined>
  >,
  setTotalImages: React.Dispatch<React.SetStateAction<number | undefined>>
): Promise<NDT[]> {
  const images: NDT[] = [];

  const pageCount = 36;
  const width = 2560;
  const height = 2160;
  // const {
  //   page_count: pageCount,
  //   width,
  //   height,
  // } = await proxyService.getTiffMetadata(tifURL);
  // const downsampledWidth = Math.floor(width / sampleRate);
  // const downsampledHeight = Math.floor(height / sampleRate);

  setTotalImages(pageCount);

  console.log("in setTotalImages");

  for (let i = 0; i < 5; i++) {
    setLoadingImageIndex(i);

    const pngAsString: string = await proxyService.getZipPage(
      tifURL,
      i,
      sampleRate
    );

    // const { data }: { data: Uint8ClampedArray } = await pixels(pngAsString);
    const data = new Uint8ClampedArray(
      pngAsString.split(", ").map((i) => {
        return Math.floor(parseInt(i) / 256);
      })
    );

    const currentPageNDT = ndarray(new Uint8Array(data), [
      height,
      width,
    ]) as NDT;
    images.push(currentPageNDT);
  }

  return images;
}
