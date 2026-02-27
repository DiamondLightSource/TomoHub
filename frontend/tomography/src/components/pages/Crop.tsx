import loadData from "../crop/SampleLoad";
import DisplayAreaWrapper from "../crop/Wrapper";
import Submission from "../workflows/Submission";
import { Visit } from "@diamondlightsource/sci-react-ui";
import { useTifURLContext } from "../../contexts/CropContext";
import { useEffect, useState } from "react";
import { NDT } from "@diamondlightsource/davidia";
import { Box, LinearProgress, Modal, Typography } from "@mui/material";

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
  const [loadingImageIndex, setLoadingImageIndex] = useState<
    number | undefined
  >(undefined);
  const [totalImages, setTotalImages] = useState<number | undefined>(undefined);
  const { tifURL } = useTifURLContext();

  useEffect(() => {
    if (tifURL === undefined) {
      setImages(undefined);
      setLoadingImageIndex(undefined);
      setTotalImages(undefined);
      return;
    }
    setLoadingImages(true);
    loadData(tifURL, sampleRate, setLoadingImageIndex, setTotalImages).then(
      (loadDataImages) => {
        setImages(loadDataImages);
        setLoadingImages(false);
      }
    );
  }, [tifURL]);

  return images !== undefined ? (
    <DisplayAreaWrapper
      maxPixelValue={maxPixelValue}
      copies={images.length}
      images={images}
      sampleRate={sampleRate}
    />
  ) : (
    <Box>
      <Submission workflowName="extract-raw-projections" setVisit={setVisit} />
      <Modal open={loadingImages}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 100,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 1,
            borderRadius: 1,
          }}
        >
          {loadingImageIndex === undefined ? (
            <Typography
              gutterBottom
              variant="h6"
              color="primary"
              component="div"
              align="center"
            >
              <strong>Fetching images metadata</strong>
            </Typography>
          ) : (
            <Typography
              gutterBottom
              variant="h6"
              color="primary"
              component="div"
              align="center"
            >
              <strong>
                Loading Image {loadingImageIndex} of {totalImages}
              </strong>
            </Typography>
          )}
          <LinearProgress sx={{ "margin-top": 25 }} />
        </Box>
      </Modal>
    </Box>
  );
}
