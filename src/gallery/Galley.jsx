import React, { useState } from "react";
import axios from "axios";

const TrekGalleryManager = ({ trek, onClose }) => {
  const [hero, setHero] = useState(null);
  const [gallery, setGallery] = useState([]);

  const uploadImages = async (files, isHero = false) => {
    const formData = new FormData();
    files.forEach(file => formData.append("images", file));
    formData.append("is_hero", isHero);

    await axios.post(
      `/api/treks/${trek.slug}/images/`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  };

  const handleHeroUpload = async () => {
    await uploadImages([hero], true);
    alert("Hero uploaded");
  };

  const handleGalleryUpload = async () => {
    await uploadImages(gallery, false);
    alert("Gallery uploaded");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Manage Gallery — {trek.name}
      </h2>

      {/* Hero */}
      <div className="mb-6">
        <h3 className="font-semibold">Hero Image (1)</h3>
        <input
          type="file"
          accept="image/*"
          onChange={e => setHero(e.target.files[0])}
        />
        <button onClick={handleHeroUpload} className="btn">
          Upload Hero
        </button>
      </div>

      {/* Gallery */}
      <div>
        <h3 className="font-semibold">Gallery Images (max 10)</h3>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={e =>
            setGallery(Array.from(e.target.files).slice(0, 10))
          }
        />
        <button onClick={handleGalleryUpload} className="btn">
          Upload Gallery
        </button>
      </div>
    </div>
  );
};

export default TrekGalleryManager;
