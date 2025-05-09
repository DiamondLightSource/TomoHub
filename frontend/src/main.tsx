import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { CssBaseline } from '@mui/material'
import {
  ThemeProvider,
  DiamondTheme
} from "@diamondlightsource/sci-react-ui";
import keycloak from "./keycloak";

// Initialize once with minimal options and store the promise
export const kcinit = keycloak.init({
  onLoad: "check-sso",
  checkLoginIframe: false,
  enableLogging: true // Enable detailed logging
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={DiamondTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
)
