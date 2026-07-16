import React, { useRef, useEffect, useState } from 'react';

export default function ScratchUnwrap({ 
  unwrapColor = '#ff6b6b', 
  onUnwrapped 
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isScratchedOff, setIsScratchedOff] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set size based on display
    canvas.width = canvas.offsetWidth || 320;
    canvas.height = canvas.offsetHeight || 320;
    
    // Draw base background color
    ctx.fillStyle = unwrapColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw decorative sketchy diagonal lines
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 3;
    for (let i = -canvas.width; i < canvas.width; i += 24) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + canvas.height, canvas.height);
      ctx.stroke();
    }
    
    // Scratch prompt text
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 1.2rem "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.fillText('🎨 Scratch to Reveal!', canvas.width / 2, canvas.height / 2);
    ctx.shadowBlur = 0;
  }, [unwrapColor]);

  // Scratch action helper
  const scratch = (x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();
    
    checkScratchedPercentage();
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Handle touches vs mouse click coordinates
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleStart = (e) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    scratch(x, y);
  };

  const handleMove = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    scratch(x, y);
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  const checkScratchedPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas || isScratchedOff) return;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    let transparent = 0;
    
    // Performance optimized pixel sample check (every 16th pixel check)
    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] === 0) {
        transparent++;
      }
    }
    
    const percentage = transparent / (pixels.length / 16);
    if (percentage > 0.40) { // 40% cleared pixels
      setIsScratchedOff(true);
      canvas.style.transition = 'opacity 0.6s ease';
      canvas.style.opacity = 0;
      setTimeout(() => {
        if (onUnwrapped) onUnwrapped();
      }, 550);
    }
  };

  return (
    <div className="scratch-wrapper">
      <div className="scratch-underlay">
        <span className="scratch-badge">✨</span>
      </div>
      <canvas
        ref={canvasRef}
        className="scratch-canvas"
        style={{ touchAction: 'none' }}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      />
    </div>
  );
}
