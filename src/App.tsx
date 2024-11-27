import React from "react";
import "./App.css";
import Dropdown from "./components/Dropdown";
import Header from "./components/Header";
import Submit from "./components/Submit";
import Visualiser from "./components/Visualiser";
import Footer from "./components/Footer";
import { MethodsProvider } from "./MethodsContext";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

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
            <DndProvider backend={HTML5Backend}> 
            <Visualiser />
            </DndProvider>
          </section>
        </div>
        <Footer />
      </div>
    </MethodsProvider>
  );
}

export default App;
