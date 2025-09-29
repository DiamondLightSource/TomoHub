import { Box, Button, Grid2 } from "@mui/material";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import FileOpenOutlined from "@mui/icons-material/FileOpenOutlined";
import { useLoader, PreviewType } from "../../contexts/LoaderContext";

export default function Contextbar() {
  const { setDetectorX, setDetectorY } = useLoader();

  return (
    <Box style={{ height: "6vh", minHeight: "50px" }}>
      <Grid2 container spacing={2} sx={{ alignItems: "center" }}>
        <Grid2 size={1} />
        <Grid2 size={1}>
          <Button variant="outlined" sx={{ margin: "auto" }}>
            <FileOpenOutlined fontSize="large" />
          </Button>
        </Grid2>
        <Grid2 size={8} />
        <Grid2 size={1}>
          <Button
            variant="outlined"
            onClick={() => {
              console.log("running!");
              const xValues: PreviewType = { start: 10, stop: 90 };
              setDetectorX(xValues);
              const yValues: PreviewType = { start: 20, stop: 80 };
              setDetectorY(yValues);
            }}
          >
            <SaveOutlined fontSize="large" />
          </Button>
        </Grid2>
        <Grid2 size={1} />
      </Grid2>
    </Box>
  );
}
