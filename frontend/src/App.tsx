import React from "react";
import { Box, CssBaseline, Paper, styled } from "@mui/material";
import Header from "./components/Header";
import Visualiser from "./components/Visualiser";
import Footer from "./components/Footer";
import { MethodsProvider } from "./contexts/MethodsContext";
import YMLG from "./components/YamlGenerator";
import { AccordionExpansionProvider } from "./contexts/AccordionExpansionContext";
import { LoaderProvider } from "./contexts/LoaderContext";
import Dropdowns from "./components/Dropdowns";
import { SweepProvider } from "./contexts/SweepContext";

const AppContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  alignItems: "center", // Center the app horizontally
  backgroundColor: "#fff", // Optional: Add a background color
  overflowX:"hidden"
});

const MainContainer = styled(Box)({
  display: "grid",
  gridTemplateColumns: "1.3fr 0.3fr", // Two columns
  gap: "30px", // Space between columns
  padding: "40px", // Generous padding
  flex: 1, // Take up available space
  alignItems: "flex-start",
  margin:"auto"
});

const LeftSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
});

const RightSection = styled(Paper)({
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  boxShadow:"none",
});

const App: React.FC = () => {
  return (
    <LoaderProvider>
      <SweepProvider>
        <AccordionExpansionProvider>
          <MethodsProvider>
            <CssBaseline />
            <AppContainer>
              <MainContainer>
                <LeftSection component="section" className="left-section">
                  <Header />
                  <Box component="section" className="dropdowns">
                    <Dropdowns />
                  </Box>
                  <YMLG />
                </LeftSection>
                <RightSection component="section" className="right-section">
                  <Visualiser />
                </RightSection>
              </MainContainer>
              <Footer />
            </AppContainer>
          </MethodsProvider>
        </AccordionExpansionProvider>
      </SweepProvider>
    </LoaderProvider>
  );
};

export default App;