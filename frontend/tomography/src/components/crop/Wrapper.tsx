import React, { useMemo, useState } from "react";

import Contextbar from "./Contextbar";
import ImagePlot from "./Plot";
import ImageNavbar from "./Navbar";
import type { NDT, RectangularSelection } from "@diamondlightsource/davidia";
import defineSelectionOperations from "./SelectionOperations";
import type { SelectionOperations } from "./SelectionOperations";
import { SelectionMode } from "../../types/crop.ts";

interface WrapperProps {
  maxPixelValue: number;
  copies: number;
  images: NDT[];
  sampleRate: number;
}

export default function DisplayAreaWrapper({
  maxPixelValue: maxPixelValue,
  copies,
  images,
  sampleRate: sampleRate,
}: WrapperProps) {
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(
    SelectionMode.Single
  );
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
  let onScreenSelectionIndex: number | undefined = undefined;
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
    setPreviousSelections,
    images[0].shape[1],
    images[0].shape[0]
  );
  useMemo(selectionOperations.initialiseSingleSelectionMode, []);

  return (
    <div>
      <Contextbar selections={imageSelections} sampleRate={sampleRate} />
      <ImagePlot
        image={images[imageIndex]}
        onScreenSelections={onScreenSelections}
        maxPixelValue={maxPixelValue}
        createSelection={selectionOperations.createSelection}
        forceRefresh={selectionOperations.forceRefresh}
        removeSelection={selectionOperations.removeSelection}
        onScreenBeingModified={selectionOperations.onScreenBeingModified}
        selectionMode={selectionMode}
      />
      <ImageNavbar
        totalImages={copies}
        currentImageIndex={imageIndex}
        setImageIndex={setImageIndex}
        initialiseSingleSelectionMode={
          selectionOperations.initialiseSingleSelectionMode
        }
        toPrevious={selectionOperations.toPrevious}
        removeSelection={selectionOperations.removeSelection}
        removeAll={selectionOperations.removeAll}
        selectionsEmpty={selectionOperations.selectionsEmpty}
        undoPossible={selectionOperations.undoPossible}
        selectionMode={selectionMode}
        setSelectionMode={setSelectionMode}
      />
    </div>
  );
}
