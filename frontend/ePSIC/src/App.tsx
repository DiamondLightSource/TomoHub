import { WorkflowForm } from "./components/workflows/WorkflowForm";
import {
  ResourceForm,
  ResourceParameters,
} from "../../shared_components/ResourceForm";
import { useState } from "react";

const initialResourceParams: ResourceParameters = {
  cpus: "1",
  gpus: null,
  nprocs: "8",
  memory: "16Gi",
};

export const App: React.FC = () => {
  const [resourceParams, setResourceParams] = useState<ResourceParameters>(
    initialResourceParams
  );

  return (
    <>
      <WorkflowForm />
      <ResourceForm
        params={resourceParams}
        setParams={setResourceParams}
        showGpu={false}
      />
    </>
  );
};
