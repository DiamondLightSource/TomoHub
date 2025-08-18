import { useLoader } from '../contexts/LoaderContext';
import { useMethods } from '../contexts/MethodsContext';

export const useHTTOMOConfig = () => {
  const {
    method,
    module_path,
    parameters: loaderParams,
    isContextValid,
    setDataPath,
    setImageKeyPath,
    setRotationAnglesDataPath,
  } = useLoader();
  const { methods } = useMethods();

  const processDataForJson = (data: any): any => {
    // Create a deep copy to avoid modifying the original
    const processedData = JSON.parse(JSON.stringify(data));

    // Helper function to recursively process objects
    const processObject = (obj: any): void => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (Array.isArray(obj[key])) {
            processArray(obj[key]);
          } else {
            processObject(obj[key]);
          }
        } else if (
          typeof obj[key] === 'string' &&
          obj[key].includes('${') &&
          !obj[key].includes('${{')
        ) {
          // Replace ${something} with ${{something}}
          obj[key] = obj[key].replace(/\$\{([^}]+)\}/g, '${{$1}}');
        }
      }
    };

    // Helper function to process arrays
    const processArray = (arr: any[]): void => {
      for (let i = 0; i < arr.length; i++) {
        if (typeof arr[i] === 'object' && arr[i] !== null) {
          if (Array.isArray(arr[i])) {
            processArray(arr[i]);
          } else {
            processObject(arr[i]);
          }
        } else if (
          typeof arr[i] === 'string' &&
          arr[i].includes('${') &&
          !arr[i].includes('${{')
        ) {
          // Replace ${something} with ${{something}}
          arr[i] = arr[i].replace(/\$\{([^}]+)\}/g, '${{$1}}');
        }
      }
    };

    // Start processing
    if (Array.isArray(processedData)) {
      processArray(processedData);
    } else if (typeof processedData === 'object' && processedData !== null) {
      processObject(processedData);
    }

    return processedData;
  };

  const generateHTTOMOConfig = () => {
    let updatedParameters = { ...loaderParams };

    // Auto-fill validation logic
    if (!isContextValid()) {
      if (
        !updatedParameters.data_path ||
        updatedParameters.data_path.trim() === ''
      ) {
        updatedParameters.data_path = 'auto';
        setDataPath('auto');
      }

      if (
        typeof updatedParameters.rotation_angles === 'string' ||
        !updatedParameters.rotation_angles ||
        !updatedParameters.rotation_angles.data_path ||
        updatedParameters.rotation_angles.data_path.trim() === ''
      ) {
        // Fix: Set the data_path property instead of the entire rotation_angles object
        updatedParameters.rotation_angles = { data_path: 'auto' };
        setRotationAnglesDataPath('auto');
      }

      const hasDarks =
        updatedParameters.darks &&
        updatedParameters.darks.file &&
        updatedParameters.darks.file.trim() !== '';
      const hasFlats =
        updatedParameters.flats &&
        updatedParameters.flats.file &&
        updatedParameters.flats.file.trim() !== '';

      if (hasDarks && hasFlats) {
        delete updatedParameters.image_key_path;
      } else if (
        !updatedParameters.image_key_path ||
        updatedParameters.image_key_path.trim() === ''
      ) {
        updatedParameters.image_key_path = 'auto';
        setImageKeyPath('auto');
      }
    }

    // Set preview configuration
    updatedParameters.preview = {
      detector_x: { start: null, stop: null },
      detector_y: { start: null, stop: null },
    };

    const loaderContextObject = {
      method,
      module_path,
      parameters: updatedParameters,
    };

    // Transform methods
    const transformedMethods = methods.reduce((acc: any[], method) => {
      const transformedMethod = {
        method: method.method_name,
        module_path: method.method_module,
        parameters: { ...method.parameters },
      };

      if (method.method_name === 'rescale_to_int') {
        acc.push({
          method: 'calculate_stats',
          module_path: 'httomo.methods',
          parameters: {},
          id: 'statistics',
          side_outputs: { glob_stats: 'glob_stats' },
        });
      } else {
        acc.push(transformedMethod);
      }
      return acc;
    }, []);

    return processDataForJson([loaderContextObject, ...transformedMethods]);
  };

  return {
    generateHTTOMOConfig,
    isContextValid,
    hasLoaderData: isContextValid(),
    hasMethodsData: methods && methods.length > 0,
  };
};