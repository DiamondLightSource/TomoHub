import React from "react";
import "./App.css";
import Dropdown from "./components/Dropdown";
import Header from "./components/Header";
import Visualiser from "./components/Visualiser";
import Footer from "./components/Footer";
import { MethodsProvider } from "./MethodsContext";
import YMLG from "./components/YamlGenerator";

const App:React.FC = () => {
return (
    <MethodsProvider>
      <div className="app">
        <div className="container">
          <section className="left-section">
            <Header />
            <section className="dropdowns">
              <Dropdown name="Input/Output" />
              <Dropdown name="Normalisation" />
              <Dropdown name="Center of Rotation" />
              <Dropdown name="Reconstruction" />
            </section>
            <YMLG />
          </section>
          <section className="right-section">
            <Visualiser />
          </section>
        </div>
        <Footer />
      </div>
    </MethodsProvider>
  );
}

export default App;
