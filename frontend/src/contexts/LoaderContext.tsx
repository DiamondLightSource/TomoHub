import React, { createContext, useState, ReactNode, useContext } from "react";

// Define the type for the parameters object
interface ParametersType {
  data_path: string;
  image_key_path?: string;
  rotation_angles: {
    data_path?: string;
    user_defined?: {
      start_angle: string;
      stop_angle: string;
      angles_total: string;
    };
  };
  darks?: {
    file: string;
    data_path: string;
  };
  flats?: {
    file: string;
    data_path: string;
  };
}

interface LoaderContextType {
  method: string;
  module_path: string;
  parameters: ParametersType; // Use the defined type
  setDataPath: (path: string) => void;
  setImageKeyPath: (path: string) => void;
  setRotationAnglesDataPath: (path: string) => void;
  setUserDefinedRotationAngles: (start: string, stop: string, total: string) => void;
  setDarks: (file: string, dataPath: string) => void;
  setFlats: (file: string, dataPath: string) => void;
  removeDarksAndFlats: () => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize the parameters object with all possible fields
  const [parameters, setParameters] = useState<ParametersType>({
    data_path: "",
    rotation_angles: {},
  });

  const setDataPath = (path: string) => {
    setParameters((prev) => ({ ...prev, data_path: path }));
  };

  const setImageKeyPath = (path: string) => {
    setParameters((prev) => ({ ...prev, image_key_path: path }));
  };

  const setRotationAnglesDataPath = (path: string) => {
    setParameters((prev) => ({
      ...prev,
      rotation_angles: { data_path: path },
    }));
  };

  const setUserDefinedRotationAngles = (start: string, stop: string, total: string) => {
    setParameters((prev) => ({
      ...prev,
      rotation_angles: {
        user_defined: {
          start_angle: start,
          stop_angle: stop,
          angles_total: total,
        },
      },
    }));
  };

  const setDarks = (file: string, dataPath: string) => {
    setParameters((prev) => ({
      ...prev,
      darks: { file, data_path: dataPath },
    }));
  };

  const setFlats = (file: string, dataPath: string) => {
    setParameters((prev) => ({
      ...prev,
      flats: { file, data_path: dataPath },
    }));
  };

  const removeDarksAndFlats = () => {
    setParameters((prev) => {
      const { darks, flats, ...rest } = prev;
      return rest;
    });
  };

  return (
    <LoaderContext.Provider
      value={{
        method: "standard_tomo",
        module_path: "httomo.data.hdf.loaders",
        parameters,
        setDataPath,
        setImageKeyPath,
        setRotationAnglesDataPath,
        setUserDefinedRotationAngles,
        setDarks,
        setFlats,
        removeDarksAndFlats,
      }}
    >
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
};