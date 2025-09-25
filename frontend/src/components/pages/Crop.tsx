import load_data from "../crop/SampleLoad";
import DisplayAreaWrapper from "../crop/Wrapper";

const Crop: React.FC = () => {
  const image_width = 2560;
  const image_height = 2160;
  const max_pixel_value = 60000;
  const copies = 10;
  const sample_rate = 10;
  const shifted_images = load_data(
    image_width,
    image_height,
    copies,
    sample_rate
  );

  return (
    <DisplayAreaWrapper
      max_pixel_value={max_pixel_value}
      copies={copies}
      images={shifted_images}
    />
  );
};

export default Crop;
