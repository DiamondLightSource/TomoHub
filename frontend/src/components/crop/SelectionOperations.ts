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
  image_selections_copy: SelectionBase[][],
  setSelections: React.Dispatch<React.SetStateAction<SelectionBase[][]>>,
  selection: SelectionBase
) {
  image_selections_copy[index] = [selection];
  setSelections(image_selections_copy);
}

// removes on screen selection
function removeSelection(
  on_screen_selection_index: number,
  image_selections_copy: SelectionBase[][],
  setSelections: React.Dispatch<React.SetStateAction<SelectionBase[][]>>
) {
  image_selections_copy[on_screen_selection_index] = [];
  setSelections(image_selections_copy);
}

function onScreenBeingModified(
  on_screen_selection_index: number,
  image_selections_copy: SelectionBase[][],
  selection: SelectionBase
): boolean {
  return image_selections_copy[on_screen_selection_index][0] === selection;
}

function forceRefresh(
  index: number,
  on_screen_selection_index: number,
  image_selections_copy: SelectionBase[][],
  setSelections: React.Dispatch<React.SetStateAction<SelectionBase[][]>>
) {
  // copy the value of currentSelection and set it to that again (dont change it)
  // this stops regions being added if theyre not a rectangle
  // however, the component still needs to refresh as the new selection region will be visible otherwise
  if (on_screen_selection_index === -1) {
    on_screen_selection_index = index;
  }
  const currentSelectionsCopy = [
    ...image_selections_copy[on_screen_selection_index],
  ];
  image_selections_copy[on_screen_selection_index] = currentSelectionsCopy;
  setSelections(image_selections_copy);
}

export default function defineSelectionOperations(
  index: number,
  on_screen_selection_index: number,
  image_selections: SelectionBase[][],
  setSelections: React.Dispatch<React.SetStateAction<SelectionBase[][]>>
): SelectionOperations {
  const image_selections_copy = [...image_selections];
  const function_holder: SelectionOperations = {
    createSelection: function (selection: SelectionBase) {
      createSelection(index, image_selections_copy, setSelections, selection);
    },
    removeSelection: function () {
      removeSelection(
        on_screen_selection_index,
        image_selections_copy,
        setSelections
      );
    },
    onScreenBeingModified: function (selection: SelectionBase): boolean {
      return onScreenBeingModified(
        on_screen_selection_index,
        image_selections_copy,
        selection
      );
    },
    forceRefresh: function () {
      forceRefresh(
        index,
        on_screen_selection_index,
        image_selections_copy,
        setSelections
      );
    },
  };
  return function_holder;
}
