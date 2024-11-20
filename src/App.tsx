import React from "react";
import "./App.css";
import Dropdown from "./components/Dropdown";
import Header from "./components/Header";
import Submit from "./components/Submit";
import Steps from "./components/Visualiser";
import Footer from "./components/Footer";
import { MethodsProvider } from "./MethodsContext";

const App:React.FC = () => {
return (
    <MethodsProvider>
      <div className="app">
        <div className="container">
          <section className="left-section">
            <Header />
            <section className="dropdowns">
              <Dropdown name="Data Loader" />
              <Dropdown name="Normalisation" />
              <Dropdown name="Center of Rotation" />
              <Dropdown name="Reconstruction" />
              <Dropdown name="Save" />
            </section>
            <Submit />
          </section>
          <section className="right-section">
            <Steps />
          </section>
        </div>
        <Footer />
      </div>
    </MethodsProvider>
  );
}

export default App;
