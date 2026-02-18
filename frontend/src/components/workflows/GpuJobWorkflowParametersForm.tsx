import { ChangeEvent, useState } from "react";
import { Box, Card, Stack, TextField, Typography } from "@mui/material";

const memoryParamRegex = /[0-9]+[GMK]i/;
const nonEmptyStringRegex = /(.|\s)*\S(.|\s)*/;

const Form = () => {
  const nProcsMin = 1;
  const nProcsMax = 40;

  const [inputPath, setInputPath] = useState("");
  const [outputPath, setOutputPath] = useState("");
  const [nProcs, setNProcs] = useState(1);
  const [memory, setMemory] = useState("20Gi");
  const [isInputPathValid, setIsInputPathValid] = useState(false);
  const [isOutputPathValid, setIsOutputPathValid] = useState(false);
  const [isNProcsValid, setIsNProcsValid] = useState(true);
  const [isMemoryValid, setIsMemoryValid] = useState(true);

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
          setInputPath(value);
          setIsInputPathValid(nonEmptyStringRegex.test(value));
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
          setOutputPath(value);
          setIsOutputPathValid(nonEmptyStringRegex.test(value));
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
            setNProcs(value);
            setIsNProcsValid(value >= nProcsMin && value <= nProcsMax);
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
            setMemory(value);
            setIsMemoryValid(memoryParamRegex.test(value));
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

export const GpuJobWorkflowParametersForm = () => {
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
      <Form />
    </Card>
  );
};
