import React, { useState } from 'react';

export default function VaultUnwrap({ onUnwrapped }) {
  const [unlocked, setUnlocked] = useState(false);
  const [opened, setOpened] = useState(false);

  const handleClick = () => {
    if (unlocked || opened) return;
    
    // Step 1: Spin dial and unlock
    setUnlocked(true);
    
    // Step 2: Open door
    setTimeout(() => {
      setOpened(true);
      
      // Step 3: Finish unwrap
      setTimeout(() => {
        if (onUnwrapped) onUnwrapped();
      }, 1600);
    }, 600);
  };

  return (
    <div className={`vault-wrapper ${unlocked ? 'unlocked' : ''} ${opened ? 'opened' : ''}`} onClick={handleClick}>
      <div className="vault-body">
        <div className="vault-door">
          <div className="vault-dial">
            <div className="vault-dial-inner"></div>
          </div>
        </div>
      </div>
      <p className="uw-tap-text" style={{ position: 'absolute', bottom: '-50px', width: '100%', left: 0, opacity: unlocked ? 0 : 1 }}>
        Tap to crack the safe...
      </p>
    </div>
  );
}
