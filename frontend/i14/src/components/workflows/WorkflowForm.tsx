import type { FC, ChangeEvent } from "react";
import React, { useState } from "react";

import Button from "@mui/material/Button";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";

import { visitRegex } from "@diamondlightsource/sci-react-ui";

import { initialData } from "../../data/form";
import { templateOptions } from "../../data/templates";
import OptionSelect from "./OptionSelect";

import type { WorkflowFormData, Option } from "../../types/workflowFields";

export const WorkflowForm: FC = () => {
  const techniques = ["dpc", "xanes", "xrd"] as const;
  type ToggleGroup = (typeof techniques)[number];
  const getFilteredTemplates = (toggle: ToggleGroup): Option[] => {
    return (templateOptions ?? []).filter((o) => o.value.includes(toggle));
  };

  const [data, setData] = useState<WorkflowFormData>(() => {
    const defaultTechnique =
      techniques.find((t) => initialData.template.includes(t)) ?? techniques[0];
    return {
      ...initialData,
      technique: defaultTechnique,
    };
  });

  const visitMatch = visitRegex.exec(data.visit);

  const filteredTemplateOptions: Option[] = getFilteredTemplates(
    data.technique
  );

  const handleToggleChange = (
    _event: React.MouseEvent<HTMLElement>,
    next: ToggleGroup | null
  ) => {
    if (!next) return;
    const filteredTemplates = getFilteredTemplates(next);
    setData((prev) => ({
      ...prev,
      technique: next,
      template: filteredTemplates[0].value,
    }));
  };

  const openInNewTab = (url: string) => {
    const w = window.open(url, "_blank");
    w?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const urlArguments = `outputFolder=${data.outpath}`;
    const url = `https://workflows.diamond.ac.uk/templates/${data.template}/${data.visit}?${urlArguments}`;
    openInNewTab(url);
  };

  return (
    <Grid container justifyContent="center" spacing={1}>
      <Grid item s={6}>
        <Typography variant="h4">I14 Workflows</Typography>
        <br />
        <form onSubmit={handleSubmit}>
          <Stack direction="column" spacing={2}>
            <Stack direction="column" spacing={0}>
              <FormLabel>Technique</FormLabel>
              <ToggleButtonGroup
                exclusive
                value={data.technique}
                onChange={handleToggleChange}
                aria-label="Technique"
              >
                {techniques.map((t) => (
                  <ToggleButton key={t} value={t}>
                    {t.toUpperCase()}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>
            <OptionSelect
              label="Template"
              value={data.template}
              options={filteredTemplateOptions}
              onChange={(e) =>
                setData((prev) => ({ ...prev, template: e.target.value }))
              }
            />

            <TextField
              name="visit"
              label="Visit"
              variant="outlined"
              size="small"
              placeholder="Visit"
              type="text"
              value={data.visit}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setData((prev) => ({ ...prev, visit: value }));
              }}
              helperText={visitMatch ? "" : "Expected format: xx12345-1"}
              error={!visitMatch}
            />
            <TextField
              name="outpath"
              label="Output path"
              variant="outlined"
              size="small"
              placeholder="Output path"
              type="text"
              value={data.outpath}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setData((prev) => ({ ...prev, outpath: e.target.value }));
              }}
            />

            <Button variant="contained" type="submit" disabled={!visitMatch}>
              Open workflow form in a new tab
            </Button>
          </Stack>
        </form>
      </Grid>
    </Grid>
  );
};

export default WorkflowForm;
