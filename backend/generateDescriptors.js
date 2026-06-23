const fs = require("fs");
const path = require("path");
const canvas = require("canvas");
const faceapi = require("face-api.js");

const { Canvas, Image, ImageData } = canvas;

faceapi.env.monkeyPatch({
  Canvas,
  Image,
  ImageData
});

const uploadsDir = path.join(__dirname, "uploads");

async function generateDescriptors() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(
    path.join(__dirname, "../frontend/public/models")
  );

  await faceapi.nets.faceLandmark68Net.loadFromDisk(
    path.join(__dirname, "../frontend/public/models")
  );

  await faceapi.nets.faceRecognitionNet.loadFromDisk(
    path.join(__dirname, "../frontend/public/models")
  );

  const files = fs.readdirSync(uploadsDir);

  const descriptorDB = [];

  for (const file of files) {

    try {

      const img = await canvas.loadImage(
        path.join(uploadsDir, file)
      );

      const detections = await faceapi
        .detectAllFaces(img)
        .withFaceLandmarks()
        .withFaceDescriptors();

      detections.forEach((face, index) => {

        descriptorDB.push({
          image: `/uploads/${file}`,
          descriptor: Array.from(face.descriptor),
          faceIndex: index
        });

      });

      console.log(
        `${file} -> ${detections.length} faces`
      );

    } catch (err) {
      console.log(file, err.message);
    }
  }

  fs.writeFileSync(
    path.join(__dirname, "descriptors.json"),
    JSON.stringify(descriptorDB)
  );

  console.log(
    `Saved ${descriptorDB.length} descriptors`
  );
}

generateDescriptors();