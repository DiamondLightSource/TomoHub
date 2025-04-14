import React from "react"
import { Box, styled } from "@mui/material";
import Header from "../components/Header";

import YMLG from "../components/YamlGenerator";
import Guide from "../components/Guide";
import Dropdowns from "../components/Dropdowns";


const Home: React.FC = () => {
    return (

      <Box component="section" className="dropdowns">
        <Guide />
        <YMLG />
      </Box>
     
 
    )
};

export default Home;