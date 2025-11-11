import { createContext, ReactNode, useContext, useState } from "react";

interface CropContextProps {
  tifURL: string | undefined;
  setTifURL: (url: string | undefined) => void;
}

const CropContext = createContext<CropContextProps | undefined>(undefined);

export default function CropProvider({ children }: { children: ReactNode }) {
  const [tifURL, setTifURL] = useState<undefined | string>(undefined);

  return (
    <CropContext.Provider value={{ tifURL, setTifURL }}>
      {children}
    </CropContext.Provider>
  );
}

export function useTifURLContext() {
  const context = useContext(CropContext);
  if (!context) {
    throw new Error("useTifURL must be used within a CropProvider");
  }
  return context;
}
