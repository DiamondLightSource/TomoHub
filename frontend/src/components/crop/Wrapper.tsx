import React, { useMemo, useState } from "react";

import ImagePlot from "../crop/Plot";
import ImageNavbar from "../crop/Navbar";
import type { NDT, SelectionBase } from "@diamondlightsource/davidia";
import defineSelectionOperations from "./SelectionOperations";
import type { selectionOperations } from "./SelectionOperations";

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
  let on_screen_selections: SelectionBase[] = [];
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

  const selection_operations: selectionOperations = defineSelectionOperations(
    imageIndex,
    on_screen_selection_index,
    imageSelections,
    setSelections
  );

  return (
    <div>
      <ImagePlot
        image={images[imageIndex]}
        max_pixel_value={max_pixel_value}
        on_screen_selections={on_screen_selections}
        selection_operations={selection_operations}
      />
      <ImageNavbar
        totalImages={copies}
        currentImageIndex={imageIndex}
        imageIndexSetter={setImageIndex}
      />
    </div>
  );
}
