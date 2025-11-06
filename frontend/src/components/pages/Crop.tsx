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
  let copies: undefined | number = undefined;
  const [images, setImages] = useState<NDT[] | undefined>(undefined);
  if (images !== undefined) {
    copies = images.length;
  }

  const { tifURL } = useTifURLContext();

  useEffect(() => {
    console.log(tifURL);
    if (tifURL === undefined) {
      return;
    }
    loadData(tifURL, sampleRate).then((loadDataImages) => {
      setImages(loadDataImages);
    });
  }, [tifURL]);

  return images !== undefined ? (
    <DisplayAreaWrapper
      maxPixelValue={maxPixelValue}
      copies={copies ?? 0}
      images={images}
      sampleRate={sampleRate}
    />
  ) : (
    <Submission workflowName="extract-raw-projections" setVisit={setVisit} />
  );
}
