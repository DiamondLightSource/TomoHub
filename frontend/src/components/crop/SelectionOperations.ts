import type { SelectionBase } from "@diamondlightsource/davidia";

export type SelectionOperations = {
  createSelection: (selection: SelectionBase) => void;
  removeSelection: () => void;
  onScreenBeingModified: (selection: SelectionBase) => boolean;
  forceRefresh: () => void;
};

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
  return imageSelectionsCopy[onScreenSelectionIndex][0] === selection;
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
  if (onScreenSelectionIndex === -1) {
    onScreenSelectionIndex = index;
  }
  const currentSelectionsCopy = [
    ...imageSelectionsCopy[onScreenSelectionIndex],
  ];
  imageSelectionsCopy[onScreenSelectionIndex] = currentSelectionsCopy;
  setSelections(imageSelectionsCopy);
}

export default function defineSelectionOperations(
  index: number,
  onScreenSelectionIndex: number,
  imageSelections: SelectionBase[][],
  setSelections: React.Dispatch<React.SetStateAction<SelectionBase[][]>>
): SelectionOperations {
  const imageSelectionsCopy = [...imageSelections];
  const functionHolder: SelectionOperations = {
    createSelection: function (selection: SelectionBase) {
      createSelection(index, imageSelectionsCopy, setSelections, selection);
    },
    removeSelection: function () {
      removeSelection(
        onScreenSelectionIndex,
        imageSelectionsCopy,
        setSelections
      );
    },
    onScreenBeingModified: function (selection: SelectionBase): boolean {
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
  };
  return functionHolder;
}
