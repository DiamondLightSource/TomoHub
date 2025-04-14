import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Layout from "./components/Layout";
import Centerfinding from "./pages/CenterFinding.tsx";
import useDeployment from "./hooks/useDeployment";
import Run from "./pages/Run.tsx";
import Methods from "./pages/Methods.tsx";
import FullPipelines from "./pages/FullPipelines.tsx";

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

const App: React.FC = () => {
  return (
    <Router>
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
    </Router>
  );
};

export default App;

