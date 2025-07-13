import Keycloak from 'keycloak-js';

// Define Keycloak configuration
const keycloakConfig = {
  url: "https://authn.diamond.ac.uk/", 
  realm: "master",
  clientId: "tomohub"
};

// Create Keycloak instance
const keycloak = new Keycloak(keycloakConfig); 

// Add basic event handlers for logging
keycloak.onAuthSuccess = () => {
  console.log('Auth success - token:', keycloak.token);
};

keycloak.onAuthError = (error) => {
  console.error('Auth error:', error);
};


export default keycloak;