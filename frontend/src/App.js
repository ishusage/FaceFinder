import React, { useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import SearchFace from "./components/SearchFace";

function App() {
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";

        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        setModelsLoaded(true);
      } catch (err) {
        console.error(err);
      }
    };

    loadModels();
  }, []);

return (
    <div className="bg-light min-vh-100">
      <div className="container py-5">

        <div className="text-center mb-5">
          <h1 className="fw-bold">Face Recognition System</h1>
          <p className="text-muted">
            Upload a face and find matching photos from gallery
          </p>
        </div>

        {modelsLoaded ? (
      <SearchFace />
    ) : (
      <div className="text-center">
        <div className="spinner-border"></div>
        <h5 className="mt-3">Loading AI Models...</h5>
      </div>
    )}

      </div>
    </div>
  );
}

export default App;
