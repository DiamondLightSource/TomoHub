import React, { useEffect, useState } from 'react';
import keycloak from '../keycloak';
import useDeployment from '../hooks/useDeployment';

const AuthStatus: React.FC = () => {
  const { isLocal } = useDeployment();
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');

  // Add a state to track auth status changes
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    console.log("AuthStatus: Checking authentication status");
    console.log("AuthStatus: keycloak.authenticated =", keycloak.authenticated);
    console.log("AuthStatus: keycloak.token exists =", !!keycloak.token);
    
    if (isLocal) {
      setUsername('Local Development User');
      return;
    }

    if (keycloak.authenticated && keycloak.token) {
      console.log("AuthStatus: Setting token:", keycloak.token.substring(0, 10) + "...");
      setToken(keycloak.token);
      
      // Extract username from token if available
      if (keycloak.tokenParsed) {
        setUsername(keycloak.tokenParsed.preferred_username || 'Unknown User');
      }
    }
    
    setAuthChecked(true);
  }, [isLocal, keycloak.authenticated]); // Also check when authentication changes

  // Add an interval to periodically check auth status
  useEffect(() => {
    if (isLocal) return;
    
    const checkInterval = setInterval(() => {
      console.log("Periodic auth check:", keycloak.authenticated, !!keycloak.token);
      
      if (keycloak.authenticated && keycloak.token && !token) {
        console.log("Auth detected on interval check");
        setToken(keycloak.token);
        if (keycloak.tokenParsed) {
          setUsername(keycloak.tokenParsed.preferred_username || 'Unknown User');
        }
      }
    }, 1000);
    
    return () => clearInterval(checkInterval);
  }, [token, isLocal]);

  if (isLocal) {
    return (
      <div className="auth-status">
        <p>🔓 Local Development Mode - Authentication bypassed</p>
      </div>
    );
  }

  return (
    <div className="auth-status">
      {token ? (
        <>
          <p>✅ Authenticated as: {username}</p>
          <p>Token: {token.substring(0, 20)}...{token.substring(token.length - 10)}</p>
          <button onClick={() => keycloak.logout()}>Logout</button>
        </>
      ) : (
        <p>⚠️ Not authenticated (Checks: {authChecked ? 'Complete' : 'Pending'})</p>
      )}
    </div>
  );
};

export default AuthStatus;