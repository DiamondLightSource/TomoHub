import { RectangularSelection } from "@diamondlightsource/davidia";

export type SelectionOperations = {
  createSelection: (
    selection: RectangularSelection,
    delete_others: boolean
  ) => void;
  removeSelection: () => void;
  onScreenBeingModified: (selection: RectangularSelection) => boolean;
  forceRefresh: () => void;
  removeAll: () => void;
  toPrevious: () => void;
  initialiseSingleSelectionMode: () => void;
  debugPrint: () => void;
  undo_possible: boolean;
  selections_empty: boolean;
};

// creates selection at the current index
function createSelection(
  index: number,
  image_selections_copy: RectangularSelection[][],
  setSelections: React.Dispatch<React.SetStateAction<RectangularSelection[][]>>,
  savePrevious: () => void,
  selection: RectangularSelection,
  delete_others: boolean
) {
  savePrevious();
  if (delete_others) {
    const copies = image_selections_copy.length;
    image_selections_copy = [];
    for (let i = 0; i < copies; i++) {
      image_selections_copy.push([]);
    }
  }
  image_selections_copy[index] = [selection];
  setSelections(image_selections_copy);
}

// removes on screen selection
function removeSelection(
  on_screen_selection_index: number,
  image_selections_copy: RectangularSelection[][],
  setSelections: React.Dispatch<React.SetStateAction<RectangularSelection[][]>>,
  savePrevious: () => void
) {
  savePrevious();
  image_selections_copy[on_screen_selection_index] = [];
  setSelections(image_selections_copy);
}

function onScreenBeingModified(
  on_screen_selection_index: number,
  image_selections_copy: RectangularSelection[][],
  selection: RectangularSelection
): boolean {
  return image_selections_copy[on_screen_selection_index][0] == selection;
}

function forceRefresh(
  index: number,
  on_screen_selection_index: number,
  image_selections_copy: RectangularSelection[][],
  setSelections: React.Dispatch<React.SetStateAction<RectangularSelection[][]>>
) {
  // copy the value of currentSelection and set it to that again (dont change it)
  // this stops regions being added if theyre not a rectangle
  // however, the component still needs to refresh as the new selection region will be visible otherwise
  // lmk if theres a better way to "force refresh" a component
  if (on_screen_selection_index == -1) {
    on_screen_selection_index = index;
  }
  const currentSelectionsCopy = [
    ...image_selections_copy[on_screen_selection_index],
  ];
  image_selections_copy[on_screen_selection_index] = currentSelectionsCopy;
  setSelections(image_selections_copy);
}

function removeAll(
  image_selections_copy: RectangularSelection[][],
  setSelections: React.Dispatch<React.SetStateAction<RectangularSelection[][]>>,
  savePrevious: () => void
) {
  savePrevious();
  const empty_array: RectangularSelection[][] = [];
  for (let i = 0; i < image_selections_copy.length; i++) {
    empty_array.push([]);
  }
  setSelections(empty_array);
}

function toPrevious(
  previous_image_selections: RectangularSelection[][],
  setSelections: React.Dispatch<React.SetStateAction<RectangularSelection[][]>>,
  setPreviousSelections: React.Dispatch<
    React.SetStateAction<RectangularSelection[][]>
  >
) {
  // already "undone"
  if (previous_image_selections.length == 0) {
    return;
  }
  setSelections(previous_image_selections);
  setPreviousSelections([]);
}

function savePrevious(
  image_selections: RectangularSelection[][],
  setPreviousSelections: React.Dispatch<
    React.SetStateAction<RectangularSelection[][]>
  >
) {
  const image_selections_other_copy = [...image_selections];
  setPreviousSelections(image_selections_other_copy);
}

function initialiseSingleSelectionMode(
  image_selections: RectangularSelection[][],
  setSelections: React.Dispatch<React.SetStateAction<RectangularSelection[][]>>,
  setPreviousSelections: React.Dispatch<
    React.SetStateAction<RectangularSelection[][]>
  >
) {
  const empty_selections_list: RectangularSelection[][] = [];
  for (let i = 0; i < image_selections.length; i++) {
    empty_selections_list.push([]);
  }
  // not good to have these magic numbers
  empty_selections_list[0] = [new RectangularSelection([100, 100], [100, 100])];
  setSelections(empty_selections_list);
  setPreviousSelections([]);
}

function debugPrint(image_selections, previous_image_selections) {
  // wont be updated, will always be the last sets
  console.log("image selections: ");
  console.log(image_selections);
  console.log("previous image selections: ");
  console.log(previous_image_selections);
}

export default function defineSelectionOperations(
  index: number,
  on_screen_selection_index: number,
  image_selections: RectangularSelection[][],
  previous_image_selections: RectangularSelection[][],
  setSelections: React.Dispatch<React.SetStateAction<RectangularSelection[][]>>,
  setPreviousSelections: React.Dispatch<
    React.SetStateAction<RectangularSelection[][]>
  >
): SelectionOperations {
  const image_selections_copy = [...image_selections];
  const minSavePrevious = function () {
    savePrevious(image_selections, setPreviousSelections);
  };

  const function_holder: SelectionOperations = {
    createSelection: function (
      selection: RectangularSelection,
      delete_others: boolean
    ) {
      createSelection(
        index,
        image_selections_copy,
        setSelections,
        minSavePrevious,
        selection,
        delete_others
      );
    },
    removeSelection: function () {
      removeSelection(
        on_screen_selection_index,
        image_selections_copy,
        setSelections,
        minSavePrevious
      );
    },
    onScreenBeingModified: function (selection: RectangularSelection): boolean {
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
    removeAll: function () {
      removeAll(image_selections_copy, setSelections, minSavePrevious);
    },
    toPrevious: function () {
      toPrevious(
        previous_image_selections,
        setSelections,
        setPreviousSelections
      );
    },
    initialiseSingleSelectionMode: function () {
      initialiseSingleSelectionMode(
        image_selections,
        setSelections,
        setPreviousSelections
      );
    },
    debugPrint: function () {
      debugPrint(image_selections, previous_image_selections);
    },
    undo_possible: previous_image_selections.length != 0,
    selections_empty: on_screen_selection_index == -1,
  };
  return function_holder;
}
