import React,{ StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { CssBaseline } from '@mui/material'
import {
  ThemeProvider,
  DiamondTheme
} from "@diamondlightsource/sci-react-ui";
import keycloak from "./keycloak";
import { ReactKeycloakProvider } from "@react-keycloak/web";

// Add initialization options for Keycloak
const initOptions = {
  checkLoginIframe: false,
  onLoad: 'check-sso'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={DiamondTheme}>
      <CssBaseline />
      <ReactKeycloakProvider 
        authClient={keycloak}
        initOptions={initOptions}
      >
        <App />
      </ReactKeycloakProvider>
    </ThemeProvider>
  </StrictMode>
)

