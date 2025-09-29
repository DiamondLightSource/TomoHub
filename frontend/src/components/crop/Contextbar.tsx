import { Box, Button, Grid2 } from "@mui/material";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import FileOpenOutlined from "@mui/icons-material/FileOpenOutlined";

export default function Contextbar() {
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
          <Button variant="outlined">
            <SaveOutlined fontSize="large" />
          </Button>
        </Grid2>
        <Grid2 size={1} />
      </Grid2>
    </Box>
  );
}
