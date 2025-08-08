import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Layout from './components/Layout';
import Methods from './pages/Methods.tsx';
import FullPipelines from './pages/FullPipelines.tsx';
import Submission from './workflow/Submission.tsx';
import { Visit } from 'workflows-lib';

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
