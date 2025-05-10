import Keycloak from 'keycloak-js';

// Get configuration from environment variables or use defaults
const keycloakConfig = {
  url: "https://authn.diamond.ac.uk/",
  realm:  "master",
  clientId: "tomohub",
};

// Create and export the Keycloak instance
const keycloak = new Keycloak(keycloakConfig);

// Add event listeners for debugging (optional)
keycloak.onAuthSuccess = () => {
  console.log('Auth success');
};

keycloak.onAuthError = (error) => {
  console.error('Auth error:', error);
};

keycloak.onTokenExpired = () => {
  console.log('Token expired, attempting to refresh');
  keycloak.updateToken(30).catch(() => {
    console.error('Token refresh failed');
  });
};

export default keycloak;

// Helper functions that can be used elsewhere in your app
export const getAuthHeaders = () => {
  if (keycloak?.token) {
    return {
      Authorization: `Bearer ${keycloak.token}`,
    };
  }
  return {};
};

export const getUserInfo = () => {
  return {
    isAuthenticated: !!keycloak?.authenticated,
    username: keycloak?.tokenParsed?.preferred_username || '',
    roles: keycloak?.tokenParsed?.realm_access?.roles || [],
    token: keycloak?.token || '',
  };
};

// Function to force login - can be used from anywhere in your app
export const forceLogin = (redirectPath = window.location.pathname) => {
  const redirectUri = `${window.location.origin}${redirectPath}`;
  keycloak.login({ redirectUri });
};

// Function to log out
export const logout = () => {
  keycloak.logout({ redirectUri: window.location.origin });
};