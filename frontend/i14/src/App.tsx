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

type WorkflowTemplateCardProps = {
  name: string;
  desc: string;
  linkTarget: string;
};

const WorkflowTemplateCard = ({
  name,
  desc,
  linkTarget,
}: WorkflowTemplateCardProps) => {
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

export const App: React.FC = () => {
  return (
    <>
      <Container>
        <Typography fontSize={30} justifySelf="center">
          I14 Web App
        </Typography>
        <Grid2 display="flex">
          <WorkflowTemplateCard
            name="DPC"
            desc="Brief summary of DPC workflow"
            linkTarget="workflows.diamond.ac.uk/..."
          />
          <WorkflowTemplateCard
            name="XRD"
            desc="Brief summary of XRD workflow"
            linkTarget="workflows.diamond.ac.uk/..."
          />
        </Grid2>
      </Container>
    </>
  );
};
