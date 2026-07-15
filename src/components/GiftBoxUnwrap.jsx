import React, { useState } from 'react';

export default function GiftBoxUnwrap({ 
  boxColor = '#ff6b6b', 
  sealColor = '#d63031', 
  sealEmblem = '🎂', 
  hasSeal = true,
  onUnwrapped 
}) {
  const [isPopped, setIsPopped] = useState(false);
  const [isOpened, setIsOpened] = useState(false);

  // Drag Gesture States
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleOpen = () => {
    if (isPopped) return;
    setIsPopped(true);
    
    // 1. Lid flies off
    setTimeout(() => {
      setIsOpened(true);
      
      // 2. Box body fades and card unrolls
      setTimeout(() => {
        if (onUnwrapped) onUnwrapped();
      }, 800);
    }, 450);
  };

  const handleDragStart = (clientY) => {
    if (isPopped) return;
    setStartY(clientY);
    setIsDragging(true);
  };

  const handleDragMove = (clientY) => {
    if (!isDragging) return;
    const deltaY = startY - clientY; // drag up is positive
    if (deltaY > 60) {
      setIsDragging(false);
      handleOpen();
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="gift-box-wrapper-unwrap"
      onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
      onTouchEnd={handleDragEnd}
      onMouseDown={(e) => handleDragStart(e.clientY)}
      onMouseMove={(e) => handleDragMove(e.clientY)}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      style={{ cursor: isPopped ? 'default' : 'grab' }}
    >
      <div className="gesture-hint-label" style={{ position: 'absolute', top: '-40px', width: '100%', textAlign: 'center', fontSize: '0.85rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
        {hasSeal ? '👉 Tap bow or swipe up to pop the lid!' : '👉 Swipe / drag box up to open!'}
        {!isPopped && <span className="drag-hint-arrow" style={{ display: 'block', fontSize: '1rem', marginTop: '4px' }}>▲ Pop Lid</span>}
      </div>

      <div className="gift-box-unwrap" onClick={handleOpen}>
        {/* Bow (on top of lid) */}
        {!isOpened && (
          <div className={`box-bow ${isPopped ? 'popped' : ''}`}>
            {hasSeal ? (
              sealEmblem && (sealEmblem.startsWith('data:image/') || sealEmblem.startsWith('http://') || sealEmblem.startsWith('https://') || sealEmblem.startsWith('/')) ? (
                <img 
                  src={sealEmblem} 
                  alt="bow logo" 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--color-ink)', objectFit: 'cover' }} 
                />
              ) : (
                <span>{sealEmblem}</span>
              )
            ) : (
              <span>🎀</span>
            )}
          </div>
        )}

        {/* Lid */}
        <div 
          className={`box-lid ${isPopped ? 'popped' : ''}`}
          style={{ '--box-color': boxColor }}
        >
          <div className="box-ribbon-h" style={{ '--seal-color': sealColor }}></div>
        </div>

        {/* Box Body */}
        <div 
          className={`box-body ${isOpened ? 'opened' : ''}`}
          style={{ '--box-color': boxColor }}
        >
          <div className="box-ribbon-v" style={{ '--seal-color': sealColor }}></div>
        </div>
      </div>
    </div>
  );
}
