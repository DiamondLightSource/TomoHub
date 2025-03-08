import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button, Slider, Typography } from "@mui/material";
import { useLoader } from "../contexts/LoaderContext";
import apiClient from "../api/client";
import { imageService } from "../api/services";

const CenterFinding = () => {
  // State for form inputs
  const [file, setFile] = useState<File | null>(null);
  const [algorithm, setAlgorithm] = useState("fbp");
  const [start, setStart] = useState(30);
  const [stop, setStop] = useState(200);
  const [step, setStep] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // State for results
  const [centerImages, setCenterImages] = useState({});
  const [centerValues, setCenterValues] = useState<string[]>([]);
  const [currentCenterIndex, setCurrentCenterIndex] = useState(0);
  const [currentImagePath, setCurrentImagePath] = useState("");

  // Get the loader context
  const loaderContext = useLoader();

  // Update center values when centerImages changes
  useEffect(() => {
    if (Object.keys(centerImages).length > 0) {
      const values = Object.keys(centerImages).sort((a, b) => Number(a) - Number(b));
      setCenterValues(values);
      
      // Set default to first image
      if (values.length > 0) {
        setCurrentCenterIndex(0);
        setCurrentImagePath(centerImages[values[0]]);
      }
    }
  }, [centerImages]);

  // Update current image when slider value changes
  useEffect(() => {
    if (centerValues.length > 0 && currentCenterIndex < centerValues.length) {
      const centerValue = centerValues[currentCenterIndex];
      setCurrentImagePath(centerImages[centerValue]);
    }
  }, [currentCenterIndex, centerValues, centerImages]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  // Handle slider change
  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    setCurrentCenterIndex(newValue as number);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!file) {
      setMessage("Please select a file");
      return;
    }
  
    setIsLoading(true);
    setMessage("");
    setCenterImages({});
    setCenterValues([]);
  
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
          'Content-Type': 'multipart/form-data',
        },
      });

      // Log the response data to console
      console.log("Reconstruction response:", response.data);
      
      setMessage(response.data.message || "Reconstruction completed successfully!");
      
      // Store the center images mapping
      if (response.data.center_images) {
        setCenterImages(response.data.center_images);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
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
          <ArrowBackIcon sx={{ mr: 0.5 }} /> Back
        </Link>
      </Button>
      
      <div className="bg-white rounded shadow-md p-6 mb-6">
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
              <option value="bart">BART</option>
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

      {/* Results Section with Slider */}
      {centerValues.length > 0 && (
        <div className="bg-white rounded shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Reconstruction Results</h2>
          
          {/* Image Preview */}
          <div className="mb-6 text-center">
           
            <img
              src={imageService.getImageUrl(currentImagePath)}
              alt={`Reconstruction with center ${centerValues[currentCenterIndex]}`}
              className="max-w-full h-auto mx-auto border border-gray-200 rounded"
            />
            <p className="mt-2 font-medium">
              Center Value: {centerValues[currentCenterIndex]}
            </p>
          </div>
          
          {/* Slider Control */}
          <div className="px-4">
            <Typography id="center-slider" gutterBottom>
              Center Value
            </Typography>
            <Slider
              value={currentCenterIndex}
              onChange={handleSliderChange}
              min={0}
              max={centerValues.length - 1}
              step={1}
              marks={centerValues.map((value, index) => ({ 
                value: index, 
                label: value 
              }))}
              valueLabelDisplay="auto"
              valueLabelFormat={(index) => centerValues[index]}
              aria-labelledby="center-slider"
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default CenterFinding;