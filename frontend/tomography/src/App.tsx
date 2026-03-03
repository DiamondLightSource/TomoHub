import React, { useState, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./routes/HomePage";
import Layout from "./components/common/Layout";
import MethodsPage from "./routes/MethodsPage";
import FullPipelinesPage from "./routes/FullPipelinesPage";
import Submission from "./components/workflows/Submission";
import CropPage from "./routes/CropPage";
import { Visit } from "@diamondlightsource/sci-react-ui";

const App: React.FC = () => {
  const [userVisit, setUserVisit] = useState<Visit>();
  return (
    <Suspense fallback={<div>Loading workflow...</div>}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="methods" element={<MethodsPage />} />
          <Route path="fullpipelines" element={<FullPipelinesPage />} />
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
          <Route path="crop" element={<CropPage setVisit={setUserVisit} />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
