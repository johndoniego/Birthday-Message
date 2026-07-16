import React, { useState } from 'react';

export default function MagicOrbUnwrap({ orbColor = '#8a2be2', onUnwrapped }) {
  const [taps, setTaps] = useState(0);
  const [shattered, setShattered] = useState(false);

  const handleTap = () => {
    if (shattered) return;
    const newTaps = taps + 1;
    setTaps(newTaps);

    if (newTaps >= 3) {
      setShattered(true);
      setTimeout(() => {
        if (onUnwrapped) onUnwrapped();
      }, 1000);
    }
  };

  return (
    <div className={`magic-orb-wrapper ${shattered ? 'orb-shattered' : ''}`} onClick={handleTap}>
      <div className="orb-base"></div>
      <div className="orb-sphere" style={{ '--orb-color': orbColor }}></div>
      <div className="orb-cracks">
        {taps >= 1 && (
          <div className="orb-crack-line" style={{ width: '40px', height: '2px', top: '30%', left: '40%', transform: 'rotate(45deg)', opacity: 1 }}></div>
        )}
        {taps >= 2 && (
          <>
            <div className="orb-crack-line" style={{ width: '60px', height: '3px', top: '50%', left: '20%', transform: 'rotate(-20deg)', opacity: 1 }}></div>
            <div className="orb-crack-line" style={{ width: '30px', height: '2px', top: '70%', left: '50%', transform: 'rotate(70deg)', opacity: 1 }}></div>
          </>
        )}
      </div>
      <p className="uw-tap-text" style={{ position: 'absolute', bottom: '-60px', width: '100%', left: 0, opacity: shattered ? 0 : 1 }}>
        {taps === 0 ? 'Tap the mystical orb...' : taps === 1 ? 'Keep tapping...' : 'Almost there!'}
      </p>
    </div>
  );
}
