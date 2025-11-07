import type { NDT } from "@diamondlightsource/davidia";
import ndarray from "ndarray";
import { proxyService } from "../../api/services";
import pixels from "image-pixels";

export default async function loadData(
  tifURL: string,
  sampleRate: number
): Promise<NDT[]> {
  const images: NDT[] = [];

  const {
    page_count: pageCount,
    width,
    height,
  } = await proxyService.getTiffMetadata(tifURL);
  const downsampledWidth = Math.floor(width / sampleRate);
  const downsampledHeight = Math.floor(height / sampleRate);

  for (let i = 0; i < pageCount; i++) {
    const pngAsString: string = await proxyService.getTiffPage(
      tifURL,
      i,
      sampleRate
    );

    const { data }: { data: Uint8ClampedArray } = await pixels(pngAsString);

    const currentPageNDT = ndarray(
      new Uint8Array(data.filter((element, index) => index % 4 === 0)),
      [downsampledHeight, downsampledWidth]
    ) as NDT;
    images.push(currentPageNDT);
  }

  return images;
}
