import React from "react";
import "./App.css";
import Dropdown from "./components/Dropdown";
import Header from "./components/Header";
import Visualiser from "./components/Visualiser";
import Footer from "./components/Footer";
import { MethodsProvider } from "./MethodsContext";
import YMLG from "./components/YamlGenerator";
import {AccordionExpansionProvider} from "./AccordionExpansionContext";

const App:React.FC = () => {
return (
  <AccordionExpansionProvider>
    <MethodsProvider>
      <div className="app">
        <div className="container">
          <section className="left-section">
            <Header />
            <section className="dropdowns">
              <Dropdown name="Image Saving" />
              <Dropdown name="Segmentation" />
              <Dropdown name="Morphological Operations"/>
              <Dropdown name="Normalisation" />
              <Dropdown name="Phase Retrieval" />
              <Dropdown name="Stripe Removal" />
              <Dropdown name="Distortion Correction" />
              <Dropdown name="Rotation Center Finding"/>
              <Dropdown name="Reconstruction"/>
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
      </AccordionExpansionProvider>
    
  );
}

export default App;
