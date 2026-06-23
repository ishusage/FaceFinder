import React, { useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";

function SearchFace() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const [totalImages, setTotalImages] = useState(0);
  const [processed, setProcessed] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

const searchFace = async () => {
  if (!selectedFile) {
    alert("Please select an image");
    return;
  }

  try {
    setLoading(true);
    setMatches([]);
    setProcessed(0);

    const queryImg = await faceapi.bufferToImage(selectedFile);

    const queryFace = await faceapi
      .detectSingleFace(queryImg)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!queryFace) {
      alert("No face detected in uploaded image");
      setLoading(false);
      return;
    }

    const response = await axios.get(
      "http://localhost:5000/images"
    );

    const images = response.data;

    setTotalImages(images.length);

    const THRESHOLD = 0.45;

    const seen = new Set();

    for (let i = 0; i < images.length; i++) {
      const item = images[i];

      setProcessed(i + 1);

      try {
        const dbImg = await faceapi.fetchImage(
          `http://localhost:5000${item.path}`
        );

        const detections = await faceapi
          .detectAllFaces(dbImg)
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (!detections.length) continue;

        let bestDistanceInImage = Infinity;

        for (const face of detections) {
          const distance = faceapi.euclideanDistance(
            queryFace.descriptor,
            face.descriptor
          );

          console.log(
            `${item.id} => distance: ${distance.toFixed(4)}`
          );

          if (distance < bestDistanceInImage) {
            bestDistanceInImage = distance;
          }
        }

        if (
          bestDistanceInImage < THRESHOLD &&
          !seen.has(item.path)
        ) {
          seen.add(item.path);

          const matchObj = {
            image: item.path,
            distance: bestDistanceInImage,
            confidence: (
              (1 - bestDistanceInImage) *
              100
            ).toFixed(1),
          };

          setMatches((prev) => {
            const updated = [...prev, matchObj];

            // Best matches first
            updated.sort(
              (a, b) => a.distance - b.distance
            );

            return updated;
          });
        }
      } catch (err) {
        console.log(
          "Skipped image:",
          item.id,
          err.message
        );
      }
    }

    setLoading(false);
  } catch (err) {
    console.error(err);
    setLoading(false);
  }
};


//   new search working code 

// const searchFace = async () => {
//   if (!selectedFile) {
//     alert("Please select an image");
//     return;
//   }

//   try {
//     setLoading(true);
//     setMatches([]);
//     setProcessed(0);

//     const queryImg = await faceapi.bufferToImage(selectedFile);

//     const queryFace = await faceapi
//       .detectSingleFace(queryImg)
//       .withFaceLandmarks()
//       .withFaceDescriptor();

//     if (!queryFace) {
//       alert("No face detected in uploaded image");
//       setLoading(false);
//       return;
//     }

//     const response = await axios.get(
//       "http://localhost:5000/images"
//     );

//     const images = response.data;

//     setTotalImages(images.length);

//     const THRESHOLD = 0.45;

//     const seen = new Set();

//     for (let i = 0; i < images.length; i++) {
//       const item = images[i];

//       setProcessed(i + 1);

//       try {
//         const dbImg = await faceapi.fetchImage(
//           `http://localhost:5000${item.path}`
//         );

//         const detections = await faceapi
//           .detectAllFaces(dbImg)
//           .withFaceLandmarks()
//           .withFaceDescriptors();

//         if (!detections.length) continue;

//         let bestDistanceInImage = Infinity;

//         for (const face of detections) {
//           const distance = faceapi.euclideanDistance(
//             queryFace.descriptor,
//             face.descriptor
//           );

//           console.log(
//             `${item.id} => distance: ${distance.toFixed(4)}`
//           );

//           if (distance < bestDistanceInImage) {
//             bestDistanceInImage = distance;
//           }
//         }

//         if (
//           bestDistanceInImage < THRESHOLD &&
//           !seen.has(item.path)
//         ) {
//           seen.add(item.path);

//           const matchObj = {
//             image: item.path,
//             distance: bestDistanceInImage,
//             confidence: (
//               (1 - bestDistanceInImage) *
//               100
//             ).toFixed(1),
//           };

//           setMatches((prev) => {
//             const updated = [...prev, matchObj];

//             // Best matches first
//             updated.sort(
//               (a, b) => a.distance - b.distance
//             );

//             return updated;
//           });
//         }
//       } catch (err) {
//         console.log(
//           "Skipped image:",
//           item.id,
//           err.message
//         );
//       }
//     }

//     setLoading(false);
//   } catch (err) {
//     console.error(err);
//     setLoading(false);
//   }
// };

//   const searchFace = async () => {
//     if (!selectedFile) {
//       alert("Please select an image");
//       return;
//     }

//     try {
//       setLoading(true);
//       setMatches([]);
//       setProcessed(0);

