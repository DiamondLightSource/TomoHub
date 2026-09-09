import type SelectChangeEvent from "@mui/material/Select/SelectInput";

import OptionSelect from "./OptionSelect";
import { edgeOptions, transitionOptions } from "../../data/elements";

interface ElementSelectValue {
  edge: string;
  transition: string;
}

interface ElementSelectProps {
  value: ElementSelectValue;
  onChange: (value: ElementSelectValue) => void;
}

export default function TwoElementSelect({
  value,
  onChange,
}: ElementSelectProps) {
  return (
    <>
      <OptionSelect
        label="Edge"
        value={value.edge}
        options={edgeOptions}
        onChange={(e: SelectChangeEvent<string>) =>
          onChange({
            edge: e.target.value,
            transition: value.transition,
          })
        }
      />

      <OptionSelect
        label="Transition"
        value={value.transition}
        options={transitionOptions}
        onChange={(e: SelectChangeEvent<string>) =>
          onChange({
            edge: value.edge,
            transition: e.target.value,
          })
        }
      />
    </>
  );
}
