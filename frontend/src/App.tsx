import React from "react";
import "./App.css";
import Header from "./components/Header";
import Visualiser from "./components/Visualiser";
import Footer from "./components/Footer";
import { MethodsProvider } from "./contexts/MethodsContext";
import YMLG from "./components/YamlGenerator";
import {AccordionExpansionProvider} from "./contexts/AccordionExpansionContext";
import { LoaderProvider } from "./contexts/LoaderContext";
import Dropdowns from "./components/Dropdowns";
import { SweepProvider } from "./contexts/SweepContext";

const App:React.FC = () => {
return (
  <LoaderProvider>
    <SweepProvider>
  <AccordionExpansionProvider>
    <MethodsProvider>
      <div className="app">
        <div className="container">
          <section className="left-section">
            <Header />
            <section className="dropdowns">
              <Dropdowns/>
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
      </SweepProvider>
    </LoaderProvider>
  );
}

export default App;
