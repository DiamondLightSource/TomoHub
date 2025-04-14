import React from "react";
import { Outlet } from "react-router-dom";
import Pipeline from "./Pipeline";
import { MethodsProvider } from "../contexts/MethodsContext";
import { SweepProvider } from "../contexts/SweepContext";
import { AccordionExpansionProvider } from "../contexts/AccordionExpansionContext";
import { LoaderProvider } from "../contexts/LoaderContext";
import { CenterProvider } from "../contexts/CenterContext"; 
import { Box, CssBaseline, Paper, styled } from "@mui/material";
import Header from "./Header";
import {Footer,Navbar} from "@diamondlightsource/sci-react-ui";
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
              <CenterProvider> 
                <CssBaseline />
                <AppContainer>
                <Navbar logo="theme" >
                </Navbar>
                <Header />
                  <MainContainer>
                    <LeftSection as="section" className="left-section">

                      <Outlet/>
                    </LeftSection>
                    <RightSection as="section" className="right-section">
                      <Pipeline />
                    </RightSection>
                  </MainContainer>
                  <Footer 
                        copyright=""
                        logo="theme"
                        style={{width:"100%",backgroundColor:"#4C5266",display:"flex",justifyContent:"center"}}
                  >
                    </Footer>
                </AppContainer>
              </CenterProvider>
            </MethodsProvider>
          </AccordionExpansionProvider>
        </SweepProvider>
      </LoaderProvider>
        </>
    )
}

export default Layout;