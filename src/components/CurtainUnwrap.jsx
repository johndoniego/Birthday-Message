import React, { useState } from 'react';

export default function CurtainUnwrap({ onUnwrapped }) {
  const [opened, setOpened] = useState(false);

  const handleClick = () => {
    if (opened) return;
    setOpened(true);
    setTimeout(() => {
      if (onUnwrapped) onUnwrapped();
    }, 2000); // Wait for the curtains to pull back
  };

  return (
    <div className={`curtain-wrapper ${opened ? 'opened' : ''}`} onClick={handleClick}>
      <div className="curtain-panel curtain-left"></div>
      <div className="curtain-panel curtain-right"></div>
      <div className="curtain-tap-text">
        Tap to reveal...
      </div>
    </div>
  );
}
