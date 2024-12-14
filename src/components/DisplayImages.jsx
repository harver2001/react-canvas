import React from "react";

function DisplayImages() {
  const originalImage = localStorage.getItem("originalImage");
  const maskImage = localStorage.getItem("maskImage");

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
      {originalImage && maskImage && (
        <div style={{ display: "flex", gap: "20px" }}>
          <div>
            <h3>Original Image</h3>
            <img src={originalImage} alt="Original" width={300} />
          </div>
          <div>
            <h3>Mask Image</h3>
            <img src={maskImage} alt="Mask" width={300} />
          </div>
        </div>
      )}
    </div>
  );
}

export default DisplayImages;
