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

// Add initialization options for Keycloak
const initOptions = {
  checkLoginIframe: false,
  onLoad: 'login-required',
  redirectUri: window.location.origin 
}

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
  
  // For non-local deployments, wrap with Keycloak
  return (
    <ReactKeycloakProvider 
      authClient={keycloak}
      initOptions={initOptions}
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
