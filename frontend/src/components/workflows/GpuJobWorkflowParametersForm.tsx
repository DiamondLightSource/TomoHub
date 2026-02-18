import { ChangeEvent } from "react";
import { Box, Card, Stack, TextField, Typography } from "@mui/material";

const memoryParamRegex = /[0-9]+[GMK]i/;
const nonEmptyStringRegex = /(.|\s)*\S(.|\s)*/;

type FormProps = {
  inputPath: string;
  isInputPathValid: boolean;
  outputPath: string;
  isOutputPathValid: boolean;
  nProcs: number;
  isNProcsValid: boolean;
  memory: string;
  isMemoryValid: boolean;
  handleInputPathChange: (_: string) => void;
  handleIsInputPathValidChange: (_: boolean) => void;
  handleOutputPathChange: (_: string) => void;
  handleIsOutputPathValidChange: (_: boolean) => void;
  handleNProcsChange: (_: number) => void;
  handleIsNProcsValidChange: (_: boolean) => void;
  handleMemoryChange: (_: string) => void;
  handleIsMemoryValidChange: (_: boolean) => void;
};

const Form = ({
  inputPath,
  isInputPathValid,
  outputPath,
  isOutputPathValid,
  nProcs,
  isNProcsValid,
  memory,
  isMemoryValid,
  handleInputPathChange,
  handleIsInputPathValidChange,
  handleOutputPathChange,
  handleIsOutputPathValidChange,
  handleNProcsChange,
  handleIsNProcsValidChange,
  handleMemoryChange,
  handleIsMemoryValidChange,
}: FormProps) => {
  const nProcsMin = 1;
  const nProcsMax = 40;

  return (
    <>
      <TextField
        required
        label="Input Path"
        variant="outlined"
        fullWidth
        size="small"
        value={inputPath}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          handleInputPathChange(value);
          handleIsInputPathValidChange(nonEmptyStringRegex.test(value));
        }}
        placeholder="Path to input data file"
        helperText={!isInputPathValid && "is required"}
        error={!isInputPathValid}
        sx={{ mb: 1 }}
      />
      <TextField
        required
        label="Output Path"
        variant="outlined"
        fullWidth
        size="small"
        value={outputPath}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          handleOutputPathChange(value);
          handleIsOutputPathValidChange(nonEmptyStringRegex.test(value));
        }}
        placeholder="Path to output folder"
        helperText={!isOutputPathValid && "is required"}
        error={!isOutputPathValid}
        sx={{ mb: 1 }}
      />
      <Stack direction="row" spacing={2}>
        <TextField
          label="Number of processes"
          size="small"
          type="number"
          fullWidth
          value={nProcs}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const value =
              e.target.value === "" ? nProcsMin : Number(e.target.value);
            handleNProcsChange(value);
            handleIsNProcsValidChange(value >= nProcsMin && value <= nProcsMax);
          }}
          error={!isNProcsValid}
          helperText={
            !isNProcsValid
              ? `${nProcsMin} <= number of processes <= ${nProcsMax}`
              : ""
          }
        />
        <TextField
          label="Memory"
          size="small"
          fullWidth
          value={memory}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            handleMemoryChange(value);
            handleIsMemoryValidChange(memoryParamRegex.test(value));
          }}
          error={!isMemoryValid}
          helperText={
            !isMemoryValid ? "Must be a number followed by Ki, Mi, or Gi" : ""
          }
        />
      </Stack>
    </>
  );
};

export const GpuJobWorkflowParametersForm = (props: FormProps) => {
  return (
    <Card
      variant="outlined"
      sx={{
        mx: "auto",
        mb: 2,
        p: 2,
        border: "1px solid #89987880",
        borderRadius: "4px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          gutterBottom
          variant="h6"
          color="primary"
          component="div"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <strong>Workflow Parameters</strong>
        </Typography>
      </Box>
      <Form
        inputPath={props.inputPath}
        isInputPathValid={props.isInputPathValid}
        outputPath={props.outputPath}
        isOutputPathValid={props.isOutputPathValid}
        nProcs={props.nProcs}
        isNProcsValid={props.isNProcsValid}
        memory={props.memory}
        isMemoryValid={props.isMemoryValid}
        handleInputPathChange={props.handleInputPathChange}
        handleIsInputPathValidChange={props.handleIsInputPathValidChange}
        handleOutputPathChange={props.handleOutputPathChange}
        handleIsOutputPathValidChange={props.handleIsOutputPathValidChange}
        handleNProcsChange={props.handleNProcsChange}
        handleIsNProcsValidChange={props.handleIsNProcsValidChange}
        handleMemoryChange={props.handleMemoryChange}
        handleIsMemoryValidChange={props.handleIsMemoryValidChange}
      />
    </Card>
  );
};
