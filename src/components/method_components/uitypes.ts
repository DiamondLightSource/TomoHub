export type UIParameterType = [
    string,  // type
    boolean, // isRequired
    string,  // description
    string | number | boolean | null | undefined,  // default value
    string[]? // for selects
];

// Define the method type that can be used for all methods
type UIMethod = {
    id: string;
    methodName: string;
    linkToDoc: string;
    parameters: Record<string, UIParameterType>;
}
export default UIMethod