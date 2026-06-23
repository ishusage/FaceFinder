const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.get("/images", (req, res) => {
  const uploadDir = path.join(__dirname, "uploads");

  const files = fs.readdirSync(uploadDir);

  const images = files
    .filter(file =>
      /\.(jpg|jpeg|png|webp|jfif)$/i.test(file)
    )
    .map(file => ({
      id: file,
      path: `/uploads/${file}`
    }));

  res.json(images);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});