import { Outlet } from "react-router-dom";
import Pipeline from "../pipeline/Pipeline";
import { MethodsProvider } from "../../contexts/MethodsContext";
import { SweepProvider } from "../../contexts/SweepContext";
import { LoaderProvider } from "../../contexts/LoaderContext";
import { CenterProvider } from "../../contexts/CenterContext";
import { Box, CssBaseline, Paper, styled } from "@mui/material";
import Header from "./Header";
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
  // gridTemplateColumns: "900px auto", //  commented out due to it messing with the displaying
  // of the Pipeline component that is fixed on the RHS of every page
  gap: "30px",
  padding: "20px",
  flex: 1,
  alignItems: "flex-start",
  margin: "30px auto",
});

const Layout = () => {
  return (
    <>
      <LoaderProvider>
        <SweepProvider>
          <MethodsProvider>
            <CenterProvider>
              <CropProvider>
                <CssBaseline />
                <AppContainer>
                  <Header />
                  <MainContainer>
                    <LeftSection as="section" className="left-section">
                      <Outlet />
                    </LeftSection>
                    {/* <RightSection as="section" className="right-section"> */}
                    {/*   <Pipeline /> */}
                    {/* </RightSection> */}
                  </MainContainer>
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
