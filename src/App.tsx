import React from 'react'
import './App.css'
import Dropdown from './components/Dropdown';
import Header from './components/Header';
import Submit from './components/Submit';

function App() {

  let [name,setName] = React.useState<string>("Mobin");

  return (
      <div className="container">
        <section className="left-section">
          <Header />
          <section className='dropdowns'>
            <Dropdown name="Data Loader"/>
            <Dropdown name="Normalisation"/>
            <Dropdown name="Center of Rotation"/>
            <Dropdown name="Reconstruction"/>
            <Dropdown name="Save"/> 
          </section>
          <Submit />
        </section>
        <section className="right-section">
        </section>
      </div>
  )
}

export default App
