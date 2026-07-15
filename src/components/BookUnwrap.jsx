import React, { useState } from 'react';

export default function BookUnwrap({ 
  bookColor = '#ff6b6b', 
  sealColor = '#d63031', 
  sealEmblem = '🎂', 
  hasSeal = true,
  onUnwrapped 
}) {
  const [isBroken, setIsBroken] = useState(false);
  const [isOpened, setIsOpened] = useState(false);

  // Drag Gesture States
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleOpen = () => {
    if (isOpened) return;
    setIsBroken(true);
    
    // 1. Break/open clasp
    setTimeout(() => {
      setIsOpened(true);
      
      // 2. Open front cover (rotates open) and complete
      setTimeout(() => {
        if (onUnwrapped) onUnwrapped();
      }, 1500);
    }, 500);
  };

  const handleDragStart = (clientX) => {
    if (isOpened) return;
    setStartX(clientX);
    setIsDragging(true);
  };

  const handleDragMove = (clientX) => {
    if (!isDragging) return;
    const deltaX = startX - clientX; // drag left means positive deltaX
    if (deltaX > 60) { // dragged left more than 60px
      setIsDragging(false);
      handleOpen();
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className="book-wrapper"
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
      onTouchEnd={handleDragEnd}
      onMouseDown={(e) => handleDragStart(e.clientX)}
      onMouseMove={(e) => handleDragMove(e.clientX)}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      style={{ cursor: isOpened ? 'default' : 'grab' }}
    >
      <div className="gesture-hint-label" style={{ position: 'absolute', top: '-40px', width: '100%', textAlign: 'center', fontSize: '0.85rem', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>
        {hasSeal ? '👉 Tap clasp or drag cover left to open!' : '👉 Swipe / drag cover left to open!'}
        {!isOpened && <span className="drag-hint-arrow" style={{ display: 'block', fontSize: '1rem', marginTop: '4px' }}>◀ Swipe</span>}
      </div>

      <div className={`book-container ${isOpened ? 'open' : ''}`}>
        
        {/* Back Cover */}
        <div 
          className="book-back-cover"
          style={{ backgroundColor: bookColor }}
        ></div>

        {/* Inner Pages (stacked behind cover) */}
        <div className="book-page right-page">
          <div className="book-page-content">
            <span className="book-page-emoji">📖</span>
            <h4>Chapter 1</h4>
            <p>A magical journey awaits...</p>
            <div className="book-page-lines">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        {/* Front Cover (flips to the left) */}
        <div 
          className={`book-cover ${isOpened ? 'flipped' : ''}`}
          style={{ backgroundColor: bookColor }}
        >
          <div className="book-cover-design">
            <div className="book-spine-lines"></div>
            <div className="book-cover-title">SURPRISE</div>
            <div className="book-cover-subtitle">Open Me</div>
          </div>
        </div>

        {/* Wax Seal / Clasp on the cover edge (right) */}
        {hasSeal && (
          <div 
            className={`wax-seal-btn book-clasp ${isBroken ? 'broken' : ''}`} 
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
            <span className="seal-click-text">Open Book</span>
          </div>
        )}
      </div>
    </div>
  );
}
