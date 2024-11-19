export type ParameterType = [
    string,  // type
    string,  // description
    string | number | null | undefined  // default value
];

// Define the method type that can be used for all methods
type Method = {
    id: string;
    methodName: string;
    linkToDoc: string;
    parameters: Record<string, ParameterType>;
}
export default Method