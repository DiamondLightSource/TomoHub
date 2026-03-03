import {
  Card,
  CardActionArea,
  CardContent,
  Container,
  Divider,
  Grid2,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";

const TomographyCard = () => {
  return (
    <Card variant="outlined" sx={{ margin: 2 }}>
      <CardActionArea component={Link} to="tomography">
        <CardContent sx={{ margin: 2 }}>
          <Typography gutterBottom variant="h5">
            Tomography
          </Typography>
          <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
          <Typography variant="body2">
            Brief summary of what can be done in the tomography GUI
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  return (
    <>
      <Container>
        <Typography fontSize={30} display="flex" justifyContent="center">
          Imaging Dashboard
        </Typography>
        <Grid2 display="flex">
          <TomographyCard />
        </Grid2>
      </Container>
    </>
  );
};

export default Dashboard;
