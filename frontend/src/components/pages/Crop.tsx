import loadData from "../crop/SampleLoad";
import DisplayAreaWrapper from "../crop/Wrapper";
import Submission from "../workflows/Submission";
import { Visit } from "@diamondlightsource/sci-react-ui";
import { useTifURLContext } from "../../contexts/CropContext";
import { useEffect, useState } from "react";
import { NDT } from "@diamondlightsource/davidia";
import {
  Box,
  CircularProgress,
  LinearProgress,
  Modal,
  Typography,
} from "@mui/material";

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
          <Typography
            gutterBottom
            variant="h6"
            color="primary"
            component="div"
            align="center"
          >
            <strong>Loading Pages</strong>
          </Typography>
          <LinearProgress />
        </Box>
      </Modal>
    </Box>
  );
}
