import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { CssBaseline } from '@mui/material'
import {
  ThemeProvider,
  DiamondTheme
} from "@diamondlightsource/sci-react-ui";
import keycloak from "./keycloak";
import useDeployment from "./hooks/useDeployment";

// Initialize once with proper parameters
export const kcinit = keycloak.init({
  onLoad: "check-sso", // Changed from login-required to allow the app to load first
  checkLoginIframe: false,
  silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  pkceMethod: 'S256' // More secure PKCE method
})
.then(
  authenticated => {
    if (authenticated) {
      console.info("Authenticated successfully");
      console.log("Token present:", keycloak.token ? "Yes" : "No");
      
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
  
  // For both local and non-local, just render App - don't use the ReactKeycloakProvider
  return <App />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={DiamondTheme}>
      <CssBaseline />
      <AppWrapper />
    </ThemeProvider>
  </StrictMode>
)
