import React from "react";
import { Outlet } from "react-router-dom";
import Pipeline from "./Pipeline";
import { MethodsProvider } from "../contexts/MethodsContext";
import { SweepProvider } from "../contexts/SweepContext";
import { AccordionExpansionProvider } from "../contexts/AccordionExpansionContext";
import { LoaderProvider } from "../contexts/LoaderContext";
import { Box, CssBaseline, Paper, styled } from "@mui/material";
import Footer from "./Footer";
import Header from "./Header";

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
    padding: "20px", // Generous padding
    flex: 1, // Take up available space
    alignItems: "flex-start",
    margin:"30px auto",
  });


const Layout = () => {
    return (
        <>
        <LoaderProvider>
        <SweepProvider>
          <AccordionExpansionProvider>
            <MethodsProvider>
              <CssBaseline />
              <AppContainer>
                <MainContainer>
                <LeftSection component="section" className="left-section">
                <Header />
                <Outlet/>
                </LeftSection>
                  <RightSection component="section" className="right-section">
                    <Pipeline />
                  </RightSection>
                </MainContainer>
                <Footer />
              </AppContainer>
            </MethodsProvider>
          </AccordionExpansionProvider>
        </SweepProvider>
      </LoaderProvider>
        </>
    )
}

export default Layout;