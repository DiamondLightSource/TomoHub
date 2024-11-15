import {createContext,useState,useContext,ReactNode } from "react";

type Method = {
    name:string;
    [parameters:string]:string|number|boolean|object;
}

export const MethodsContext = createContext<Method[]>([]);

const MethodsListProvider:React.FC<{ children: ReactNode }> = ({ children }) => {
    const [methods,setMethods] = useState<Method[]>([]);
    return (
        <MethodsContext.Provider value={methods}>
            {children}
        </MethodsContext.Provider>
    )
}

export default MethodsListProvider
