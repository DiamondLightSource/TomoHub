import React from "react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom"
import Home from "./pages/Home.tsx"
import Layout from "./components/Layout";
import Centerfinding from "./pages/CenterFinding.tsx"

const App: React.FC = () => {
  return (

    <Router>
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route index element={<Home/>}/>
          <Route path="corfinder" element={<Centerfinding/>}/>
        </Route>

      </Routes>
    </Router>

  );
};

export default App;