import React, { useRef, useState, useEffect } from "react";
import "./DrawingCanvas.css";

function DrawingCanvas() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [exportedImage, setExportedImage] = useState(null);
  const [exportedMask, setExportedMask] = useState(null);
  const [brushSize, setBrushSize] = useState(5);
  const [isExported, setIsExported] = useState(false);
  const canvasRef = useRef(null);
  const maskCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 500;
    canvas.height = 500;

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#ffffff"; // White brush for drawing

    let isDrawing = false;

    const startDrawing = (e) => {
      isDrawing = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    };

    const draw = (e) => {
      if (!isDrawing) return;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    };

    const stopDrawing = () => {
      isDrawing = false;
      ctx.closePath();
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseout", stopDrawing);
    };
  }, [brushSize]);

  useEffect(() => {
    if (uploadedImage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const img = new Image();
      img.src = uploadedImage;

      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Redraw image on canvas
      };
    }
  }, [brushSize, uploadedImage]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          setUploadedImage(img.src);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Set image as canvas background
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;

    // Create the mask
    const maskCtx = maskCanvas.getContext("2d");
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;

    // Fill mask canvas with black
    maskCtx.fillStyle = "#000000";
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    // Copy the white brush strokes only from the canvas
    const canvasData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);

    for (let i = 0; i < canvasData.data.length; i += 4) {
      // Check for white pixels (brush strokes)
      if (
        canvasData.data[i] === 255 && // Red channel
        canvasData.data[i + 1] === 255 && // Green channel
        canvasData.data[i + 2] === 255 // Blue channel
      ) {
        maskData.data[i] = 255; // White for mask
        maskData.data[i + 1] = 255;
        maskData.data[i + 2] = 255;
        maskData.data[i + 3] = 255; // Fully opaque
      }
    }

    maskCtx.putImageData(maskData, 0, 0);

    // Set exported images
    setExportedImage(uploadedImage); // Original uploaded image
    setExportedMask(maskCanvas.toDataURL("image/png")); // Pure mask with black background and white scribbles
    setIsExported(true); // Hide canvas and show exported images
  };

  return (
    <div className="drawing-container">
      <h2>Image Inpainting Widget</h2>
      <div className="controls">
        {!isExported && (
          <>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <label>
              Brush Size:
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
              />
            </label>
          </>
        )}
        <button onClick={handleExport}>Export</button>
        <button onClick={() => window.location.reload()}>Clear</button>
      </div>
      {!isExported && (
        <div className="canvas-wrapper">
          <canvas ref={canvasRef} />
          <canvas ref={maskCanvasRef} hidden />
        </div>
      )}
      {exportedImage && exportedMask && (
        <div className="preview-wrapper">
          <div className="preview-images">
            <div>
              <h3>Original Image:</h3>
              <img src={exportedImage} alt="Original" className="preview-image" />
            </div>
            <div>
              <h3>Mask:</h3>
              <img src={exportedMask} alt="Mask" className="preview-image" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DrawingCanvas;