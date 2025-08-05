import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { CssBaseline } from '@mui/material'
import {
  ThemeProvider,
  DiamondTheme
} from "@diamondlightsource/sci-react-ui";
import { RelayEnvironmentProvider } from 'react-relay';
import { RelayEnvironment } from './RelayEnviornment';
import keycloak from './keycloak';

// Wait for Keycloak before rendering
keycloak.init({ onLoad: "login-required" }).then(authenticated => {
  if (authenticated) {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <ThemeProvider theme={DiamondTheme}>
          <CssBaseline />
          <RelayEnvironmentProvider environment={RelayEnvironment}>
            <App />
          </RelayEnvironmentProvider>
        </ThemeProvider>
      </StrictMode>
    );
  } else {
    window.location.reload();
  }
}); 
