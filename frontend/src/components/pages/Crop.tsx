import loadData from "../crop/SampleLoad";
import DisplayAreaWrapper from "../crop/Wrapper";
import Submission from "../workflows/Submission";
import { Visit } from "@diamondlightsource/sci-react-ui";
import { useTifURLContext } from "../../contexts/CropContext";

interface CropProps {
  setVisit: (
    value:
      | Visit
      | undefined
      | ((prevState: Visit | undefined) => Visit | undefined)
  ) => void;
}

export default function Crop({ setVisit }: CropProps) {
  const imageWidth = 2560;
  const imageHeight = 2160;
  const maxPixelValue = 60000;
  const copies = 10;
  const sampleRate = 10;
  const shiftedImages = loadData(imageWidth, imageHeight, copies, sampleRate);

  const { tifURL } = useTifURLContext();

  return tifURL !== undefined ? (
    <DisplayAreaWrapper
      maxPixelValue={maxPixelValue}
      copies={copies}
      images={shiftedImages}
      sampleRate={sampleRate}
    />
  ) : (
    <Submission workflowName="extract-raw-projections" setVisit={setVisit} />
  );
}
