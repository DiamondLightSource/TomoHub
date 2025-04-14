import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { CssBaseline } from '@mui/material'
import {
	ThemeProvider,
	DiamondTheme
} from "@diamondlightsource/sci-react-ui";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={DiamondTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
