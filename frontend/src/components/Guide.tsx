import React from "react";
import InfoIcon from "@mui/icons-material/Info";
import SettingsIcon from '@mui/icons-material/Settings';

const Guide: React.FC = () => {
  return (
    <div className="guide">
      <h1>Guide</h1>
      <p>

      <li>Tomohub is a graphical tool to generate YAML process lists for running HTTOMO.</li>
A process list is having a loader and a set of methods based on your need for the reconstruction job.
You can start by first setting data for HTTOMO loader, then you can select the set of methods you required.
After setting the loader, you can start selecting your methods, it’s suggested to select your methods in the order appeared from the vertical tab on the left (pre-processing, reconstruction, post-processing, image saving).
Each method has a <InfoIcon/> icon, which will open the documentation of that method in a new tab for further details if required.
You can view and edit your methods in the sidebar on right, you can also reorder your methods in the process list simply by drag and dropping them to the way you desire.
Parameter sweeping : next to numeric field types (integers/floats) you can see <SettingsIcon/> icon, you can use this button to enable parameter sweeping feature for that parameter, with this feature you can set more than one value for a parameter, you can use it in 2 ways, use a range system (start,stop,step) or with constant values (separated with “,”) 
HTTOMO currently supports only one parameter sweeping per process list.
At the end, you can name your process list file and simply download it by clicking on “GET CONFIG FILE"
      </p>
    </div>
  );
};

export default Guide;