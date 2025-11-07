import loadData from "../crop/SampleLoad";
import DisplayAreaWrapper from "../crop/Wrapper";
import Submission from "../workflows/Submission";
import { Visit } from "@diamondlightsource/sci-react-ui";
import { useTifURLContext } from "../../contexts/CropContext";
import { useEffect, useState } from "react";
import { NDT } from "@diamondlightsource/davidia";

interface CropProps {
  setVisit: (
    value:
      | Visit
      | undefined
      | ((prevState: Visit | undefined) => Visit | undefined)
  ) => void;
}

export default function Crop({ setVisit }: CropProps) {
  const sampleRate = 10;
  const maxPixelValue = 255;
  const [images, setImages] = useState<NDT[] | undefined>(undefined);

  const [loadingImages, setLoadingImages] = useState(false);
  const { tifURL } = useTifURLContext();

  useEffect(() => {
    if (tifURL === undefined) {
      console.log("tif undefined, returning");
      return;
    }
    console.log("setting load images to true");
    setLoadingImages(true);
    loadData(tifURL, sampleRate).then((loadDataImages) => {
      setImages(loadDataImages);
      console.log("setting load images to false");
      setLoadingImages(false);
    });
  }, [tifURL]);

  return images !== undefined ? (
    <DisplayAreaWrapper
      maxPixelValue={maxPixelValue}
      copies={images.length}
      images={images}
      sampleRate={sampleRate}
    />
  ) : loadingImages ? (
    <p>loading images</p>
  ) : (
    <Submission workflowName="extract-raw-projections" setVisit={setVisit} />
  );
}
