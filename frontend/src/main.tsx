import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { CssBaseline } from "@mui/material";
import { ThemeProvider, DiamondTheme } from "@diamondlightsource/sci-react-ui";
import { RelayEnvironmentProvider } from "react-relay";
import { getRelayEnvironment } from "./RelayEnviornment";

getRelayEnvironment().then((environment) => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ThemeProvider theme={DiamondTheme} defaultMode="light">
        <CssBaseline />
        <RelayEnvironmentProvider environment={environment}>
          <App />
        </RelayEnvironmentProvider>
      </ThemeProvider>
    </StrictMode>
  );
});
