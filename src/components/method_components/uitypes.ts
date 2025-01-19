export type UIParameterType = {
    type : string;
    value:  string | number | boolean | null | undefined;
    desc: string;  
};

// Define the method type that can be used for all methods
type UIMethod = {
    method_name: string;
    module_path: string;
    method_desc: string;
    method_doc: string;
    parameters: Record<string, UIParameterType>;
}
export default UIMethod