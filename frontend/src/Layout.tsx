import React from "react";
import { Outlet, NavLink as RouterNavLink } from "react-router-dom";
import { Box, CssBaseline, styled } from "@mui/material";
import {
  Footer,
  Navbar,
  NavLink,
  NavLinks,
  User,
} from "@diamondlightsource/sci-react-ui";
import keycloak from "./keycloak";

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
      <CssBaseline />
      <AppContainer>
        <Navbar
          logo="theme"
          leftSlot={
            <NavLinks>
              <NavLink to="/" linkComponent={RouterNavLink}>
                Home
              </NavLink>
              <NavLink to="/tomography" linkComponent={RouterNavLink}>
                Tomography
              </NavLink>
            </NavLinks>
          }
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
        <MainContainer>
          <Outlet />
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
    </>
  );
};

export default Layout;
