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

// creates selection at the current index
function createSelection(
  index: number,
  imageSelectionsCopy: SelectionBase[][],
  setSelections: React.Dispatch<React.SetStateAction<SelectionBase[][]>>,
  selection: SelectionBase
) {
  imageSelectionsCopy[index] = [selection];
  setSelections(imageSelectionsCopy);
}

// removes on screen selection
function removeSelection(
  onScreenSelectionIndex: number,
  imageSelectionsCopy: SelectionBase[][],
  setSelections: React.Dispatch<React.SetStateAction<SelectionBase[][]>>
) {
  imageSelectionsCopy[onScreenSelectionIndex] = [];
  setSelections(imageSelectionsCopy);
}

function onScreenBeingModified(
  onScreenSelectionIndex: number,
  imageSelectionsCopy: SelectionBase[][],
  selection: SelectionBase
): boolean {
  return imageSelectionsCopy[onScreenSelectionIndex][0] == selection;
}

function forceRefresh(
  index: number,
  onScreenSelectionIndex: number,
  imageSelectionsCopy: SelectionBase[][],
  setSelections: React.Dispatch<React.SetStateAction<SelectionBase[][]>>
) {
  // copy the value of currentSelection and set it to that again (dont change it)
  // this stops regions being added if theyre not a rectangle
  // however, the component still needs to refresh as the new selection region will be visible otherwise
  // lmk if theres a better way to "force refresh" a component
  if (onScreenSelectionIndex == -1) {
    onScreenSelectionIndex = index;
  }
  const currentSelectionsCopy = [
    ...imageSelectionsCopy[onScreenSelectionIndex],
  ];
  imageSelectionsCopy[onScreenSelectionIndex] = currentSelectionsCopy;
  setSelections(imageSelectionsCopy);
}

type selectionOperations = {
  minCreateSelection: (selection: SelectionBase) => void;
  minRemoveSelection: () => void;
  minOnScreenBeingModified: (selection: SelectionBase) => boolean;
  minForceRefresh: () => void;
};

function defineSelectionOperations(
  index: number,
  onScreenSelectionIndex: number,
  imageSelections: SelectionBase[][],
  setSelections: React.Dispatch<React.SetStateAction<SelectionBase[][]>>
): selectionOperations {
  const imageSelectionsCopy = [...imageSelections];
  const function_holder: selectionOperations = {
    minCreateSelection: function (selection: SelectionBase) {
      createSelection(index, imageSelectionsCopy, setSelections, selection);
    },
    minRemoveSelection: function () {
      removeSelection(
        onScreenSelectionIndex,
        imageSelectionsCopy,
        setSelections
      );
    },
    minOnScreenBeingModified: function (selection: SelectionBase): boolean {
      return onScreenBeingModified(
        onScreenSelectionIndex,
        imageSelectionsCopy,
        selection
      );
    },
    minForceRefresh: function () {
      forceRefresh(
        index,
        onScreenSelectionIndex,
        imageSelectionsCopy,
        setSelections
      );
    },
  };
  return function_holder;
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
  let onScreenSelections: SelectionBase[] = [];
  let onScreenSelectionIndex = -1;
  // setting currentSelections
  // searches backwards from the current frame for the first previous selection that is not empty
  // + copies and modulo create looping effect
  for (let i = index + copies; i > 0; i--) {
    const iteration_selection = imageSelections[i % copies];
    if (iteration_selection.length !== 0) {
      onScreenSelections = iteration_selection;
      onScreenSelectionIndex = i % copies;
      break;
    }
  }

  const {
    minCreateSelection,
    minRemoveSelection,
    minOnScreenBeingModified,
    minForceRefresh,
  } = defineSelectionOperations(
    index,
    onScreenSelectionIndex,
    imageSelections,
    setSelections
  );

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
          if (selection === undefined) {
            return;
          }
            if (eventType === "created") {
              if (selection instanceof RectangularSelection) {
                minCreateSelection(selection);
              } else {
                // selection area is not a rectangle
                // dont add anything to the list and force refresh so it disapears
                minForceRefresh();
              }
            } else if (eventType === "removed") {
              minRemoveSelection();
            } else if (eventType === "updated" && !dragging) {
              if (!minOnScreenBeingModified(selection)) {
                minCreateSelection(selection);
              }
            }
          }
        }
        selections={onScreenSelections}
      />
    </Box>
  );
}
