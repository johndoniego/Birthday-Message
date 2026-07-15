import React, { useState } from 'react';

export default function ScrollUnwrap({ 
  scrollColor = '#ff6b6b', 
  sealColor = '#d63031', 
  sealEmblem = '🎂', 
  hasSeal = true,
  onUnwrapped 
}) {
  const [isBroken, setIsBroken] = useState(false);
  const [isUntied, setIsUntied] = useState(false);
  const [isUnrolled, setIsUnrolled] = useState(false);

  // Drag Gesture States
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleOpen = () => {
    if (isUntied) return;
    setIsBroken(true);
    
    // 1. Break the seal
    setTimeout(() => {
      setIsUntied(true);
      
      // 2. Unroll the scroll (rollers slide apart)
      setTimeout(() => {
        setIsUnrolled(true);
        
        // 3. Complete unwrapping
        setTimeout(() => {
          if (onUnwrapped) onUnwrapped();
        }, 1400);
      }, 500);
    }, 500);
  };

  const handleDragStart = (clientX) => {
    if (isUntied) return;
    setStartX(clientX);
    setIsDragging(true);
  };

  const handleDragMove = (clientX) => {
    if (!isDragging) return;
    const deltaX = Math.abs(startX - clientX); // drag left/right
    if (deltaX > 60) { // dragged apart more than 60px
      setIsDragging(false);
      handleOpen();
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="scroll-wrapper"
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
      onTouchEnd={handleDragEnd}
      onMouseDown={(e) => handleDragStart(e.clientX)}
      onMouseMove={(e) => handleDragMove(e.clientX)}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      style={{ cursor: isUnrolled ? 'default' : 'grab' }}
    >
      <div className="gesture-hint-label" style={{ position: 'absolute', top: '-40px', width: '100%', textAlign: 'center', fontSize: '0.85rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
        {hasSeal ? '👉 Tap seal or drag rollers apart to unroll!' : '👉 Drag rollers left/right to unroll!'}
        {!isUnrolled && <span className="drag-hint-arrow" style={{ display: 'block', fontSize: '1rem', marginTop: '4px' }}>◀ 👤 ▶</span>}
      </div>

      <div className={`scroll-container ${isUnrolled ? 'unrolled' : ''}`}>
        
        {/* Ribbon - wraps around closed scroll */}
        {hasSeal && (
          <div 
            className={`scroll-ribbon ${isUntied ? 'untied' : ''}`}
            style={{ backgroundColor: scrollColor }}
          ></div>
        )}

        {/* Scroll Paper */}
        <div 
          className={`scroll-paper-body ${isUnrolled ? 'stretched' : ''}`}
          style={{ '--paper-color': '#fdf6e2' }}
        >
          <div className="scroll-inner-text">
            <span className="scroll-stamp">📜</span>
            <h3>Royal Decree</h3>
            <p>A birthday celebration is in order!</p>
            <div className="scroll-lines">
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        {/* Roller Left */}
        <div className={`scroll-roller left ${isUnrolled ? 'roll-left' : ''}`}>
          <div className="roller-handle top" style={{ backgroundColor: scrollColor }}></div>
          <div className="roller-shaft"></div>
          <div className="roller-handle bottom" style={{ backgroundColor: scrollColor }}></div>
        </div>

        {/* Roller Right */}
        <div className={`scroll-roller right ${isUnrolled ? 'roll-right' : ''}`}>
          <div className="roller-handle top" style={{ backgroundColor: scrollColor }}></div>
          <div className="roller-shaft"></div>
          <div className="roller-handle bottom" style={{ backgroundColor: scrollColor }}></div>
        </div>

        {/* Wax Seal on the Ribbon (closed scroll) */}
        {hasSeal && (
          <div 
            className={`wax-seal-btn scroll-seal ${isBroken ? 'broken' : ''}`} 
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
            <span className="seal-click-text">Break Seal</span>
          </div>
        )}
      </div>
    </div>
  );
}
