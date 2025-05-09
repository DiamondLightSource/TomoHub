import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { CssBaseline } from '@mui/material'
import {
  ThemeProvider,
  DiamondTheme
} from "@diamondlightsource/sci-react-ui";
import keycloak from "./keycloak";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import useDeployment from "./hooks/useDeployment";


// This will be accessible throughout the app as a global initialization promise
// We'll reference it in the App.tsx for authentication checks
export const kcinit = keycloak.init({
  onLoad: "login-required",
  checkLoginIframe: false
})
  .then(
    authenticated => {
      if (authenticated) {
        console.info("Authenticated successfully");
        // Set up token expiration handler
        keycloak.onTokenExpired = () => {
          console.log("Token expired");
          keycloak.updateToken(30).then(refreshed => {
            console.log("Token refreshed:", refreshed);
          }).catch(err => {
            console.error("Failed to refresh token", err);
          });
        };
        return true;
      } else {
        console.warn("Not authenticated");
        return false;
      }
    },
    error => {
      console.error("Authentication failed", error);
      return false;
    }
  );

// Create a wrapper component that conditionally uses Keycloak
const AppWrapper = () => {
  const { isLocal, isLoading } = useDeployment();
  
  if (isLoading) {
    return <div>Loading deployment info...</div>;
  }
  
  // For local development, don't use Keycloak
  if (isLocal) {
    return <App />;
  }
  
  // For non-local deployments, provide Keycloak context
  // but the actual auth is already handled by kcinit
  return (
    <ReactKeycloakProvider 
      authClient={keycloak}
    >
      <App />
    </ReactKeycloakProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={DiamondTheme}>
      <CssBaseline />
      <AppWrapper />
    </ThemeProvider>
  </StrictMode>
)
