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

type AppCardProps = {
  name: string;
  desc: string;
  linkTarget: string;
};

const AppCard = ({ name, desc, linkTarget }: AppCardProps) => {
  return (
    <Card variant="outlined" sx={{ margin: 2 }}>
      <CardActionArea component={Link} to={linkTarget}>
        <CardContent sx={{ margin: 2 }}>
          <Typography gutterBottom variant="h5">
            {name}
          </Typography>
          <Divider sx={{ marginTop: 2, marginBottom: 2 }} />
          <Typography variant="body2">{desc}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  return (
    <>
      <Container>
        <Typography fontSize={30} justifySelf="center">
          Imaging Dashboard
        </Typography>
        <Grid2 display="flex">
          <AppCard
            name="Tomography"
            desc="Brief summary of what can be done in tomography GUI"
            linkTarget="tomography"
          />
          <AppCard
            name="Ptychography"
            desc="Brief summary of what can be done in ptychography GUI"
            linkTarget="ptychography"
          />
          <AppCard
            name="I14"
            desc="Brief summary of what can be done in I14 GUI"
            linkTarget="i14"
          />
        </Grid2>
      </Container>
    </>
  );
};
