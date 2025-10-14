import { RectangularSelection } from "@diamondlightsource/davidia";

export type SelectionOperations = {
  createSelection: (
    selection: RectangularSelection,
    deleteOthers: boolean
  ) => void;
  removeSelection: () => void;
  onScreenBeingModified: (selection: RectangularSelection) => boolean;
  forceRefresh: () => void;
  removeAll: () => void;
  toPrevious: () => void;
  initialiseSingleSelectionMode: () => void;
  debugPrint: () => void;
  undoPossible: boolean;
  selectionsEmpty: boolean;
};

// creates selection at the current index
function createSelection(
  index: number,
  imageSelectionsCopy: RectangularSelection[][],
  setSelections: React.Dispatch<React.SetStateAction<RectangularSelection[][]>>,
  savePrevious: () => void,
  selection: RectangularSelection,
  deleteOthers: boolean
) {
  savePrevious();
  if (deleteOthers) {
    const copies = imageSelectionsCopy.length;
    imageSelectionsCopy = [];
    for (let i = 0; i < copies; i++) {
      imageSelectionsCopy.push([]);
    }
  }
  imageSelectionsCopy[index] = [selection];
  setSelections(imageSelectionsCopy);
}

// removes on screen selection
function removeSelection(
  onScreenSelectionIndex: number | undefined,
  imageSelectionsCopy: RectangularSelection[][],
  setSelections: React.Dispatch<React.SetStateAction<RectangularSelection[][]>>,
  savePrevious: () => void
) {
  if (onScreenSelectionIndex === undefined) {
    return;
  }
  savePrevious();
  imageSelectionsCopy[onScreenSelectionIndex] = [];
  setSelections(imageSelectionsCopy);
}

function onScreenBeingModified(
  onScreenSelectionIndex: number | undefined,
  imageSelectionsCopy: RectangularSelection[][],
  selection: RectangularSelection
): boolean {
  return (
    onScreenSelectionIndex !== undefined &&
    imageSelectionsCopy[onScreenSelectionIndex][0] === selection
  );
}

function forceRefresh(
  index: number,
  onScreenSelectionIndex: number | undefined,
  imageSelectionsCopy: RectangularSelection[][],
  setSelections: React.Dispatch<React.SetStateAction<RectangularSelection[][]>>
) {
  // copy the value of currentSelection and set it to that again (dont change it)
  // this stops regions being added if theyre not a rectangle
  // however, the component still needs to refresh as the new selection region will be visible otherwise
  if (onScreenSelectionIndex === undefined) {
    onScreenSelectionIndex = index;
  }
  const currentSelectionsCopy = [
    ...imageSelectionsCopy[onScreenSelectionIndex],
  ];
  imageSelectionsCopy[onScreenSelectionIndex] = currentSelectionsCopy;
  setSelections(imageSelectionsCopy);
}

function removeAll(
  imageSelectionsCopy: RectangularSelection[][],
  setSelections: React.Dispatch<React.SetStateAction<RectangularSelection[][]>>,
  savePrevious: () => void
) {
  savePrevious();
  const emptyArray: RectangularSelection[][] = [];
  for (let i = 0; i < imageSelectionsCopy.length; i++) {
    emptyArray.push([]);
  }
  setSelections(emptyArray);
}

function toPrevious(
  previousImageSelections: RectangularSelection[][],
  setSelections: React.Dispatch<React.SetStateAction<RectangularSelection[][]>>,
  setPreviousSelections: React.Dispatch<
    React.SetStateAction<RectangularSelection[][]>
  >
) {
  // already "undone"
  if (previousImageSelections.length === 0) {
    return;
  }
  setSelections(previousImageSelections);
  setPreviousSelections([]);
}

function savePrevious(
  imageSelections: RectangularSelection[][],
  setPreviousSelections: React.Dispatch<
    React.SetStateAction<RectangularSelection[][]>
  >
) {
  const imageSelectionsOtherCopy = [...imageSelections];
  setPreviousSelections(imageSelectionsOtherCopy);
}

function initialiseSingleSelectionMode(
  imageSelections: RectangularSelection[][],
  setSelections: React.Dispatch<React.SetStateAction<RectangularSelection[][]>>,
  setPreviousSelections: React.Dispatch<
    React.SetStateAction<RectangularSelection[][]>
  >,
  imageWidth: number,
  imageHeight: number
) {
  const emptySelectionsList: RectangularSelection[][] = [];
  for (let i = 0; i < imageSelections.length; i++) {
    emptySelectionsList.push([]);
  }
  // not good to have these magic numbers
  emptySelectionsList[0] = [
    new RectangularSelection(
      [imageWidth * 0.25, imageHeight * 0.25],
      [imageWidth * 0.5, imageHeight * 0.5]
    ),
  ];
  setSelections(emptySelectionsList);
  setPreviousSelections([]);
}

function debugPrint(imageSelections, previousImageSelections) {
  // wont be updated, will always be the last sets
  console.log("image selections: ");
  console.log(imageSelections);
  console.log("previous image selections: ");
  console.log(previousImageSelections);
}

export default function defineSelectionOperations(
  index: number,
  onScreenSelectionIndex: number | undefined,
  imageSelections: RectangularSelection[][],
  previousImageSelections: RectangularSelection[][],
  setSelections: React.Dispatch<React.SetStateAction<RectangularSelection[][]>>,
  setPreviousSelections: React.Dispatch<
    React.SetStateAction<RectangularSelection[][]>
  >,
  imageWidth: number,
  imageHeight: number
): SelectionOperations {
  const imageSelectionsCopy = [...imageSelections];
  const minSavePrevious = function () {
    savePrevious(imageSelections, setPreviousSelections);
  };

  const functionHolder: SelectionOperations = {
    createSelection: function (
      selection: RectangularSelection,
      deleteOthers: boolean
    ) {
      createSelection(
        index,
        imageSelectionsCopy,
        setSelections,
        minSavePrevious,
        selection,
        deleteOthers
      );
    },
    removeSelection: function () {
      removeSelection(
        onScreenSelectionIndex,
        imageSelectionsCopy,
        setSelections,
        minSavePrevious
      );
    },
    onScreenBeingModified: function (selection: RectangularSelection): boolean {
      return onScreenBeingModified(
        onScreenSelectionIndex,
        imageSelectionsCopy,
        selection
      );
    },
    forceRefresh: function () {
      forceRefresh(
        index,
        onScreenSelectionIndex,
        imageSelectionsCopy,
        setSelections
      );
    },
    removeAll: function () {
      removeAll(imageSelectionsCopy, setSelections, minSavePrevious);
    },
    toPrevious: function () {
      toPrevious(previousImageSelections, setSelections, setPreviousSelections);
    },
    initialiseSingleSelectionMode: function () {
      initialiseSingleSelectionMode(
        imageSelections,
        setSelections,
        setPreviousSelections,
        imageWidth,
        imageHeight
      );
    },
    debugPrint: function () {
      debugPrint(imageSelections, previousImageSelections);
    },
    undoPossible: previousImageSelections.length !== 0,
    selectionsEmpty: onScreenSelectionIndex === undefined,
  };
  return functionHolder;
}
