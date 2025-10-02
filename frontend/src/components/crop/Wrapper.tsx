import React, { useMemo, useState } from "react";

import ImagePlot from "../crop/Plot";
import ImageNavbar from "../crop/Navbar";
import type { NDT, SelectionBase } from "@diamondlightsource/davidia";
import defineSelectionOperations from "./SelectionOperations";
import type { SelectionOperations } from "./SelectionOperations";

interface WrapperProps {
  maxPixelValue: number;
  copies: number;
  images: NDT[];
}

export default function DisplayAreaWrapper({
  maxPixelValue: maxPixelValue,
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
  let onScreenSelections: SelectionBase[] = [];
  let onScreenSelectionIndex = -1;
  // setting currentSelections
  // searches backwards from the current frame for the first previous selection that is not empty
  // + copies and modulo create looping effect
  for (let i = imageIndex + copies; i > 0; i--) {
    const iterationSelection = imageSelections[i % copies];
    if (iterationSelection.length !== 0) {
      onScreenSelections = iterationSelection;
      onScreenSelectionIndex = i % copies;
      break;
    }
  }

  const selectionOperations: SelectionOperations = defineSelectionOperations(
    imageIndex,
    onScreenSelectionIndex,
    imageSelections,
    setSelections
  );

  return (
    <div>
      <ImagePlot
        image={images[imageIndex]}
        maxPixelValue={maxPixelValue}
        onScreenSelections={onScreenSelections}
        selectionOperations={selectionOperations}
      />
      <ImageNavbar
        totalImages={copies}
        currentImageIndex={imageIndex}
        imageIndexSetter={setImageIndex}
      />
    </div>
  );
}