//       const img = await faceapi.bufferToImage(selectedFile);

//       const queryFace = await faceapi
//         .detectSingleFace(img)
//         .withFaceLandmarks()
//         .withFaceDescriptor();

//       if (!queryFace) {
//         alert("No face detected in uploaded image");
//         setLoading(false);
//         return;
//       }

//       const response = await axios.get(
//         "http://localhost:5000/images"
//       );

//       const images = response.data;

//       setTotalImages(images.length);

//       for (let i = 0; i < images.length; i++) {
//         const item = images[i];

//         setProcessed(i + 1);

//         try {
//           const dbImg = await faceapi.fetchImage(
//             `http://localhost:5000${item.path}`
//           );

//           const detections = await faceapi
//             .detectAllFaces(dbImg)
//             .withFaceLandmarks()
//             .withFaceDescriptors();

//           for (const face of detections) {
//             const distance =
//               faceapi.euclideanDistance(
//                 queryFace.descriptor,
//                 face.descriptor
//               );

//             console.log(
//               `${item.id} => ${distance.toFixed(4)}`
//             );

//             if (distance < 0.6) {
//               const matchObj = {
//                 image: item.path,
//                 confidence: (
//                   (1 - distance) *
//                   100
//                 ).toFixed(1),
//               };

//               setMatches((prev) => {
//                 const exists = prev.find(
//                   (x) => x.image === matchObj.image
//                 );

//                 if (exists) return prev;

//                 return [...prev, matchObj];
//               });

//               break;
//             }
//           }
//         } catch (err) {
//           console.log(
//             "Skipped image:",
//             item.id
//           );
//         }
//       }

//       setLoading(false);
//     } catch (err) {
//       console.error(err);
//       setLoading(false);
//     }
//   };

  const downloadImage = async (imagePath) => {
  try {
    const response = await fetch(
      `http://localhost:5000${imagePath}`
    );

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =
      imagePath.split("/").pop();

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error(
      "Download failed:",
      error
    );
  }
};

  return (
    <>
      <div className="row g-4">
        {/* Upload Section */}

        <div className="col-lg-4">
          <div className="card border-0 shadow h-100">
            <div className="card-body">
              <h4 className="mb-3">
                Query Face
              </h4>

              {preview ? (
                <img
                  src={preview}
                  alt=""
                  className="img-fluid rounded mb-3"
                  style={{
                    width: "100%",
                    height: "300px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  className="bg-light rounded d-flex justify-content-center align-items-center"
                  style={{
                    height: "300px",
                  }}
                >
                  No Image Selected
                </div>
              )}

              <input
                type="file"
                className="form-control mb-3"
                onChange={handleFileChange}
              />

              <button
                className="btn btn-primary w-100"
                onClick={searchFace}
                disabled={loading}
              >
                {loading
                  ? "Scanning..."
                  : "Search Face"}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}

        <div className="col-lg-8">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="card border-0 shadow text-center">
                <div className="card-body">
                  <h6 className="text-muted">
                    Total Images
                  </h6>
                  <h2>{totalImages}</h2>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow text-center">
                <div className="card-body">
                  <h6 className="text-muted">
                    Matches Found
                  </h6>

                  <h2 className="text-success">
                    {matches.length}
                  </h2>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow text-center">
                <div className="card-body">
                  <h6 className="text-muted">
                    Threshold
                  </h6>
                  <h2>0.60</h2>
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="card border-0 shadow mt-4">
              <div className="card-body">
                <h6 className="mb-3">
                  Scanning Images...
                </h6>

                <div className="progress">
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    style={{
                      width: `${
                        totalImages > 0
                          ? (processed /
                              totalImages) *
                            100
                          : 0
                      }%`,
                    }}
                  >
                    {processed}/{totalImages}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}

      <div className="mt-5">
        <h3 className="mb-4">
          Matched Images
        </h3>

        {matches.length === 0 &&
          !loading && (
            <div className="alert alert-warning">
              No matching faces found
            </div>
          )}

        <div className="row g-4">
          {matches.map((img, index) => (
            <div
              className="col-lg-3 col-md-4 col-sm-6"
              key={index}
            >
              <div className="card border-0 shadow h-100">
                <img
                  src={`http://localhost:5000${img.image}`}
                  alt=""
                  className="card-img-top"
                  style={{
                    height: "250px",
                    objectFit: "cover",
                  }}
                />

                <div className="card-body text-center">
                  <span className="badge bg-success">
                    Match Found
                  </span>

                  <div className="mt-2 text-muted">
                    Similarity:
                    {" "}
                    {img.confidence}%
                  </div>
                </div>

                <div className="text-center pb-3">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                        downloadImage(img.image)
                    }
                    >
                    Download
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default SearchFace;