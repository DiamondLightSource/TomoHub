import { useState, useEffect } from 'react';
import { systemService } from '../api/services';

interface UseDeploymentReturn {
  isLocal: boolean;
  isLoading: boolean;
  error: string | null;
}

export default function useDeployment(): UseDeploymentReturn {
  const [isLocal, setIsLocal] = useState<boolean>(true); // Default to local for developer experience
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeploymentInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await systemService.getDeploymentMode();
        setIsLocal(data.mode === 'local');
      } catch (err) {
        console.error('Failed to fetch deployment information', err);
        setError('Failed to determine deployment mode');
        
        // // Set a safe fallback - assume k8s (not local) on error
        // setIsLocal(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDeploymentInfo();
  }, []);

  return {
    isLocal,
    isLoading,
    error,
  };
}