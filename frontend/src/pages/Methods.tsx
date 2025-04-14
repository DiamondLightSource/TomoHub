import React from "react"
import { Box, styled } from "@mui/material";
import Header from "../components/Header";

import YMLG from "../components/YamlGenerator";
import Dropdowns from "../components/Dropdowns";


const Methods: React.FC = () => {
    return (

        <Box component="section" className="dropdowns">
          <Dropdowns />
          <YMLG />
        </Box>
       
   
      )
  };
  
  export default Methods;