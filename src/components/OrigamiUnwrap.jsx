import React, { useState } from 'react';

export default function OrigamiUnwrap({ oriColor = '#ffb6c1', onUnwrapped }) {
  const [opened, setOpened] = useState(false);

  const handleClick = () => {
    if (opened) return;
    setOpened(true);
    setTimeout(() => {
      if (onUnwrapped) onUnwrapped();
    }, 1500); // Wait for the unfold animation
  };

  return (
    <div className={`origami-wrapper ${opened ? 'opened' : ''}`} onClick={handleClick}>
      <div className="origami-part ori-tl" style={{ '--ori-color': oriColor }}></div>
      <div className="origami-part ori-tr" style={{ '--ori-color': oriColor }}></div>
      <div className="origami-part ori-t" style={{ '--ori-color': oriColor }}></div>
      <div className="origami-part ori-b" style={{ '--ori-color': oriColor }}></div>
      <p className="uw-tap-text" style={{ position: 'absolute', bottom: '-40px', width: '100%', left: 0, opacity: opened ? 0 : 1 }}>
        Tap to unfold...
      </p>
    </div>
  );
}
