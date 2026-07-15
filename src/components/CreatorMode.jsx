import React, { useState, useRef, useEffect } from 'react';
import { encodeData, getYouTubeId, calcAge } from '../utils';
import ParticleCanvas from './ParticleCanvas';

// Helper to get CSS textShadow based on selected style
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

export default function CreatorMode() {
  // Form states
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [lockUntilBirthday, setLockUntilBirthday] = useState(true); // new bypass option
  const [theme, setTheme] = useState('party');
  const [hasSeal, setHasSeal] = useState(true); // sealed vs unsealed
  // Custom theme states
  const [customBgColor, setCustomBgColor] = useState('#FFF8F0');
  const [customCardBgColor, setCustomCardBgColor] = useState('#FFFFFF');
  const [customTextColor, setCustomTextColor] = useState('#3D2C2C');
  const [customAccentColor, setCustomAccentColor] = useState('#FF6B6B');
  const [animation, setAnimation] = useState('confetti');
  
  // Unwrap customizer states
  const [unwrapType, setUnwrapType] = useState('envelope');
  const [unwrapColor, setUnwrapColor] = useState('#ff6b6b');
  const [sealColor, setSealColor] = useState('#d63031');
  const [sealEmblem, setSealEmblem] = useState('🎂');
  const [customSeal, setCustomSeal] = useState('');
  const [uploadedSealBase64, setUploadedSealBase64] = useState(''); // base64 seal upload
  const [sealFileName, setSealFileName] = useState('');

  // Rich Text Editor typography states
  const [fontFamily, setFontFamily] = useState('Poppins');
  const [fontSize, setFontSize] = useState('4'); // Medium
  const [textColor, setTextColor] = useState('#333333');
  const [wordart, setWordart] = useState('none');
  const [textAlign, setTextAlign] = useState('center');
  const [messageHTML, setMessageHTML] = useState('');
  
  // New typography options
  const [fontWeight, setFontWeight] = useState('400');
  const [letterSpacing, setLetterSpacing] = useState('normal');
  const [lineHeight, setLineHeight] = useState('1.5');
  const [textShadow, setTextShadow] = useState('none');

  // Media states
  const [mediaTab, setMediaTab] = useState('tab-image');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [uploadedImageBase64, setUploadedImageBase64] = useState('');
  const [uploadedVideoBase64, setUploadedVideoBase64] = useState('');
  const [uploadedAudioBase64, setUploadedAudioBase64] = useState('');

  const [imageFileName, setImageFileName] = useState('No image selected');
  const [videoFileName, setVideoFileName] = useState('No video selected');
  const [audioFileName, setAudioFileName] = useState('No audio selected');

  // Gifts states
  const [gifts, setGifts] = useState([]);

  // Animation preview state
  const [previewAnimActive, setPreviewAnimActive] = useState(false);

  // Link Modal state
  const [shareLinkUrl, setShareLinkUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copyStatusText, setCopyStatusText] = useState('Copy');

  const editorRef = useRef(null);
  const unwrapColorInputRef = useRef(null);
  const sealColorInputRef = useRef(null);
  const sealImageFileInputRef = useRef(null);

  // Sync theme changes with body class
  useEffect(() => {
    if (theme === 'custom') {
      const cardInk = getContrastColor(customCardBgColor);
      const btnText = getContrastColor(customAccentColor);
      document.body.style.setProperty('--bg', customBgColor);
      document.body.style.setProperty('--card-bg', customCardBgColor);
      document.body.style.setProperty('--text', customTextColor);
      document.body.style.setProperty('--accent', customAccentColor);
      document.body.style.setProperty('--btn-text-color', btnText);
      document.body.style.setProperty('--border-color', cardInk === '#3D2C2C' ? '#F0D9C6' : '#3a3a5c');
      document.body.style.setProperty('--shadow', `0 6px 24px ${customAccentColor}22`);
      document.body.className = 'theme-custom';
    } else {
      document.body.style.removeProperty('--bg');
      document.body.style.removeProperty('--card-bg');
      document.body.style.removeProperty('--text');
      document.body.style.removeProperty('--accent');
      document.body.style.removeProperty('--btn-text-color');
      document.body.style.removeProperty('--border-color');
      document.body.style.removeProperty('--shadow');
      document.body.className = theme !== 'party' ? `theme-${theme}` : '';
    }
  }, [theme, customBgColor, customCardBgColor, customTextColor, customAccentColor]);

  // Handle editor commands
  const handleEditorCommand = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      setMessageHTML(editorRef.current.innerHTML);
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setMessageHTML(editorRef.current.innerHTML);
    }
  };

  // Image compression helpers
  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxDim = 400; // Limit image dimension for shorter urls
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6); // 60% quality
        callback(compressedBase64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Compress custom seal image heavily (e.g. 60x60) to keep base64 string extremely short
  const compressSealImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 60;
        canvas.height = 60;
        ctx.drawImage(img, 0, 0, 60, 60);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5); // 50% quality
        callback(compressedBase64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // File Upload Handlers
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFileName(file.name);
      setImageUrl(''); // Clear url input to avoid conflict
      compressImage(file, (base64) => {
        setUploadedImageBase64(base64);
      });
    } else {
      setImageFileName('No image selected');
      setUploadedImageBase64('');
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        alert('⚠️ Video too large! Keep files under 1.5MB or paste a direct web URL.');
        e.target.value = '';
        setVideoFileName('No video selected');
        setUploadedVideoBase64('');
        return;
      }
      setVideoFileName(file.name);
      setVideoUrl(''); // Clear url input
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedVideoBase64(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setVideoFileName('No video selected');
      setUploadedVideoBase64('');
    }
  };

  const handleAudioFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        alert('⚠️ Audio too large! Keep files under 1.5MB or paste a direct web URL.');
        e.target.value = '';
        setAudioFileName('No audio selected');
        setUploadedAudioBase64('');
        return;
      }
      setAudioFileName(file.name);
      setAudioUrl(''); // Clear url input
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedAudioBase64(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setAudioFileName('No audio selected');
      setUploadedAudioBase64('');
    }
  };

  // Seal Custom Image File upload
  const handleSealFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSealFileName(file.name);
      setCustomSeal(''); // clear custom initials
      compressSealImage(file, (base64) => {
        setUploadedSealBase64(base64);
        setSealEmblem(base64);
      });
    } else {
      setSealFileName('');
      setUploadedSealBase64('');
    }
  };

  // Gift rows
  const addGiftRow = () => {
    if (gifts.length >= 5) return;
    setGifts([...gifts, { id: Date.now(), title: '', url: '' }]);
  };

  const removeGiftRow = (id) => {
    setGifts(gifts.filter((g) => g.id !== id));
  };

  const updateGiftRow = (id, field, val) => {
    setGifts(
      gifts.map((g) => (g.id === id ? { ...g, [field]: val } : g))
    );
  };

  const handlePreviewAnim = () => {
    setPreviewAnimActive(true);
    setTimeout(() => {
      setPreviewAnimActive(false);
    }, 4000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !birthDate) {
      alert('Please fill in both the Name and Birthday Date!');
      return;
    }

    const finalImage = uploadedImageBase64 || imageUrl.trim();
    const finalVideo = uploadedVideoBase64 || videoUrl.trim();
    const finalAudio = uploadedAudioBase64 || audioUrl.trim();

    // Use custom seal image base64, custom letters text, or emblem symbol
    let finalEmblem = sealEmblem;
    if (customSeal.trim()) {
      finalEmblem = customSeal.trim().substring(0, 2);
    } else if (uploadedSealBase64) {
      finalEmblem = uploadedSealBase64;
    }

    const data = {
      name: name.trim(),
      date: birthDate,
      lockUntilBirthday, // lock override toggle
      theme,
      animation,
      // Custom theme details
      customBgColor: theme === 'custom' ? customBgColor : undefined,
      customCardBgColor: theme === 'custom' ? customCardBgColor : undefined,
      customTextColor: theme === 'custom' ? customTextColor : undefined,
      customAccentColor: theme === 'custom' ? customAccentColor : undefined,
      // Unwrap Customizations
      unwrapType,
      hasSeal,
      unwrapColor,
      sealColor,
      sealEmblem: finalEmblem,
      // Typography
      messageHTML,
      wordart,
      fontFamily,
      fontSize: {
        '3': '0.9rem',
        '4': '1.1rem',
        '5': '1.4rem',
        '6': '1.8rem',
      }[fontSize] || '1.1rem',
      textColor,
      textAlign,
      fontWeight,
      letterSpacing,
      lineHeight,
      textShadow,
      // Media
      imageUrl: finalImage,
      videoUrl: finalVideo,
      audioUrl: finalAudio,
      // Gifts
      gifts: gifts
        .map((g) => ({ title: g.title.trim(), url: g.url.trim() }))
        .filter((g) => g.url.trim() !== ''), // keep gifts as long as URL exists!
    };

    const encoded = encodeData(data);
    const fullUrl = `${window.location.origin}${window.location.pathname}#card=${encoded}`;
    setShareLinkUrl(fullUrl);
    setIsModalOpen(true);
  };

  const copyToClipboard = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareLinkUrl).then(() => {
        setCopyStatusText('Copied!');
        setTimeout(() => setCopyStatusText('Copy'), 2000);
      });
    } else {
      const input = document.getElementById('share-link-input');
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopyStatusText('Copied!');
        setTimeout(() => setCopyStatusText('Copy'), 2000);
      }
    }
  };

  return (
    <section id="creator-section" className="active">
      <header className="creator-hero">
        <div className="doodle doodle-star top-left">&#9733;</div>
        <div className="doodle doodle-heart top-right">&#9829;</div>
        <h1 className="hero-title">
          <span className="hero-cake">&#127874;</span>
          Birthday Surprise Maker
        </h1>
        <p className="hero-sub">
          Put together a beautiful, custom birthday greeting. They won't be able to open it until the big day!
        </p>
      </header>

      <div className="creator-layout">
        {/* LEFT: Creator Form */}
        <div className="card form-card">
          <form onSubmit={handleSubmit} autoComplete="off">
            {/* 1. Name */}
            <div className="field">
              <label htmlFor="input-name">
                <span className="field-icon">&#127880;</span> Birthday Person's Name
              </label>
              <input
                type="text"
                id="input-name"
                placeholder="Their name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* 2. Date + Lock Override toggle */}
            <div className="field">
              <label htmlFor="input-date">
                <span className="field-icon">&#128197;</span> Birthday Date
              </label>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <input
                  type="date"
                  id="input-date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
                
                {/* Lock Bypass switch */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, userSelect: 'none', background: 'rgba(0,0,0,0.04)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={lockUntilBirthday}
                    onChange={(e) => setLockUntilBirthday(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span>{lockUntilBirthday ? '🔒 Lock Card' : '🔓 Unlock Immediately'}</span>
                </label>
              </div>
              <p className="field-hint">
                {lockUntilBirthday 
                  ? 'Recipients will be blocked by a countdown until their birthday!'
                  : 'Surprise card can be opened immediately, even before their birthday.'}
              </p>
            </div>

            {/* 3. Vibe Theme Picker */}
            <div className="field">
              <label><span className="field-icon">&#127912;</span> Card Theme Vibe</label>
              <div className="theme-picker">
                {[
                  { value: 'party', label: 'Party Pop', class: 'swatch-party' },
                  { value: 'night', label: 'Dreamy Night', class: 'swatch-night' },
                  { value: 'garden', label: 'Garden Party', class: 'swatch-garden' },
                  { value: 'groovy', label: 'Retro Groovy', class: 'swatch-groovy' },
                  { value: 'custom', label: '🎨 Custom Theme', class: 'swatch-custom' },
                ].map((t) => (
                  <label 
                    key={t.value} 
                    className={`theme-chip ${theme === t.value ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={t.value}
                      checked={theme === t.value}
                      onChange={() => setTheme(t.value)}
                    />
                    <span className={`chip-swatch ${t.class}`}></span>
                    {t.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Theme Color Customizers */}
            {theme === 'custom' && (
              <div className="field" style={{ background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
                <label style={{ fontSize: '0.9rem', marginBottom: '12px' }}>🎨 Build Your Custom Theme</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem' }}>Background Color</label>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                      <input type="color" value={customBgColor} onChange={(e) => setCustomBgColor(e.target.value)} className="color-picker-swatch" />
                      <input type="text" value={customBgColor} onChange={(e) => setCustomBgColor(e.target.value)} style={{ padding: '6px', fontSize: '0.8rem', width: '80px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem' }}>Card Background</label>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                      <input type="color" value={customCardBgColor} onChange={(e) => setCustomCardBgColor(e.target.value)} className="color-picker-swatch" />
                      <input type="text" value={customCardBgColor} onChange={(e) => setCustomCardBgColor(e.target.value)} style={{ padding: '6px', fontSize: '0.8rem', width: '80px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem' }}>Text Color</label>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                      <input type="color" value={customTextColor} onChange={(e) => setCustomTextColor(e.target.value)} className="color-picker-swatch" />
                      <input type="text" value={customTextColor} onChange={(e) => setCustomTextColor(e.target.value)} style={{ padding: '6px', fontSize: '0.8rem', width: '80px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem' }}>Accent Color</label>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                      <input type="color" value={customAccentColor} onChange={(e) => setCustomAccentColor(e.target.value)} className="color-picker-swatch" />
                      <input type="text" value={customAccentColor} onChange={(e) => setCustomAccentColor(e.target.value)} style={{ padding: '6px', fontSize: '0.8rem', width: '80px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Particle Reveal Animation Picker */}
            <div className="field">
              <label><span className="field-icon">&#10024;</span> Particle Reveal Animation</label>
              <div className="animation-picker">
                {[
                  { value: 'confetti', emoji: '🎉', label: 'Confetti' },
                  { value: 'balloons', emoji: '🎈', label: 'Balloons' },
                  { value: 'sparkles', emoji: '✨', label: 'Sparkles' },
                  { value: 'hearts', emoji: '💖', label: 'Hearts' },
                  { value: 'fireworks', emoji: '🎆', label: 'Fireworks' },
                  { value: 'pixel', emoji: '👾', label: 'Pixel Pop' },
                  { value: 'ribbon', emoji: '🎗️', label: 'Ribbons' },
                  { value: 'curtains', emoji: '🎭', label: 'Curtains' },
                  { value: 'spacewarp', emoji: '🚀', label: 'Space Warp' },
                  { value: 'gate', emoji: '⛩️', label: 'Gates' },
                  { value: 'sakura', emoji: '🌸', label: 'Sakura Fall' },
                  { value: 'snow', emoji: '❄️', label: 'Snow Drift' },
                  { value: 'bubbles', emoji: '🫧', label: 'Bubbles' },
                  { value: 'butterflies', emoji: '🦋', label: 'Butterflies' },
                  { value: 'stars', emoji: '⭐', label: 'Star Shower' },
                  { value: 'leaves', emoji: '🍃', label: 'Leaves Rustle' },
                  { value: 'wisps', emoji: '💨', label: 'Ghost Wisps' },
                ].map((a) => (
                  <label 
                    key={a.value} 
                    className={`anim-chip ${animation === a.value ? 'active' : ''}`}
                    style={{ minWidth: '76px' }}
                  >
                    <input
                      type="radio"
                      name="animation"
                      value={a.value}
                      checked={animation === a.value}
                      onChange={() => setAnimation(a.value)}
                    />
                    <span className="anim-emoji">{a.emoji}</span>
                    {a.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Customize unwrap */}
            <div className="field" style={{ background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
              <label style={{ fontSize: '1.05rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>
                <span className="field-icon">🎁</span> Customize Unwrap Screen
              </label>

              {/* Unwrap Style (envelope, scroll, book) */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.85rem' }}>Select Unwrap Type</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  {[
                    { value: 'envelope', label: '✉️ 3D Envelope' },
                    { value: 'scroll', label: '📜 Royal Scroll' },
                    { value: 'book', label: '📖 Memory Book' },
                    { value: 'scratch', label: '🎨 Scratch Card' },
                    { value: 'giftbox', label: '🎁 Gift Box Pop' },
                  ].map((styleOpt) => (
                    <button
                      key={styleOpt.value}
                      type="button"
                      className={`btn btn-dashed ${unwrapType === styleOpt.value ? 'btn-primary' : ''}`}
                      style={{ flex: 1, padding: '10px', borderRadius: '10px' }}
                      onClick={() => setUnwrapType(styleOpt.value)}
                    >
                      {styleOpt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unwrap Body Color & Seal Color Pickers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem' }}>Unwrap Color</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                    <input
                      type="color"
                      value={unwrapColor}
                      onChange={(e) => setUnwrapColor(e.target.value)}
                      className="color-picker-swatch"
                      title="Choose Unwrap Color"
                    />
                    <input 
                      type="text" 
                      value={unwrapColor} 
                      onChange={(e) => setUnwrapColor(e.target.value)}
                      style={{ width: '80px', padding: '6px 8px', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', textTransform: 'uppercase' }}
                    />
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1 }}>
                      {['#ff6b6b', '#FF9F43', '#48DBFB', '#95B88C', '#7B2D8E', '#e84393'].map((c) => (
                        <span
                          key={c}
                          style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: c, border: '1.5px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', cursor: 'pointer', display: 'inline-block' }}
                          onClick={() => setUnwrapColor(c)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem' }}>Wax Seal Color</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                    <input
                      type="color"
                      value={sealColor}
                      onChange={(e) => setSealColor(e.target.value)}
                      className="color-picker-swatch"
                      title="Choose Wax Seal Color"
                    />
                    <input 
                      type="text" 
                      value={sealColor} 
                      onChange={(e) => setSealColor(e.target.value)}
                      style={{ width: '80px', padding: '6px 8px', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', textTransform: 'uppercase' }}
                    />
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1 }}>
                      {['#d63031', '#F1C40F', '#2C3E50', '#27AE60', '#D35400', '#8e44ad'].map((c) => (
                        <span
                          key={c}
                          style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: c, border: '1.5px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', cursor: 'pointer', display: 'inline-block' }}
                          onClick={() => setSealColor(c)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Wax Seal Option: Sealed vs Unsealed */}
              <div style={{ marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                <label style={{ fontSize: '0.85rem' }}>Wax Seal Attachment</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    className={`btn btn-dashed ${hasSeal ? 'btn-primary' : ''}`}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px' }}
                    onClick={() => setHasSeal(true)}
                  >
                    🔒 Sealed (Tap/Swipe to break)
                  </button>
                  <button
                    type="button"
                    className={`btn btn-dashed ${!hasSeal ? 'btn-primary' : ''}`}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px' }}
                    onClick={() => setHasSeal(false)}
                  >
                    🔓 No Seal (Open directly)
                  </button>
                </div>
              </div>

              {/* Seal Emblem Options (Emojis & Custom Letter & Custom Image Upload) */}
              <div style={{ display: hasSeal ? 'block' : 'none' }}>
                <label style={{ fontSize: '0.85rem' }}>Seal Emblem (Symbol or Image)</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px', marginBottom: '10px' }}>
                  {['🎂', '❤️', '⭐', '👑', '🎁', '🌸', '⚡', '🦄', '🔑', '🐉'].map((symbol) => (
                    <button
                      key={symbol}
                      type="button"
                      className="btn btn-small"
                      style={{ fontSize: '1.2rem', padding: '6px 10px', borderRadius: '8px', backgroundColor: sealEmblem === symbol && !customSeal && !uploadedSealBase64 ? 'rgba(255,107,107,0.15)' : 'transparent', border: sealEmblem === symbol && !customSeal && !uploadedSealBase64 ? '1px solid var(--accent)' : '1px solid var(--border-color)' }}
                      onClick={() => {
                        setSealEmblem(symbol);
                        setCustomSeal('');
                        setUploadedSealBase64('');
                        setSealFileName('');
                      }}
                    >
                      {symbol}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
                  {/* Custom initials */}
                  <input
                    type="text"
                    placeholder="Custom Letters (e.g. JB)"
                    value={customSeal}
                    onChange={(e) => {
                      const val = e.target.value.substring(0, 2);
                      setCustomSeal(val);
                      if (val) {
                        setSealEmblem(val);
                        setUploadedSealBase64('');
                        setSealFileName('');
                      }
                    }}
                    style={{ width: '160px', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}
                  />

                  {/* Custom image upload for wax seal emblem */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      ref={sealImageFileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleSealFileChange}
                    />
                    <button
                      type="button"
                      className={`btn btn-small ${uploadedSealBase64 ? 'btn-primary' : ''}`}
                      onClick={() => sealImageFileInputRef.current.click()}
                      style={{ borderRadius: '8px', padding: '8px 12px' }}
                    >
                      <i className="fa-solid fa-camera"></i> {uploadedSealBase64 ? 'Seal Uploaded' : 'Upload Seal Image'}
                    </button>
                    {sealFileName && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sealFileName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Rich Text Typography Message Editor */}
            <div className="field">
              <label><span className="field-icon">&#9997;&#65039;</span> Write Your Birthday Message</label>
              <div className="editor-wrap">
                <div className="editor-toolbar">
                  {/* Font Family selector (16 options) */}
                  <select 
                    id="font-family" 
                    title="Font Family" 
                    value={fontFamily}
                    onChange={(e) => {
                      setFontFamily(e.target.value);
                      handleEditorCommand('fontName', e.target.value);
                    }}
                  >
                    <option value="Poppins">Poppins</option>
                    <option value="Fredoka">Fredoka</option>
                    <option value="Caveat">Caveat</option>
                    <option value="Playfair Display">Playfair</option>
                    <option value="Lobster">Lobster</option>
                    <option value="Courier Prime">Typewriter</option>
                    <option value="Pacifico">Pacifico</option>
                    <option value="Dancing Script">Dancing Script</option>
                    <option value="Great Vibes">Great Vibes</option>
                    <option value="Press Start 2P">Press Start 2P</option>
                    <option value="Cinzel">Cinzel</option>
                    <option value="Special Elite">Special Elite</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Oswald">Oswald</option>
                    <option value="Sacramento">Sacramento</option>
                    <option value="Satisfy">Satisfy</option>
                  </select>

                  {/* Font Size selector */}
                  <select 
                    id="font-size" 
                    title="Font Size"
                    value={fontSize}
                    onChange={(e) => {
                      setFontSize(e.target.value);
                      handleEditorCommand('fontSize', e.target.value);
                    }}
                  >
                    <option value="3">Small</option>
                    <option value="4">Medium</option>
                    <option value="5">Large</option>
                    <option value="6">X-Large</option>
                  </select>

                  <div className="toolbar-sep"></div>

                  <button type="button" className="tb-btn" onClick={() => handleEditorCommand('bold')} title="Bold">
                    <i className="fa-solid fa-bold"></i>
                  </button>
                  <button type="button" className="tb-btn" onClick={() => handleEditorCommand('italic')} title="Italic">
                    <i className="fa-solid fa-italic"></i>
                  </button>
                  <button type="button" className="tb-btn" onClick={() => handleEditorCommand('underline')} title="Underline">
                    <i className="fa-solid fa-underline"></i>
                  </button>
                  <button type="button" className="tb-btn" onClick={() => handleEditorCommand('strikeThrough')} title="Strikethrough">
                    <i className="fa-solid fa-strikethrough"></i>
                  </button>

                  <div className="toolbar-sep"></div>

                  {/* Text Color */}
                  <input 
                    type="color" 
                    id="text-color" 
                    title="Text Color" 
                    className="color-picker-swatch tb-color-swatch"
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value);
                      handleEditorCommand('foreColor', e.target.value);
                    }}
                  />

                  <div className="toolbar-sep"></div>

                  <button 
                    type="button" 
                    className="tb-btn" 
                    onClick={() => {
                      setTextAlign('left');
                      if (editorRef.current) editorRef.current.style.textAlign = 'left';
                    }} 
                    title="Align Left"
                  >
                    <i className="fa-solid fa-align-left"></i>
                  </button>
                  <button 
                    type="button" 
                    className="tb-btn" 
                    onClick={() => {
                      setTextAlign('center');
                      if (editorRef.current) editorRef.current.style.textAlign = 'center';
                    }} 
                    title="Center"
                  >
                    <i className="fa-solid fa-align-center"></i>
                  </button>
                  <button 
                    type="button" 
                    className="tb-btn" 
                    onClick={() => {
                      setTextAlign('right');
                      if (editorRef.current) editorRef.current.style.textAlign = 'right';
                    }} 
                    title="Align Right"
                  >
                    <i className="fa-solid fa-align-right"></i>
                  </button>

                  <div className="toolbar-sep"></div>

                  {/* WordArt Styles */}
                  <select 
                    id="wordart-picker" 
                    title="WordArt Style"
                    value={wordart}
                    onChange={(e) => setWordart(e.target.value)}
                  >
                    <option value="none">No WordArt</option>
                    <option value="rainbow">🌈 Rainbow</option>
                    <option value="shadow-pop">💥 Shadow Pop</option>
                    <option value="glow">💫 Neon Glow</option>
                    <option value="outline">✍️ Outline</option>
                    <option value="wavy">🌊 Wavy</option>
                    <option value="retro3d">🎮 Retro 3D</option>
                    <option value="sunset">🌅 Sunset Gradient</option>
                    <option value="glitch">👾 Glitch Effect</option>
                    <option value="comic">💥 Comic Pop</option>
                    <option value="flame">🔥 Flame Fire</option>
                    <option value="chrome">💿 Metallic Chrome</option>
                    <option value="pixel">👾 Pixel Retro</option>
                  </select>
                </div>

                {/* Typography controls block */}
                <div className="editor-sub-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', background: 'rgba(0,0,0,0.01)', padding: '10px 14px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                  {/* Font Weight picker */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0 }}>
                    <span>Weight:</span>
                    <select value={fontWeight} onChange={(e) => setFontWeight(e.target.value)} style={{ padding: '4px 6px', fontSize: '0.78rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '90px' }}>
                      <option value="300">Light</option>
                      <option value="400">Regular</option>
                      <option value="500">Medium</option>
                      <option value="600">SemiBold</option>
                      <option value="700">Bold</option>
                      <option value="800">ExtraBold</option>
                    </select>
                  </label>

                  {/* Letter Spacing picker */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0 }}>
                    <span>Spacing:</span>
                    <select value={letterSpacing} onChange={(e) => setLetterSpacing(e.target.value)} style={{ padding: '4px 6px', fontSize: '0.78rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100px' }}>
                      <option value="normal">Normal</option>
                      <option value="2px">Wide</option>
                      <option value="4px">Extra Wide</option>
                      <option value="6px">Retro Spread</option>
                    </select>
                  </label>

                  {/* Line Height picker */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0 }}>
                    <span>Line Height:</span>
                    <select value={lineHeight} onChange={(e) => setLineHeight(e.target.value)} style={{ padding: '4px 6px', fontSize: '0.78rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '80px' }}>
                      <option value="1.2">Normal</option>
                      <option value="1.5">Medium</option>
                      <option value="1.8">Loose</option>
                      <option value="2.2">Double</option>
                    </select>
                  </label>

                  {/* Text Glow / Shadow effects */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: 0 }}>
                    <span>Glow/Shadow:</span>
                    <select value={textShadow} onChange={(e) => setTextShadow(e.target.value)} style={{ padding: '4px 6px', fontSize: '0.78rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100px' }}>
                      <option value="none">None</option>
                      <option value="soft">Soft Glow</option>
                      <option value="neon">Neon Sparkle</option>
                      <option value="retro">3D Shadow</option>
                      <option value="royal">Golden Outline</option>
                    </select>
                  </label>
                </div>

                <div 
                  ref={editorRef}
                  id="message-editor" 
                  className={`editor-area wordart-${wordart}`}
                  contentEditable="true" 
                  onInput={handleEditorInput}
                  data-placeholder="Type your heartfelt birthday message here..."
                  style={{
                    fontFamily,
                    color: textColor,
                    textAlign,
                    fontWeight,
                    letterSpacing,
                    lineHeight,
                    textShadow: getShadowStyle(textShadow),
                    fontSize: {
                      '3': '0.9rem',
                      '4': '1.1rem',
                      '5': '1.4rem',
                      '6': '1.8rem',
                    }[fontSize] || '1.1rem',
                  }}
                />
              </div>
            </div>

            {/* 6. Attach Media */}
            <div className="field">
              <label><span className="field-icon">&#128247;</span> Attach Media <span className="optional-tag">optional</span></label>
              <div className="media-tabs">
                <button 
                  type="button" 
                  className={`mtab ${mediaTab === 'tab-image' ? 'active' : ''}`}
                  onClick={() => setMediaTab('tab-image')}
                >
                  <i className="fa-solid fa-image"></i> Image
                </button>
                <button 
                  type="button" 
                  className={`mtab ${mediaTab === 'tab-video' ? 'active' : ''}`}
                  onClick={() => setMediaTab('tab-video')}
                >
                  <i className="fa-solid fa-video"></i> Video
                </button>
                <button 
                  type="button" 
                  className={`mtab ${mediaTab === 'tab-audio' ? 'active' : ''}`}
                  onClick={() => setMediaTab('tab-audio')}
                >
                  <i className="fa-solid fa-music"></i> Audio
                </button>
              </div>

              <div className="media-panes">
                {mediaTab === 'tab-image' && (
                  <div id="tab-image" className="mpane active">
                    <input 
                      type="url" 
                      placeholder="Paste an image URL (Imgur, Unsplash, etc.)"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setUploadedImageBase64('');
                        setImageFileName('No image selected');
                      }}
                    />
                    <div className="upload-divider"><span>or</span></div>
                    <div className="file-upload-box">
                      <input 
                        type="file" 
                        id="image-file" 
                        accept="image/*" 
                        className="file-input"
                        onChange={handleImageFileChange}
                      />
                      <label htmlFor="image-file" className="file-label">
                        <i className="fa-solid fa-cloud-arrow-up"></i> Upload Image
                      </label>
                      <span className="file-name-display">{imageFileName}</span>
                    </div>
                  </div>
                )}

                {mediaTab === 'tab-video' && (
                  <div id="tab-video" className="mpane active">
                    <input 
                      type="url" 
                      placeholder="YouTube link or direct video URL"
                      value={videoUrl}
                      onChange={(e) => {
                        setVideoUrl(e.target.value);
                        setUploadedVideoBase64('');
                        setVideoFileName('No video selected');
                      }}
                    />
                    <div className="upload-divider"><span>or</span></div>
                    <div className="file-upload-box">
                      <input 
                        type="file" 
                        id="video-file" 
                        accept="video/*" 
                        className="file-input"
                        onChange={handleVideoFileChange}
                      />
                      <label htmlFor="video-file" className="file-label">
                        <i className="fa-solid fa-cloud-arrow-up"></i> Upload Video
                      </label>
                      <span className="file-name-display">{videoFileName}</span>
                    </div>
                  </div>
                )}

                {mediaTab === 'tab-audio' && (
                  <div id="tab-audio" className="mpane active">
                    <input 
                      type="url" 
                      placeholder="Direct MP3 link for background music"
                      value={audioUrl}
                      onChange={(e) => {
                        setAudioUrl(e.target.value);
                        setUploadedAudioBase64('');
                        setAudioFileName('No audio selected');
                      }}
                    />
                    <div className="upload-divider"><span>or</span></div>
                    <div className="file-upload-box">
                      <input 
                        type="file" 
                        id="audio-file" 
                        accept="audio/*" 
                        className="file-input"
                        onChange={handleAudioFileChange}
                      />
                      <label htmlFor="audio-file" className="file-label">
                        <i className="fa-solid fa-cloud-arrow-up"></i> Upload Audio
                      </label>
                      <span className="file-name-display">{audioFileName}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 7. Virtual Gifts */}
            <div className="field">
              <label><span className="field-icon">&#127873;</span> Virtual Gifts <span className="optional-tag">optional</span></label>
              <div id="gifts-list">
                {gifts.map((g) => (
                  <div className="gift-row" key={g.id}>
                    <input 
                      type="text" 
                      className="gift-title" 
                      placeholder="Gift name (optional)"
                      value={g.title}
                      onChange={(e) => updateGiftRow(g.id, 'title', e.target.value)}
                    />
                    <input 
                      type="url" 
                      className="gift-url" 
                      placeholder="Link (Amazon, Steam, song link etc.)"
                      value={g.url}
                      onChange={(e) => updateGiftRow(g.id, 'url', e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="gift-remove-btn"
                      onClick={() => removeGiftRow(g.id)}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                ))}
              </div>
              {gifts.length < 5 && (
                <button 
                  type="button" 
                  id="add-gift-btn" 
                  className="btn btn-dashed"
                  onClick={addGiftRow}
                >
                  <i className="fa-solid fa-plus"></i> Add a gift link
                </button>
              )}
            </div>

            {/* Form Submit */}
            <button type="submit" className="btn btn-primary btn-big">
              <i className="fa-solid fa-paper-plane"></i> Create &amp; Get Shareable Link
            </button>
          </form>
        </div>

        {/* RIGHT: Live Preview Column */}
        <div className="preview-col">
          <div className="card preview-card">
            <div className="preview-top-bar">
              <span className="preview-badge"><i className="fa-solid fa-eye"></i> Live Preview</span>
              <button 
                type="button" 
                id="preview-anim-btn" 
                className="btn btn-small"
                onClick={handlePreviewAnim}
              >
                <i className="fa-solid fa-play"></i> Preview Animation
              </button>
            </div>
            
            <div className="preview-frame" id="preview-frame">
              {/* ParticleCanvas overlay inside preview */}
              <ParticleCanvas type={animation} active={previewAnimActive} isPreview={true} />

              <div className="preview-inner" id="preview-inner">
                {birthDate && (
                  <div className="prev-age-badge" id="prev-age">
                    {calcAge(birthDate)} years young!
                  </div>
                )}
                <h2 className="prev-name" id="prev-name">
                  {name ? `Happy Birthday, ${name}!` : 'Happy Birthday!'}
                </h2>
                
                <div 
                  className={`prev-message wordart-${wordart}`} 
                  id="prev-message"
                  style={{
                    fontFamily,
                    color: textColor,
                    textAlign,
                    fontWeight,
                    letterSpacing,
                    lineHeight,
                    textShadow: getShadowStyle(textShadow),
                    fontSize: {
                      '3': '0.9rem',
                      '4': '1.1rem',
                      '5': '1.4rem',
                      '6': '1.8rem',
                    }[fontSize] || '1.1rem',
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: messageHTML || '<p style="color:#999;font-style:italic;">Your message will appear here&hellip;</p>' 
                  }}
                />

                {/* Preview media pane */}
                {((mediaTab === 'tab-image' && (uploadedImageBase64 || imageUrl.trim())) ||
                  (mediaTab === 'tab-video' && (uploadedVideoBase64 || videoUrl.trim())) ||
                  (mediaTab === 'tab-audio' && (uploadedAudioBase64 || audioUrl.trim()))) && (
                  <div className="prev-media" id="prev-media">
                    {mediaTab === 'tab-image' && (
                      <img 
                        src={uploadedImageBase64 || imageUrl} 
                        alt="Preview" 
                        style={{ maxWidth: '100%', borderRadius: '8px' }} 
                      />
                    )}
                    {mediaTab === 'tab-video' && (
                      getYouTubeId(videoUrl) ? (
                        <iframe 
                          src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}`} 
                          width="100%" 
                          height="150" 
                          frameBorder="0" 
                          allowFullScreen 
                          style={{ borderRadius: '8px' }}
                        ></iframe>
                      ) : (
                        <video 
                          src={uploadedVideoBase64 || videoUrl} 
                          controls 
                          style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '150px' }}
                        ></video>
                      )
                    )}
                    {mediaTab === 'tab-audio' && (
                      <audio 
                        src={uploadedAudioBase64 || audioUrl} 
                        controls 
                        style={{ width: '100%', marginTop: '10px' }}
                      ></audio>
                    )}
                  </div>
                )}

                {/* Preview Gifts */}
                {gifts.some((g) => g.url.trim()) && (
                  <div className="prev-gifts" id="prev-gifts">
                    {gifts.map((g) => (
                      g.url.trim() && (
                        <span className="prev-gift-badge" key={g.id}>
                          🎁 {g.title.trim() || 'Virtual Gift'}
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SHARE LINK MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" id="link-modal" onClick={() => setIsModalOpen(false)}>
          <div className="card modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">&#127881;</div>
            <h2>Your surprise link is ready!</h2>
            <p>Copy this link and send it to them. They won't be able to peek — it only opens on their birthday.</p>
            <div className="link-copy-row">
              <input 
                type="text" 
                id="share-link-input"
                value={shareLinkUrl} 
                readOnly 
              />
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={copyToClipboard}
              >
                <i className="fa-solid fa-copy"></i> {copyStatusText}
              </button>
            </div>
            {shareLinkUrl.length > 4000 && (
              <p className="link-warning-text" id="link-size-warning" style={{ fontSize: '0.8rem', color: '#e8751a', marginTop: '8px', fontWeight: '500', textAlign: 'left', background: '#fff5e8', border: '1px solid #ead5b8', padding: '10px', borderRadius: '8px' }}>
                <i className="fa-solid fa-circle-exclamation"></i> <strong>Note:</strong> The link is quite long because of the uploaded media. It will work perfectly when opened, but some messaging apps might have trouble auto-linking it. You can shorten it using a free link shortener if needed!
              </p>
            )}
            <button 
              type="button" 
              className="btn btn-ghost" 
              style={{ marginTop: '10px' }}
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
