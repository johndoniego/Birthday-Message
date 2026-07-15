import React, { useState, useEffect, useRef } from 'react';
import { calcAge, getYouTubeId } from '../utils';
import ParticleCanvas from './ParticleCanvas';
import EnvelopeUnwrap from './EnvelopeUnwrap';
import ScrollUnwrap from './ScrollUnwrap';
import BookUnwrap from './BookUnwrap';
import ScratchUnwrap from './ScratchUnwrap';
import GiftBoxUnwrap from './GiftBoxUnwrap';

// Interactive Bursting Gift Box Component
function InteractiveGift({ gift, idx }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isBursting, setIsBursting] = useState(false);
  const [sparkles, setSparkles] = useState([]);

  const handleOpen = (e) => {
    e.preventDefault();
    if (isOpen || isBursting) {
      if (gift.url) {
        window.open(gift.url, '_blank');
      }
      return;
    }

    setIsBursting(true);

    // Spawn 12 particles at random angles around the center
    const newSparkles = Array.from({ length: 15 }).map((_, i) => {
      const angle = (i / 15) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const velocity = 2.5 + Math.random() * 4.5;
      const colors = ['#ff4e6a', '#feca57', '#00d2d3', '#5f27cd', '#ff9ff3', '#ffe033', '#ffa500'];
      return {
        id: i,
        x: 0,
        y: 0,
        dx: Math.cos(angle) * velocity,
        dy: Math.sin(angle) * velocity,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 5,
        opacity: 1,
      };
    });
    setSparkles(newSparkles);

    // Animate sparkles moving out
    let frames = 0;
    const interval = setInterval(() => {
      setSparkles((prev) =>
        prev.map((s) => ({
          ...s,
          x: s.x + s.dx,
          y: s.y + s.dy,
          dy: s.dy + 0.15, // gravity effect
          opacity: Math.max(0, s.opacity - 0.03),
        }))
      );
      frames++;
      if (frames > 35) clearInterval(interval);
    }, 16);

    setTimeout(() => {
      setIsOpen(true);
      setIsBursting(false);
      
      // Automatically open the URL after 800ms of being open
      setTimeout(() => {
        if (gift.url) {
          window.open(gift.url, '_blank');
        }
      }, 800);
    }, 700);
  };

  const giftEmojis = ['🎁', '🎀', '💎', '🎮', '❤️'];
  const emoji = giftEmojis[idx % giftEmojis.length];

  return (
    <div 
      className={`rc-gift-card-interactive ${isOpen ? 'open' : ''} ${isBursting ? 'bursting' : ''}`}
      onClick={handleOpen}
      style={{ 
        position: 'relative', 
        cursor: 'pointer', 
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(255,255,255,0.06)',
        border: '2.5px dashed var(--border-color)',
        borderRadius: '16px',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        minHeight: '120px'
      }}
    >
      {/* Absolute Sparkles rendering */}
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="gift-sparkle-dot"
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: '50%',
            backgroundColor: s.color,
            transform: `translate(calc(-50% + ${s.x}px), calc(-50% + ${s.y}px))`,
            pointerEvents: 'none',
            zIndex: 15,
            opacity: s.opacity,
          }}
        />
      ))}

      <div className="gift-box-wrapper" style={{ transition: 'transform 0.2s' }}>
        <span className="gift-emoji" style={{ display: 'block', fontSize: '3rem', transition: 'all 0.3s' }}>
          {isOpen ? '🔓' : emoji}
        </span>
      </div>

      <div className="gift-text-info" style={{ marginTop: '8px', zIndex: 2 }}>
        <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text)' }}>
          {gift.title ? gift.title : 'Mystery Surprise'}
        </strong>
        <small style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          {isOpen ? 'Opened! Redirecting...' : 'Tap to unwrap!'}
        </small>
      </div>
    </div>
  );
}


// Helper to calculate contrast color (dark ink vs light white) based on background luma
function getContrastColor(hex) {
  if (!hex) return '#3D2C2C';
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return '#3D2C2C';
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma > 140 ? '#3D2C2C' : '#f0e6ff';
}

