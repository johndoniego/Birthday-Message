import React, { useState } from 'react';

export default function EnvelopeUnwrap({ 
  envelopeColor = '#ff6b6b', 
  sealColor = '#d63031', 
  sealEmblem = '🎂', 
  hasSeal = true,
  onUnwrapped 
}) {
  const [isOpened, setIsOpened] = useState(false);
  const [isBroken, setIsBroken] = useState(false);

  // Drag Gesture States
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleOpen = () => {
    if (isOpened) return;
    setIsBroken(true);
    
    // 1. Break the seal, then fold the flap back
    setTimeout(() => {
      setIsOpened(true);
      
      // 2. Slide the letter out and zoom in to reveal the main card
      setTimeout(() => {
        if (onUnwrapped) onUnwrapped();
      }, 1400);
    }, 500);
  };

  const handleDragStart = (clientY) => {
    if (isOpened) return;
    setStartY(clientY);
    setIsDragging(true);
  };

  const handleDragMove = (clientY) => {
    if (!isDragging) return;
    const deltaY = startY - clientY; // drag up means positive deltaY
    if (deltaY > 60) { // dragged up more than 60px
      setIsDragging(false);
      handleOpen();
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="envelope-wrapper"
      onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
      onTouchEnd={handleDragEnd}
      onMouseDown={(e) => handleDragStart(e.clientY)}
      onMouseMove={(e) => handleDragMove(e.clientY)}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      style={{ cursor: isOpened ? 'default' : 'grab' }}
    >
      <div className="gesture-hint-label" style={{ textAlign: 'center', marginBottom: '14px', fontSize: '0.85rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
        {hasSeal ? '👉 Tap seal or drag flap up to open!' : '👉 Swipe / drag flap up to open!'}
        {!isOpened && <span className="drag-hint-arrow">▲</span>}
      </div>

      <div 
        className={`envelope-container ${isOpened ? 'open' : ''}`} 
        style={{ '--env-color': envelopeColor }}
      >
        {/* Back/Body background */}
        <div className="envelope-back"></div>

        {/* The Letter inside */}
        <div className={`envelope-letter ${isOpened ? 'slide-up' : ''}`}>
          <div className="letter-paper">
            <div className="letter-stamp">🎂</div>
            <div className="letter-title">A Special Surprise!</div>
            <div className="letter-desc">You received a magical birthday message. Open it up!</div>
            <div className="letter-lines">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        {/* Front pockets */}
        <div className="envelope-front">
          <svg viewBox="0 0 300 200" className="front-svg" width="100%" height="100%">
            <path d="M 0,0 L 150,105 L 0,200 Z" fill="var(--env-color)" filter="brightness(0.96)" />
            <path d="M 300,0 L 150,105 L 300,200 Z" fill="var(--env-color)" filter="brightness(0.96)" />
            <path d="M 0,200 L 150,105 L 300,200 Z" fill="var(--env-color)" filter="brightness(0.90)" />
          </svg>
        </div>

        {/* Top Flap */}
        <div className={`envelope-top-flap ${isOpened ? 'flap-open' : ''}`}>
          <svg viewBox="0 0 300 105" className="flap-svg" width="100%" height="100%">
            <path d="M 0,0 L 150,105 L 300,0 Z" fill="var(--env-color)" filter="brightness(1.05)" />
          </svg>
        </div>

        {/* Wax Seal - centered on top flap tip */}
        {hasSeal && (
          <div 
            className={`wax-seal-btn ${isBroken ? 'broken' : ''}`} 
            onClick={handleOpen}
            style={{ '--seal-color': sealColor }}
          >
            <div className="seal-outer">
              <div className="seal-inner">
                {sealEmblem && (sealEmblem.startsWith('data:image/') || sealEmblem.startsWith('http://') || sealEmblem.startsWith('https://') || sealEmblem.startsWith('/')) ? (
                  <img 
                    src={sealEmblem} 
                    alt="seal" 
                    style={{ width: '85%', height: '85%', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  <span className="seal-emoji">{sealEmblem}</span>
                )}
              </div>
            </div>
            <span className="seal-click-text">Tap Seal</span>
          </div>
        )}
      </div>
    </div>
  );
}
