import React, { useMemo, useState } from "react";

import Contextbar from "./Contextbar";
import ImagePlot from "../crop/Plot";
import ImageNavbar from "../crop/Navbar";
import type { NDT, RectangularSelection } from "@diamondlightsource/davidia";
import defineSelectionOperations from "./SelectionOperations";
import type { SelectionOperations } from "./SelectionOperations";

interface WrapperProps {
  maxPixelValue: number;
  copies: number;
  images: NDT[];
  sample_rate: number;
}

export default function DisplayAreaWrapper({
  maxPixelValue: maxPixelValue,
  copies,
  images,
  sample_rate,
}: WrapperProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const emptyArray: RectangularSelection[][] = useMemo(() => {
    const result: RectangularSelection[][] = [];
    for (let i = 0; i < copies; i++) {
      result.push([]);
    }
    return result;
  }, [copies]);
  const [imageSelections, setSelections] = useState(emptyArray);
  const [previousImageSelections, setPreviousSelections] = useState<
    RectangularSelection[][]
  >([]);

  // the selection currently being presented on the screen
  let onScreenSelections: RectangularSelection[] = [];
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
    previousImageSelections,
    setSelections,
    setPreviousSelections
  );

  return (
    <div>
      <Contextbar selections={imageSelections} sample_rate={sample_rate} />
      <ImagePlot
        image={images[imageIndex]}
        maxPixelValue={maxPixelValue}
        onScreenSelections={onScreenSelections}
        selectionOperations={selectionOperations}
      />
      <ImageNavbar
        totalImages={copies}
        currentImageIndex={imageIndex}
        setImageIndex={setImageIndex}
        selectionOperations={selectionOperations}
      />
    </div>
  );
}
