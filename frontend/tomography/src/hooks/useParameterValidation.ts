export const useParameterValidation = () => {
  const parseValue = (inputValue: string, type: string) => {
    const actualType = type.replace("Optional[", "").replace("]", "");

    switch (actualType) {
      case "int":
        if (inputValue === "" || inputValue === "-") return null;
        if (/^-?\d+$/.test(inputValue)) return parseInt(inputValue, 10);
        return undefined; // Invalid input

      case "float":
        if (["", "-", ".", "-."].includes(inputValue)) return null;
        if (/^-?\d*\.?\d*$/.test(inputValue)) return parseFloat(inputValue);
        return undefined; // Invalid input

      case "bool":
        return inputValue; // Will be handled by checkbox

      default:
        return inputValue;
    }
  };

  return { parseValue };
};
