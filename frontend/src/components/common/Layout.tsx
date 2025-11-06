import React from "react";
import { Outlet } from "react-router-dom";
import Pipeline from "../pipeline/Pipeline";
import { MethodsProvider } from "../../contexts/MethodsContext";
import { SweepProvider } from "../../contexts/SweepContext";
import { LoaderProvider } from "../../contexts/LoaderContext";
import { CenterProvider } from "../../contexts/CenterContext";
import { Box, CssBaseline, Paper, styled } from "@mui/material";
import Header from "./Header";
import { Footer, Navbar, User } from "@diamondlightsource/sci-react-ui";
import keycloak from "../../keycloak";
import CropProvider from "../../contexts/CropContext";

const LeftSection = styled(Box)({
  display: "flex",
  flexDirection: "column",
});

const RightSection = styled(Paper)({
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  boxShadow: "none",
});

const AppContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  alignItems: "center",
  backgroundColor: "#fff",
  overflowX: "hidden",
});

const MainContainer = styled(Box)({
  display: "grid",
  gridTemplateColumns: "900px auto",
  gap: "30px",
  padding: "20px",
  flex: 1,
  alignItems: "flex-start",
  margin: "30px auto",
});

const Layout = () => {
  // Determine the username to display
  let username = "Guest User";

  if (keycloak.authenticated && keycloak.tokenParsed) {
    username =
      keycloak.tokenParsed.preferred_username ||
      keycloak.tokenParsed.name ||
      keycloak.tokenParsed.email ||
      "Authenticated User";
  }

  // Handle logout
  const handleLogout = () => {
    if (keycloak.authenticated) {
      keycloak.logout();
    }
  };

  return (
    <>
      <LoaderProvider>
        <SweepProvider>
          <MethodsProvider>
            <CenterProvider>
              <CropProvider>
                <CssBaseline />
                <AppContainer>
                  <Navbar
                    logo="theme"
                    rightSlot={
                      <User
                        color="white"
                        onLogout={handleLogout}
                        user={{
                          fedid: username,
                        }}
                      />
                    }
                  ></Navbar>
                  <Header />
                  <MainContainer>
                    <LeftSection as="section" className="left-section">
                      <Outlet />
                    </LeftSection>
                    <RightSection as="section" className="right-section">
                      <Pipeline />
                    </RightSection>
                  </MainContainer>
                  <Footer
                    copyright=""
                    logo="theme"
                    style={{
                      width: "100%",
                      backgroundColor: "#4C5266",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  ></Footer>
                </AppContainer>
              </CropProvider>
            </CenterProvider>
          </MethodsProvider>
        </SweepProvider>
      </LoaderProvider>
    </>
  );
};

export default Layout;
