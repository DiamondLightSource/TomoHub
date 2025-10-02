import loadData from "../crop/SampleLoad";
import DisplayAreaWrapper from "../crop/Wrapper";

const Crop: React.FC = () => {
  const imageWidth = 2560;
  const imageHeight = 2160;
  const maxPixelValue = 60000;
  const copies = 10;
  const sampleRate = 10;
  const shiftedImages = loadData(imageWidth, imageHeight, copies, sampleRate);

  return (
    <DisplayAreaWrapper
      maxPixelValue={maxPixelValue}
      copies={copies}
      images={shiftedImages}
    />
  );
};

export default Crop;
