import React, { useEffect, useState } from 'react';
import keycloak from '../keycloak';
import useDeployment from '../hooks/useDeployment';

const AuthStatus: React.FC = () => {
  const { isLocal } = useDeployment();
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    if (isLocal) {
      setUsername('Local Development User');
      return;
    }

    if (keycloak.authenticated && keycloak.token) {
      setToken(keycloak.token);
      
      // Extract username from token if available
      if (keycloak.tokenParsed) {
        setUsername(keycloak.tokenParsed.preferred_username || 'Unknown User');
      }
    }
  }, [isLocal]);

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
        <p>⚠️ Not authenticated</p>
      )}
    </div>
  );
};

export default AuthStatus;