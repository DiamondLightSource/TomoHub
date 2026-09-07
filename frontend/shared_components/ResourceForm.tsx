import { FC, ChangeEvent } from "react";
import { InputLabel, Grid, Stack, TextField } from "@mui/material";

export type ResourceFormProps = {
  params: ResourceParameters;
  setParams: (_: ResourceParameters) => void;
};

export type ResourceParameters = {
  cpus: string;
  gpus: string;
  nprocs: string;
  memory: string;
};

export const ResourceForm: FC<ResourceFormProps> = ({
  params,
  setParams,
}: ResourceFormProps) => {
  return (
    <Grid container justifyContent="start" spacing={1}>
      <Grid size={8}>
        <Stack direction="column" spacing={2}>
          <InputLabel size="small" id="workflow-select-label">
            Resources
          </InputLabel>
          <TextField
            name="cpus"
            label="cpus"
            variant="outlined"
            size="small"
            placeholder="8"
            type="number"
            value={params.cpus}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value;
              setParams((prev) => ({ ...prev, cpus: value }));
            }}
          />
          <TextField
            name="gpus"
            label="gpus"
            variant="outlined"
            size="small"
            placeholder="1"
            type="number"
            value={params.gpus}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value;
              setParams((prev) => ({ ...prev, gpus: value }));
            }}
          />
          <TextField
            name="nprocs"
            label="number of processes"
            variant="outlined"
            size="small"
            placeholder="8"
            type="number"
            value={params.nprocs}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value;
              setParams((prev) => ({ ...prev, nprocs: value }));
            }}
          />
          <TextField
            name="memory"
            label="memory"
            variant="outlined"
            size="small"
            placeholder="16Gi"
            type="text"
            value={params.memory}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value;
              setParams((prev) => ({ ...prev, memory: value }));
            }}
          />
        </Stack>
      </Grid>
    </Grid>
  );
};

export default ResourceForm;
