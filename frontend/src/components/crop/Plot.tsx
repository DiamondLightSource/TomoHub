import { Box } from "@mui/material";
import { HeatmapPlot, ScaleType } from "@diamondlightsource/davidia";
import {
  NDT,
  SelectionBase,
  RectangularSelection,
} from "@diamondlightsource/davidia";
import { useState } from "react";

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
  // I couldnt figure out how to make an empty array of fixed length for a custom type like SelectionBase
  // even with ndarray
  // this will also run every refresh but it doesnt make sense to create it in a parent component and pass it down
  const emptyArray: (SelectionBase[] | null)[] = [];
  for (let i = 0; i < copies; i++) {
    emptyArray.push(null);
  }
  const [imageSelections, setSelections] = useState(emptyArray);

  let currentSelections: SelectionBase[] = [];
  // searches backwards from the current frame for the first previous selection that is not null
  // + copies and modulo create looping effect
  for (let i = index + copies; i > 0; i--) {
    const iteration_selection = imageSelections[i % copies];
    if (iteration_selection != null) {
      currentSelections = iteration_selection;
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
          if (selection != undefined) {
            const imageSelectionsCopy = [...imageSelections];
            if (eventType == "created") {
              if (selection instanceof RectangularSelection) {
                imageSelectionsCopy[index] = [selection];
                setSelections(imageSelectionsCopy);
              } else {
                // copy the value of currentSelection and set it to that again (dont change it)
                // this stops regions being added if theyre not a rectangle
                // however, the component still needs to refresh as the new selection region will be visible otherwise
                setSelections(imageSelectionsCopy);
              }
            }
            if (eventType == "updated" && !dragging) {
              imageSelectionsCopy[index] = [selection];
              setSelections(imageSelectionsCopy);
            }
          }
        }}
        selections={currentSelections}
      />
    </Box>
  );
}
