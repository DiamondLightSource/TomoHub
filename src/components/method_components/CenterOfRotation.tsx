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
import { useMethods } from "../../MethodsContext";

const corMethods = [{
    id:"find_center_vo",
    parameters : {
        ind:null,
        smin:-50,
        smax:6,
        step:0.25,
        ratio:0.5,
        drop:20
    }
}]


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
    const { methods, addMethod, removeMethod } = useMethods();
    
    const addMethodButton = (event: React.MouseEvent<HTMLButtonElement>) =>{
        const methodID = event.currentTarget.id;
        addMethod({id:methodID});
        console.log(methods);
    }
    const removeMethodButton = (event: React.MouseEvent<HTMLButtonElement>) =>{
        const methodID = event.currentTarget.id;
        removeMethod(methodID);
        console.log(methods);
    }
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
                <IconButton aria-label="delete" size="small" id="del_find_center_vo" onClick={removeMethodButton}>
                  <DeleteIcon />
                </IconButton>
                <Button id="add_find_center_vo" variant="contained" size="small" endIcon={<AddIcon />} onClick={addMethodButton}>
                  Add
                </Button>
              </Stack>
            </Grid>
            <Grid size={6}>
              <TextField
                id="find_center_vo--ind--input"
                size="small"
                label="ind"
                variant="outlined"
                disabled
                helperText="Index of the slice to be used for reconstruction."
                fullWidth
              />
            </Grid>
            <Grid size={6}>
              <TextField
                id="find_center_vo--smin--input"
                size="small"
                label="smin"
                variant="outlined"
                disabled
                helperText="Coarse search radius"
                fullWidth
              />
            </Grid>
            <Grid size={6}>
              <TextField
                id="find_center_vo--smax--input"
                size="small"
                label="smax"
                variant="outlined"
                disabled
                helperText="Coarse search radius"
                fullWidth
              />
            </Grid>
            <Grid size={6}>
              <TextField
                id="find_center_vo--srad--input"
                size="small"
                label="srad"
                variant="outlined"
                disabled
                helperText="Fine search radius"
                fullWidth
              />
            </Grid>
            <Grid size={6}>
              <TextField
                id="find_center_vo--step--input"
                size="small"
                label="step"
                variant="outlined"
                disabled
                helperText="Step of fine searching"
                fullWidth
              />
            </Grid>
            <Grid size={6}>
              <TextField
                id="find_center_vo--ratio--input"
                size="small"
                label="ratio"
                variant="outlined"
                disabled
                helperText="The ratio between the FOV of the camera and the size of object"
                fullWidth
              />
            </Grid>
            <Grid size={6}>
              <TextField
                id="find_center_vo--drop--input"
                size="small"
                label="drop"
                variant="outlined"
                disabled
                helperText="Drop lines around vertical center of the mask"
                fullWidth
              />
            </Grid>
            <Grid size={6}>
              <TextField
                id="find_center_vo--ncore--input"
                size="small"
                label="ncore"
                variant="outlined"
                disabled
                helperText="Number of cores that will be assigned to jobs"
                fullWidth
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
