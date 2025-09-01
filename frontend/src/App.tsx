import React, { useState, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/pages/Home";
import Layout from "./components/common/Layout";
import Methods from "./components/pages/Methods";
import FullPipelines from "./components/pages/FullPipelines";
import Submission from "./components/workflows/Submission";
import { Visit } from "workflows-lib";

const App: React.FC = () => {
  const [userVisit, setUserVisit] = useState<Visit>();
  return (
    <Router>
      <Suspense fallback={<div>Loading workflow...</div>}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="methods" element={<Methods />} />
            <Route path="fullpipelines" element={<FullPipelines />} />
            <Route
              path="workflow-run"
              element={
                <Submission
                  workflowName="httomo-gpu-job"
                  setVisit={setUserVisit}
                />
              }
            />
            <Route
              path="workflow-cor"
              element={
                <Submission
                  workflowName="httomo-cor-sweep"
                  setVisit={setUserVisit}
                />
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
