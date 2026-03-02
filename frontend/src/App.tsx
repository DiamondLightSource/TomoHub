import { Route, BrowserRouter, Routes } from "react-router-dom";
import { default as TomographyApp } from "../tomography/src/App";
import Layout from "./Layout";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="tomography/*" element={<TomographyApp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
