import * as React from "react";
import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import { Link } from "@mui/material";

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&::before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: "#F7F7F2",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
  ...theme.applyStyles("dark", {
    backgroundColor: "rgba(255, 255, 255, .05)",
  }),
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
  background: "#F7F7F2",
}));

export default function CenterOfRotation() {
  const [expanded, setExpanded] = React.useState<string | false>("");

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  return (
    <div>
      <Accordion
        expanded={expanded === "panel1"}
        onChange={handleChange("panel1")}
      >
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
          <Typography>find COR with Naghia Vo's method </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={0.5}>
            <Grid size={8}>
              <Typography>
                find_center_vo 
                <Link
                  href="https://tomopy.readthedocs.io/en/stable/api/tomopy.recon.rotation.html#tomopy.recon.rotation.find_center_vo"
                  target="_blank"
                >
                  <InfoIcon sx={{ verticalAlign: "middle" }} />
                </Link>
              </Typography>
            </Grid>
            <Grid size={4}>
              <Stack direction="row" justifyContent={"flex-end"} spacing={0.5}>
                <IconButton aria-label="delete" size="small" disabled>
                  <DeleteIcon />
                </IconButton>
                <Button variant="contained" size="small" endIcon={<AddIcon />}>
                  Add
                </Button>
              </Stack>
            </Grid>
            <Grid size={6}>
              <TextField
                id="normalise--averaging--input"
                size="small"
                label="Averaging"
                variant="outlined"
                disabled
                helperText="Amount of averaging"
                fullWidth
              />
            </Grid>
            <Grid size={6}>
              <TextField
                id="normalise--cutoff--input"
                size="small"
                label="Cut off"
                variant="outlined"
                disabled
                helperText="Amount of cutoff"
                fullWidth
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
