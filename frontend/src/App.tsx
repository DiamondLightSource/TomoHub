import { Route, BrowserRouter, Routes } from "react-router-dom";
import { App as TomographyApp } from "../tomography/src/App";
import { App as I14App } from "../i14/src/App";
import { Dashboard } from "../dashboard/src/App";
import { Layout } from "./Layout";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* <Route path="dashboard" element={<DashBoard />} /> */}
          <Route index element={<Dashboard />} />
          <Route path="tomography/*" element={<TomographyApp />} />
          <Route path="i14/*" element={<I14App />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
