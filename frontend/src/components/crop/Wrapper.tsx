import React, { useMemo, useState } from "react";

import Contextbar from "./Contextbar";
import ImagePlot from "../crop/Plot";
import ImageNavbar from "../crop/Navbar";
import type { NDT, RectangularSelection } from "@diamondlightsource/davidia";
import defineSelectionOperations from "./SelectionOperations";
import type { SelectionOperations } from "./SelectionOperations";

interface WrapperProps {
  max_pixel_value: number;
  copies: number;
  images: NDT[];
}

export default function DisplayAreaWrapper({
  max_pixel_value,
  copies,
  images,
}: WrapperProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const empty_array: RectangularSelection[][] = useMemo(() => {
    const result: RectangularSelection[][] = [];
    for (let i = 0; i < copies; i++) {
      result.push([]);
    }
    return result;
  }, [copies]);
  const [imageSelections, setSelections] = useState(empty_array);
  const [previousImageSelections, setPreviousSelections] = useState<
    RectangularSelection[][]
  >([]);

  // the selection currently being presented on the screen
  let on_screen_selections: RectangularSelection[] = [];
  let on_screen_selection_index = -1;
  // setting currentSelections
  // searches backwards from the current frame for the first previous selection that is not empty
  // + copies and modulo create looping effect
  for (let i = imageIndex + copies; i > 0; i--) {
    const iteration_selection = imageSelections[i % copies];
    if (iteration_selection.length != 0) {
      on_screen_selections = iteration_selection;
      on_screen_selection_index = i % copies;
      break;
    }
  }

  const selection_operations: SelectionOperations = defineSelectionOperations(
    imageIndex,
    on_screen_selection_index,
    imageSelections,
    previousImageSelections,
    setSelections,
    setPreviousSelections
  );

  return (
    <div>
      <Contextbar />
      <ImagePlot
        image={images[imageIndex]}
        max_pixel_value={max_pixel_value}
        on_screen_selections={on_screen_selections}
        selection_operations={selection_operations}
      />
      <ImageNavbar
        totalImages={copies}
        currentImageIndex={imageIndex}
        setImageIndex={setImageIndex}
        selection_operations={selection_operations}
      />
    </div>
  );
}
