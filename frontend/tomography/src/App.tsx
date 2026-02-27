import React, { useState, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./components/pages/Home";
import Layout from "./components/common/Layout";
import Methods from "./components/pages/Methods";
import FullPipelines from "./components/pages/FullPipelines";
import Submission from "./components/workflows/Submission";
import Crop from "./components/pages/Crop";
import { Visit } from "@diamondlightsource/sci-react-ui";

export const App: React.FC = () => {
  const [userVisit, setUserVisit] = useState<Visit>();
  return (
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
          <Route path="crop" element={<Crop setVisit={setUserVisit} />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
