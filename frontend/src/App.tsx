import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Layout from "./components/Layout";
import Centerfinding from "./pages/CenterFinding.tsx";
import useDeployment from "./hooks/useDeployment";
import Run from "./pages/Run.tsx";
import Methods from "./pages/Methods.tsx";
import FullPipelines from "./pages/FullPipelines.tsx";
import { useKeycloak } from "@react-keycloak/web";

// Protected route component that only renders in local mode
const LocalOnlyRoute = ({ children }: { children: JSX.Element }) => {
  const { isLocal, isLoading } = useDeployment();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isLocal) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Add a new protected route component that requires authentication
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { keycloak } = useKeycloak();
  
  if (!keycloak.authenticated) {
    return <div>Please login to access this application</div>;
    // Alternatively, you can force login with:
    // keycloak.login();
    // return <div>Redirecting to login...</div>;
  }
  
  return children;
};

const App: React.FC = () => {
  const { keycloak, initialized } = useKeycloak();
  
  useEffect(() => {
    // Optional: You can automatically redirect to login when the app loads
    if (initialized && !keycloak.authenticated) {
      keycloak.login();
    }
  }, [initialized, keycloak]);
  
  if (!initialized) {
    return <div>Loading...</div>;
  }
  
  return (
    <Router>
      <ProtectedRoute>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="methods" element={<Methods/>}></Route>
            <Route 
              path="corfinder" 
              element={
                <LocalOnlyRoute>
                  <Centerfinding />
                </LocalOnlyRoute>
              } 
            />
            <Route path="fullpipelines" element={<FullPipelines/>}/>
            <Route 
              path="run" 
              element={
                <LocalOnlyRoute>
                  <Run />
                </LocalOnlyRoute>
              } 
            />
          </Route>
        </Routes>
      </ProtectedRoute>
    </Router>
  );
};

export default App;

