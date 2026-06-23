import React from "react";
import axios from "axios";

function UploadDataset() {
  const uploadImages = async (e) => {
    const formData = new FormData();

    for (let file of e.target.files) {
      formData.append("images", file);
    }

    await axios.post("http://localhost:5000/upload-images", formData);

    alert("Uploaded!");
  };

  return (
    <div>
      <h3>Upload Dataset Images</h3>
      <input type="file" multiple onChange={uploadImages} />
    </div>
  );
}

export default UploadDataset;