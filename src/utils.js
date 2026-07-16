import LZString from 'lz-string';

// ── Encode / Decode with LZString ──────────────────────
// Data is already abbreviated by the caller — we just compress.
export function encodeData(obj) {
  // Strip undefined/null/empty values to shrink payload
  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined && val !== '' && val !== null) {
      clean[key] = val;
    }
  }
  const json = JSON.stringify(clean);
  // Use LZString URI-safe compression
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeData(str) {
  try {
    // Try LZString decompression first (new format)
    let json = LZString.decompressFromEncodedURIComponent(str);
    if (json) {
      return JSON.parse(json);
    }
    // Fallback: old-style base64 encoding (backwards compat)
    json = decodeURIComponent(escape(atob(str)));
    return JSON.parse(json);
  } catch (e) {
    // Second fallback attempt with plain base64
    try {
      const json = decodeURIComponent(escape(atob(str)));
      return JSON.parse(json);
    } catch (e2) {
      return null;
    }
  }
}

// ── YouTube ID Extractor ───────────────────────────────
export function getYouTubeId(url) {
  if (!url) return null;
  const regex = /(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// ── Age Calculator ─────────────────────────────────────
export function calcAge(dateStr) {
  const birth = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// ── Occasion Configuration ─────────────────────────────
// Returns an object with all the labels/text needed for a given occasion.
// Property names match what CreatorMode.jsx and ReceiverMode.jsx expect.
export function getOccasionMeta(occasionId) {
  const configs = {
    birthday: {
      emoji: '🎂',
      heroTitle: 'Birthday Surprise Maker',
      heroSubtitle: "Put together a beautiful, custom birthday greeting. They won't be able to open it until the big day!",
      nameLabel: "Birthday Person's Name",
      namePlaceholder: 'Their name',
      dateLabel: 'Birthday Date',
      dateHint: 'The card will stay sealed until this date!',
      messageLabel: 'Write Your Birthday Message',
      messagePlaceholder: 'Type your heartfelt birthday message here...',
      // Receiver-side
      greeting: (name) => `Happy Birthday, ${name}!`,
      badgeText: (age) => `${age} years young!`,
      lockTitle: "This surprise isn't ready yet!",
      lockMessage: (dateFormatted) => `It's not your birthday yet! Come back on ${dateFormatted}.`,
      // Preview + modal
      previewGreeting: (name) => name ? `Happy Birthday, ${name}!` : 'Happy Birthday!',
      modalHint: 'their birthday',
    },
    congratulations: {
      emoji: '🎉',
      heroTitle: 'Congratulations Card Maker',
      heroSubtitle: 'Create a stunning congratulations card to celebrate their big moment!',
      nameLabel: "Recipient's Name",
      namePlaceholder: 'Their name',
      dateLabel: 'Special Date',
      dateHint: 'The card will stay sealed until this date!',
      messageLabel: 'Write Your Congratulations Message',
      messagePlaceholder: 'Write a wonderful congratulations message...',
      greeting: (name) => `Congratulations, ${name}!`,
      badgeText: () => '🎉 Amazing Achievement!',
      lockTitle: "This surprise isn't ready yet!",
      lockMessage: (dateFormatted) => `Come back on ${dateFormatted} to see your surprise!`,
      previewGreeting: (name) => name ? `Congratulations, ${name}!` : 'Congratulations!',
      modalHint: 'the special date',
    },
    'job-promotion': {
      emoji: '💼',
      heroTitle: 'Promotion Celebration Maker',
      heroSubtitle: 'Celebrate their big career move with a personalized surprise card!',
      nameLabel: "Their Name",
      namePlaceholder: 'Their name',
      dateLabel: 'Celebration Date',
      dateHint: 'The card will stay sealed until this date!',
      messageLabel: 'Write Your Promotion Message',
      messagePlaceholder: 'Congratulate them on their promotion...',
      greeting: (name) => `You Got Promoted, ${name}!`,
      badgeText: () => '💼 Moving Up!',
      lockTitle: "This surprise isn't ready yet!",
      lockMessage: (dateFormatted) => `Come back on ${dateFormatted} to see your surprise!`,
      previewGreeting: (name) => name ? `You Got Promoted, ${name}!` : 'Promotion Time!',
      modalHint: 'the celebration date',
    },
    'youre-hired': {
      emoji: '🎊',
      heroTitle: "You're Hired Card Maker",
      heroSubtitle: 'Welcome the new team member with a fun, personalized card!',
      nameLabel: "New Hire's Name",
      namePlaceholder: 'Their name',
      dateLabel: 'Start Date',
      dateHint: 'The card will stay sealed until their start date!',
      messageLabel: 'Write Your Welcome Message',
      messagePlaceholder: 'Welcome them to the team...',
      greeting: (name) => `Welcome Aboard, ${name}!`,
      badgeText: () => '🎊 New Beginnings!',
      lockTitle: "This surprise isn't ready yet!",
      lockMessage: (dateFormatted) => `Come back on ${dateFormatted} to see your surprise!`,
      previewGreeting: (name) => name ? `Welcome Aboard, ${name}!` : 'Welcome Aboard!',
      modalHint: 'their start date',
    },
    anniversary: {
      emoji: '💝',
      heroTitle: 'Anniversary Card Maker',
      heroSubtitle: 'Create a heartfelt anniversary surprise for your special someone!',
      nameLabel: "Their Name",
      namePlaceholder: "Partner's name or couple's names",
      dateLabel: 'Anniversary Date',
      dateHint: 'The card will stay sealed until your anniversary!',
      messageLabel: 'Write Your Anniversary Message',
      messagePlaceholder: 'Express your love and appreciation...',
      greeting: (name) => `Happy Anniversary, ${name}!`,
      badgeText: () => '💝 With All My Love',
      lockTitle: "This surprise isn't ready yet!",
      lockMessage: (dateFormatted) => `Come back on ${dateFormatted} to see your surprise!`,
      previewGreeting: (name) => name ? `Happy Anniversary, ${name}!` : 'Happy Anniversary!',
      modalHint: 'the anniversary',
    },
    graduation: {
      emoji: '🎓',
      heroTitle: 'Graduation Card Maker',
      heroSubtitle: 'Celebrate their graduation with a personalized surprise card!',
      nameLabel: "Graduate's Name",
      namePlaceholder: 'Their name',
      dateLabel: 'Graduation Date',
      dateHint: 'The card will stay sealed until graduation day!',
      messageLabel: 'Write Your Graduation Message',
      messagePlaceholder: 'Congratulate the graduate...',
      greeting: (name) => `Congratulations Graduate, ${name}!`,
      badgeText: () => '🎓 Class of ' + new Date().getFullYear(),
      lockTitle: "This surprise isn't ready yet!",
      lockMessage: (dateFormatted) => `Come back on ${dateFormatted} to see your surprise!`,
      previewGreeting: (name) => name ? `Congratulations, ${name}!` : 'Congratulations!',
      modalHint: 'graduation day',
    },
  };

  return configs[occasionId] || configs.birthday;
}
