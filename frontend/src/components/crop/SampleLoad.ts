import type { NDT } from "@diamondlightsource/davidia";
import ndarray from "ndarray";
import { proxyService } from "../../api/services";
import { decode } from "fast-png";

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

    const byteArray: Uint8Array = await proxyService.getZipPage(
      tifURL,
      i,
      sampleRate
    );

    // const { data }: { data: Uint8ClampedArray } = await pixels(pngAsString);
    const image = decode(byteArray);

    const currentPageNDT = ndarray(image.data, [height, width]) as NDT;
    images.push(currentPageNDT);
  }

  return images;
}
