import React,{useState} from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Layout from "./components/Layout";
import Centerfinding from "./pages/CenterFinding.tsx";
import Run from "./pages/Run.tsx";
import Methods from "./pages/Methods.tsx";
import FullPipelines from "./pages/FullPipelines.tsx";
import useDeployment from "./hooks/useDeployment";
import Submission from "./workflow/Submission.tsx";
import {Visit} from "workflows-lib"

const App: React.FC = () => {
  const { isLocal, isLoading: deploymentLoading } = useDeployment();
  const [workflowName,setWorkflowName] = useState("httomo-gpu-job");
  const [userVisit, setUserVisit] = useState<Visit>();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="methods" element={<Methods />} />
          <Route path="corfinder" element={isLocal ? <Centerfinding /> : <div>Local only</div>} />
          <Route path="fullpipelines" element={<FullPipelines />} />
          <Route path="run" element={isLocal ? <Run /> : <div>Local only</div>} />
          <Route 
            path="workflow-cor"
            element={
              <Submission
                workflowName={workflowName}
                setVisit={setUserVisit}
              />
            }
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;