export default function ReceiverMode({ data }) {
  const [isLocked, setIsLocked] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isUnwrapped, setIsUnwrapped] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const audioRef = useRef(null);

  const themeClass = `theme-${data.theme || 'party'}`;

  // Date Locking Check and Countdown
  useEffect(() => {
    if (data.theme === 'custom') {
      const cardInk = getContrastColor(data.customCardBgColor || '#FFFFFF');
      document.body.style.setProperty('--bg', data.customBgColor || '#FFF8F0');
      document.body.style.setProperty('--card-bg', data.customCardBgColor || '#FFFFFF');
      document.body.style.setProperty('--text', data.customTextColor || '#3D2C2C');
      document.body.style.setProperty('--accent', data.customAccentColor || '#FF6B6B');
      document.body.style.setProperty('--border-color', cardInk === '#3D2C2C' ? '#F0D9C6' : '#3a3a5c');
      document.body.style.setProperty('--shadow', `0 6px 24px ${data.customAccentColor || '#FF6B6B'}22`);
      document.body.className = 'theme-custom';
    } else {
      document.body.style.removeProperty('--bg');
      document.body.style.removeProperty('--card-bg');
      document.body.style.removeProperty('--text');
      document.body.style.removeProperty('--accent');
      document.body.style.removeProperty('--border-color');
      document.body.style.removeProperty('--shadow');
      document.body.className = data.theme && data.theme !== 'party' ? `theme-${data.theme}` : '';
    }

    // Check if locking is bypassed
    const shouldLock = data.lockUntilBirthday !== false;
    
    if (!shouldLock) {
      setIsLocked(false);
      return;
    }

    const birthDate = new Date(data.date);
    const today = new Date();
    
    // Target is birthday day & month, in the current year
    const targetThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    
    // Compare dates ignoring times
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (todayDateOnly < targetThisYear) {
      setIsLocked(true);

      const updateCountdown = () => {
        const now = new Date();
        const diff = targetThisYear.getTime() - now.getTime();
        
        if (diff <= 0) {
          setIsLocked(false);
          return true; // Stop interval
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
        return false;
      };

      const stopped = updateCountdown();
      if (stopped) return;

      const interval = setInterval(() => {
        const stop = updateCountdown();
        if (stop) clearInterval(interval);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setIsLocked(false);
    }
  }, [data.date, themeClass, data.lockUntilBirthday]);

  // Audio trigger
  useEffect(() => {
    if (isRevealed && data.audioUrl && audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch((err) => {
        console.log('Autoplay blocked by browser. User interaction required.');
      });
    }
  }, [isRevealed, data.audioUrl]);

  const handleUnwrapped = () => {
    setIsUnwrapped(true);
    setTimeout(() => {
      setIsRevealed(true);
    }, 400);
  };

  const handleReplay = () => {
    setIsUnwrapped(false);
    setIsRevealed(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  if (isLocked) {
    const birthDate = new Date(data.date);
    const dateFormatted = `${birthDate.getMonth() + 1}/${birthDate.getDate()}`;
    return (
      <div id="date-lock-screen" className="date-lock-screen">
        <div className="lock-content">
          <div className="sealed-envelope">
            <div className="envelope-body"></div>
            <div className="envelope-flap"></div>
            <div className="envelope-seal">&#128274;</div>
          </div>
          <h1 className="lock-title">This surprise isn't ready yet!</h1>
          <p className="lock-sub">It's not your birthday yet! Come back on {dateFormatted}.</p>
          <div className="countdown-row">
            <div className="cd-unit">
              <span className="cd-num">{String(countdown.days).padStart(2, '0')}</span>
              <span className="cd-label">days</span>
            </div>
            <div className="cd-unit">
              <span className="cd-num">{String(countdown.hours).padStart(2, '0')}</span>
              <span className="cd-label">hours</span>
            </div>
            <div className="cd-unit">
              <span className="cd-num">{String(countdown.minutes).padStart(2, '0')}</span>
              <span className="cd-label">mins</span>
            </div>
            <div className="cd-unit">
              <span className="cd-num">{String(countdown.seconds).padStart(2, '0')}</span>
              <span className="cd-label">secs</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Choose the unwrap type: envelope, scroll, book
  const type = data.unwrapType || 'envelope';

  // Helper to build typography text shadow glow styles
  const getShadowStyle = (styleName) => {
    switch (styleName) {
      case 'soft':
        return '0 2px 8px rgba(0, 0, 0, 0.15)';
      case 'neon':
        return '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #00ffff, 0 0 20px #ff00aa';
      case 'retro':
        return '2px 2px 0px #ffe033, 4px 4px 0px #ff00aa';
      case 'royal':
        return '0 0 3px #d4af37, 1px 1px 0px #8a5a2b';
      default:
        return 'none';
    }
  };

  return (
    <>
      {/* Background Audio */}
      {data.audioUrl && <audio ref={audioRef} src={data.audioUrl} loop />}

      {/* Particle Canvas Effect when card is fully revealed */}
      <ParticleCanvas type={data.animation || 'confetti'} active={isRevealed} />

      {/* Unwrap Overlays */}
      {!isRevealed && (
        <div className={`unwrap-overlay ${isUnwrapped ? 'fade-out' : ''}`}>
          <div className="unwrap-center">
            {type === 'envelope' && (
              <EnvelopeUnwrap
                envelopeColor={data.unwrapColor}
                sealColor={data.sealColor}
                sealEmblem={data.sealEmblem}
                hasSeal={data.hasSeal !== false}
                onUnwrapped={handleUnwrapped}
              />
            )}
            {type === 'scroll' && (
              <ScrollUnwrap
                scrollColor={data.unwrapColor}
                sealColor={data.sealColor}
                sealEmblem={data.sealEmblem}
                hasSeal={data.hasSeal !== false}
                onUnwrapped={handleUnwrapped}
              />
            )}
            {type === 'book' && (
              <BookUnwrap
                bookColor={data.unwrapColor}
                sealColor={data.sealColor}
                sealEmblem={data.sealEmblem}
                hasSeal={data.hasSeal !== false}
                onUnwrapped={handleUnwrapped}
              />
            )}
            {type === 'scratch' && (
              <ScratchUnwrap
                unwrapColor={data.unwrapColor}
                onUnwrapped={handleUnwrapped}
              />
            )}
            {type === 'giftbox' && (
              <GiftBoxUnwrap
                boxColor={data.unwrapColor}
                sealColor={data.sealColor}
                sealEmblem={data.sealEmblem}
                hasSeal={data.hasSeal !== false}
                onUnwrapped={handleUnwrapped}
              />
            )}
            <p className="uw-tap-text" style={{ marginTop: '30px' }}>
              A surprise is waiting for you...
            </p>
          </div>
        </div>
      )}

      {/* The Actual Birthday Card (reveals after unwrap) */}
      {isRevealed && (
        <div className="card receiver-card reveal">
          <div className="rc-header">
            {data.date && (
              <div className="rc-age-badge" id="rc-age">
                {calcAge(data.date)} years young!
              </div>
            )}
            <h1 className="rc-name" id="rc-name">
              Happy Birthday, {data.name}!
            </h1>
          </div>
          <div className="rc-body">
            {/* Custom Styled Message */}
            <div
              className={`rc-message wordart-${data.wordart || 'none'}`}
              id="rc-message"
              style={{
                fontFamily: data.fontFamily || '',
                fontSize: data.fontSize || '',
                textAlign: data.textAlign || 'center',
                color: data.textColor || '',
                fontWeight: data.fontWeight || '400',
                letterSpacing: data.letterSpacing || 'normal',
                lineHeight: data.lineHeight || '1.5',
                textShadow: getShadowStyle(data.textShadow || 'none'),
              }}
              dangerouslySetInnerHTML={{ __html: data.messageHTML || '' }}
            />

            {/* Media (Image or Video) */}
            {data.imageUrl && (
              <div className="rc-media" id="rc-media">
                <img
                  src={data.imageUrl}
                  alt="Birthday media"
                  style={{ maxWidth: '100%', borderRadius: '12px' }}
                />
              </div>
            )}
            {data.videoUrl && (
              <div className="rc-media" id="rc-media">
                {getYouTubeId(data.videoUrl) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(data.videoUrl)}`}
                    width="100%"
                    height="315"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: '12px' }}
                  ></iframe>
                ) : (
                  <video
                    src={data.videoUrl}
                    controls
                    style={{ maxWidth: '100%', borderRadius: '12px' }}
                  ></video>
                )}
              </div>
            )}

            {/* Virtual Gifts - Bursting interactive items */}
            {data.gifts && data.gifts.length > 0 && (
              <div className="rc-gifts" id="rc-gifts">
                <h3 className="rc-gifts-title">
                  <i className="fa-solid fa-gift"></i> Your Virtual Gifts
                </h3>
                <div className="rc-gifts-grid" id="rc-gifts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px', marginTop: '16px' }}>
                  {data.gifts.map((g, idx) => (
                    <InteractiveGift key={idx} gift={g} idx={idx} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rc-footer">
            <button
              id="replay-btn"
              className="btn btn-small"
              onClick={handleReplay}
            >
              <i className="fa-solid fa-rotate-left"></i> Replay
            </button>
            <a
              href={window.location.pathname}
              className="btn btn-primary btn-small"
            >
              <i className="fa-solid fa-pen"></i> Make Your Own
            </a>
          </div>
        </div>
      )}
    </>
  );
}
