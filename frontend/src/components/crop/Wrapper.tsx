import React, { useState } from "react";

import ImagePlot from "../crop/Plot";
import ImageNavbar from "../crop/Navbar";
import type { NDT, SelectionBase } from "@diamondlightsource/davidia";
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
  // I couldnt figure out how to make an empty array of fixed length for a custom type like SelectionBase
  // even with ndarray
  // this will also run every refresh but it doesnt make sense to create it in a parent component and pass it down
  const empty_array: SelectionBase[][] = [];
  for (let i = 0; i < copies; i++) {
    empty_array.push([]);
  }
  const [imageSelections, setSelections] = useState(empty_array);

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

  const selection_operations: SelectionOperations = defineSelectionOperations(
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
        selection_operations={selection_operations}
      />
    </div>
  );
}
