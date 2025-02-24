import React from "react";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";

const CenterFinding: React.FC = () => {
  return (
    <div>
      <Button
        sx={{
          mb: 1,
          width: "auto",
          a: {
            color: "#899878",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
          },
        }}
        variant="text"
        size="small"
      >
        <Link to="..">
          <ArrowBackIcon sx={{mr:0.5}}/>  Back
        </Link>
      </Button>
      <h1>CenterFinding</h1>
    </div>
  );
};

export default CenterFinding;
