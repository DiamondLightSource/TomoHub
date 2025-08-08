import React, { createContext, useState, ReactNode, useContext } from 'react';

// Define the type for the parameters object
export interface PreviewType {
  start?: number | 'begin' | 'mid' | 'end' | null;
  start_offset?: number;
  stop?: number | 'begin' | 'mid' | 'end' | null;
  stop_offset?: number;
  mid?: 'begin' | 'mid' | 'end'; // Only these values are allowed for mid
}

interface ParametersType {
  data_path: string;
  image_key_path?: string;
  rotation_angles: {
    data_path?: string | 'auto';
    user_defined?: {
      start_angle: number;
      stop_angle: number;
      angles_total: number;
    };
  };
  darks?: {
    file: string;
    data_path: string;
  } | null;
  flats?: {
    file: string;
    data_path: string;
  } | null;
  preview?: {
    detector_x?: PreviewType | null; // Renamed from preview_x to detector_x
    detector_y?: PreviewType | null; // Renamed from preview_y to detector_y
  };
}

interface LoaderContextType {
  method: string;
  module_path: string;
  parameters: ParametersType;
  setDataPath: (path: string) => void;
  setImageKeyPath: (path: string) => void;
  setRotationAnglesDataPath: (path: string) => void;
  setUserDefinedRotationAngles: (
    start: number,
    stop: number,
    total: number
  ) => void;
  setDarks: (file: string, dataPath: string) => void;
  setFlats: (file: string, dataPath: string) => void;
  removeDarksAndFlats: () => void;
  setDetectorX: (preview: PreviewType | null) => void; // Changed to accept null
  setDetectorY: (preview: PreviewType | null) => void; // Changed to accept null
  removePreview: () => void;
  isContextValid: () => boolean; // Add this new function
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [parameters, setParameters] = useState<ParametersType>({
    data_path: '',
    rotation_angles: {},
  });

  const setDataPath = (path: string) => {
    setParameters(prev => ({ ...prev, data_path: path }));
  };

  const setImageKeyPath = (path: string) => {
    setParameters(prev => ({ ...prev, image_key_path: path }));
  };

  const setRotationAnglesDataPath = (path: string) => {
    setParameters(prev => ({
      ...prev,
      rotation_angles: { data_path: path },
    }));
  };

  const setUserDefinedRotationAngles = (
    start: number,
    stop: number,
    total: number
  ) => {
    setParameters(prev => ({
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
    setParameters(prev => ({
      ...prev,
      darks: { file, data_path: dataPath },
    }));
  };

  const setFlats = (file: string, dataPath: string) => {
    setParameters(prev => ({
      ...prev,
      flats: { file, data_path: dataPath },
    }));
  };

  const removeDarksAndFlats = () => {
    setParameters(prev => {
      const { darks, flats, ...rest } = prev;
      return rest;
    });
  };

  const removePreview = () => {
    setParameters(prev => {
      const { preview, ...rest } = prev;
      return rest;
    });
  };

  const setDetectorX = (preview: PreviewType | null) => {
    setParameters(prev => {
      const updatedPreview = { ...prev.preview };

      if (preview) {
        updatedPreview.detector_x = preview; // Add/update detector_x
      } else {
        delete updatedPreview.detector_x; // Remove detector_x entirely
      }

      // Remove the preview object entirely if it's empty
      const hasDetectors = Object.keys(updatedPreview).length > 0;
      return {
        ...prev,
        preview: hasDetectors ? updatedPreview : undefined,
      };
    });
  };

  const setDetectorY = (preview: PreviewType | null) => {
    setParameters(prev => {
      const updatedPreview = { ...prev.preview };

      if (preview) {
        updatedPreview.detector_y = preview; // Add/update detector_y
      } else {
        delete updatedPreview.detector_y; // Remove detector_y entirely
      }

      // Remove the preview object entirely if it's empty
      const hasDetectors = Object.keys(updatedPreview).length > 0;
      return {
        ...prev,
        preview: hasDetectors ? updatedPreview : undefined,
      };
    });
  };

  // Add this function to validate the loader context
  const isContextValid = (): boolean => {
    // Check if data_path exists and is not empty
    const hasDataPath = parameters.data_path.trim() !== '';

    // Check if rotation_angles is properly set
    const hasRotationAnglesPath =
      typeof parameters.rotation_angles === 'object' &&
      parameters.rotation_angles?.data_path &&
      parameters.rotation_angles.data_path.trim() !== '';

    const hasUserDefinedAngles =
      typeof parameters.rotation_angles === 'object' &&
      parameters.rotation_angles?.user_defined &&
      parameters.rotation_angles.user_defined.start_angle !== null &&
      parameters.rotation_angles.user_defined.stop_angle !== null &&
      parameters.rotation_angles.user_defined.angles_total !== null;

    const hasRotationAngles = hasRotationAnglesPath || hasUserDefinedAngles;

    // Check if either image_key_path OR (darks AND flats) are set
    const hasImageKeyPath =
      parameters.image_key_path !== undefined &&
      parameters.image_key_path.trim() !== '';

    const hasDarks =
      parameters.darks !== undefined &&
      parameters.darks !== null &&
      parameters.darks.file !== undefined &&
      parameters.darks.file.trim() !== '' &&
      parameters.darks.data_path !== undefined &&
      parameters.darks.data_path.trim() !== '';

    const hasFlats =
      parameters.flats !== undefined &&
      parameters.flats !== null &&
      parameters.flats.file !== undefined &&
      parameters.flats.file.trim() !== '' &&
      parameters.flats.data_path !== undefined &&
      parameters.flats.data_path.trim() !== '';

    const hasDarksAndFlats = hasDarks && hasFlats;

    // Return true only if all minimum requirements are met
    return (
      !!hasDataPath &&
      !!hasRotationAngles &&
      (!!hasImageKeyPath || !!hasDarksAndFlats)
    );
  };

  return (
    <LoaderContext.Provider
      value={{
        method: 'standard_tomo',
        module_path: 'httomo.data.hdf.loaders',
        parameters,
        setDataPath,
        setImageKeyPath,
        setRotationAnglesDataPath,
        setUserDefinedRotationAngles,
        setDarks,
        setFlats,
        removeDarksAndFlats,
        setDetectorX, // Updated from setPreviewX to setDetectorX
        setDetectorY, // Updated from setPreviewY to setDetectorY
        removePreview,
        isContextValid, // Add the validation function to the context
      }}
    >
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
};
