import React from "react";
import { Grid, Typography, Stack, IconButton, Button } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface MethodHeaderProps {
  id: string;
  linkToDoc: string;
  isMethodAdded: boolean;
  onAddMethod: () => void;
  onRemoveMethod: () => void;
}

export const MethodHeader: React.FC<MethodHeaderProps> = ({
  id,
  linkToDoc,
  isMethodAdded,
  onAddMethod,
  onRemoveMethod,
}) => (
  <>
    <Grid item xs={9}>
      <Typography sx={{ fontSize: "0.9rem", fontWeight: "bold" }}>
        {id}
        <IconButton size="small" href={linkToDoc} target="_blank">
          <InfoIcon fontSize="small" />
        </IconButton>
      </Typography>
    </Grid>
    <Grid item xs={3}>
      <Stack direction="row" justifyContent="flex-end" spacing={1}>
        <IconButton onClick={onRemoveMethod} disabled={!isMethodAdded}>
          <DeleteIcon />
        </IconButton>
        <Button
          variant="contained"
          color="primary"
          endIcon={<AddIcon />}
          onClick={onAddMethod}
          disabled={isMethodAdded}
        >
          Add
        </Button>
      </Stack>
    </Grid>
  </>
);
