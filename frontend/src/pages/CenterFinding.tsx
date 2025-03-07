import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";

// const CenterFinding: React.FC = () => {
//   return (
//     <div>
//       <Button
//         sx={{
//           mb: 1,
//           width: "auto",
//           a: {
//             color: "#899878",
//             textDecoration: "none",
//             display: "flex",
//             alignItems: "center",
//           },
//         }}
//         variant="text"
//         size="small"
//       >
//         <Link to="..">
//           <ArrowBackIcon sx={{mr:0.5}}/>  Back
//         </Link>
//       </Button>
//       <h1>CenterFinding</h1>
//     </div>
//   );
// };

// export default CenterFinding;

import React, { useState } from "react";
import { useLoader } from "../contexts/LoaderContext"; // Import the loader context
import apiClient from "../api/client"; // Import your API client

const CenterFinding: React.FC = () => {
  // State for form inputs
  const [file, setFile] = useState<File | null>(null);
  const [algorithm, setAlgorithm] = useState<string>("fbp");
  const [start, setStart] = useState<number>(30);
  const [stop, setStop] = useState<number>(200);
  const [step, setStep] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Get the loader context
  const loaderContext = useLoader();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setMessage("Please select a file");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      // Create form data to send the file and other values
      const formData = new FormData();
      formData.append("file", file);
      formData.append("algorithm", algorithm);
      formData.append("start", start.toString());
      formData.append("stop", stop.toString());
      formData.append("step", step.toString());
      
      // Add loader context data
      formData.append("loader_context", JSON.stringify(loaderContext));

      // Use axios client with correct endpoint
      const response = await apiClient.post("/api/reconstruction", formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Override the default to handle file uploads
        },
      });

      setMessage(response.data.message || "Reconstruction started successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Reconstruction Parameters</h2>
      
      <form onSubmit={handleSubmit}>
        {/* File Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Select Data File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {file && (
            <p className="text-sm text-gray-600 mt-1">
              Selected: {file.name}
            </p>
          )}
        </div>

        {/* Algorithm Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Reconstruction Algorithm
          </label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="fbp">FBP</option>
            <option value="art">ART</option>
            <option value="BART">BART</option>
            <option value="option4">Option 4</option>
          </select>
        </div>

        {/* Start, Stop, Step Inputs */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start</label>
            <input
              type="number"
              value={start}
              onChange={(e) => setStart(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stop</label>
            <input
              type="number"
              value={stop}
              onChange={(e) => setStop(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Step</label>
            <input
              type="number"
              value={step}
              onChange={(e) => setStep(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded disabled:bg-blue-300"
        >
          {isLoading ? "Processing..." : "Start Reconstruction"}
        </button>
      </form>

      {/* Status Message */}
      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
          {message}
        </div>
      )}
    </div>
  );
};

export default CenterFinding;
