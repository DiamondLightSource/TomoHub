import { Box } from "@mui/material";
import { HeatmapPlot, ScaleType } from "@diamondlightsource/davidia";
import {
  NDT,
  SelectionBase,
  RectangularSelection,
} from "@diamondlightsource/davidia";
import { useMemo, useState } from "react";

interface ImagePlotProps {
  image: NDT;
  index: number;
  max_pixel_value: number;
  copies: number;
}

export default function ImagePlot({
  image,
  index,
  max_pixel_value,
  copies,
}: ImagePlotProps) {
  // useMemo so the empty array is only created once (unless copies is updated)
  const emptyArray: SelectionBase[][] = useMemo(() => {
    const result: SelectionBase[][] = [];
    for (let i = 0; i < copies; i++) {
      result.push([]);
    }
    return result;
  }, [copies]);

  const [imageSelections, setSelections] = useState(emptyArray);

  // the selection currently being presented on the screen
  let currentSelections: SelectionBase[] = [];
  let currentSelectionIndex = -1;
  // setting currentSelections
  // searches backwards from the current frame for the first previous selection that is not empty
  // + copies and modulo create looping effect
  for (let i = index + copies; i > 0; i--) {
    const iteration_selection = imageSelections[i % copies];
    if (iteration_selection.length != 0) {
      currentSelections = iteration_selection;
      currentSelectionIndex = i % copies;
      break;
    }
  }

  return (
    <Box style={{ display: "grid", height: "49vh", minHeight: "400px" }}>
      <HeatmapPlot
        aspect="auto"
        colourMap="Purples"
        domain={[0, max_pixel_value]}
        heatmapScale={ScaleType.Linear}
        plotConfig={{
          title: "Sample Heatmap Plot",
          xLabel: "x-axis",
          yLabel: "y-axis",
        }}
        values={image}
        selectionsListener={(eventType, dragging, selection) => {
          if (selection == undefined) {
            return;
          }
          const imageSelectionsCopy = [...imageSelections];
          if (eventType === "created") {
            if (selection instanceof RectangularSelection) {
              imageSelectionsCopy[index] = [selection];
            } else {
              // stops index out of bounds error
              if (currentSelectionIndex == -1) {
                currentSelectionIndex = index;
              }
              // copy the value of currentSelection and set it to that again (dont change it)
              // this stops regions being added if theyre not a rectangle
              // however, the component still needs to refresh as the new selection region will be visible otherwise
              const currentSelectionsCopy = [
                ...imageSelectionsCopy[currentSelectionIndex],
              ];
              imageSelectionsCopy[currentSelectionIndex] =
                currentSelectionsCopy;
            }
          } // updated is also called after created, we dont want to consider this case
          else if (
            eventType === "updated" &&
            !dragging &&
            imageSelectionsCopy[currentSelectionIndex][0] != selection
          ) {
            imageSelectionsCopy[index] = [selection];
          } else if (eventType === "removed") {
            imageSelectionsCopy[currentSelectionIndex] = [];
          }
          setSelections(imageSelectionsCopy);
        }}
        selections={currentSelections}
      />
    </Box>
  );
}
