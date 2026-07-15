import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

function sanitizeData(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeData).filter((item) => item !== undefined);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((acc, [key, item]) => {
      if (item !== undefined) {
        acc[key] = sanitizeData(item);
      }
      return acc;
    }, {});
  }

  return value;
}

export function encodeData(obj) {
  const json = JSON.stringify(sanitizeData(obj));
  return compressToEncodedURIComponent(json);
}

export function decodeData(str) {
  try {
    const normalized = typeof str === 'string' ? str.trim() : '';
    if (!normalized) return null;

    const compressed = decompressFromEncodedURIComponent(normalized);
    if (compressed) {
      return JSON.parse(compressed);
    }

    const bytes = Uint8Array.from(atob(normalized), (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export function getYouTubeId(url) {
  if (!url) return null;
  const regex = /(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function getOccasionMeta(occasion = 'birthday') {
  const key = String(occasion || 'birthday').toLowerCase();

  const occasions = {
    birthday: {
      key: 'birthday',
      emoji: '🎂',
      label: 'Birthday',
      nameLabel: "Birthday Person's Name",
      dateLabel: 'Birthday Date',
      messageLabel: 'Write Your Birthday Message',
      messagePlaceholder: 'Type your heartfelt birthday message here...',
      namePlaceholder: 'Their name',
      heroTitle: 'Surprise Card Maker',
      heroSubtitle: "Put together a beautiful, custom birthday greeting. They won't be able to open it until the big day!",
      greeting: (name) => `Happy Birthday, ${name}!`,
      badgeText: (age) => `${age} years young!`,
      lockTitle: "This surprise isn't ready yet!",
      lockMessage: (dateFormatted) => `It's not your birthday yet! Come back on ${dateFormatted}.`,
      previewGreeting: (name) => (name ? `Happy Birthday, ${name}!` : 'Happy Birthday!'),
      modalHint: 'their birthday',
      dateHint: 'Recipients will be blocked by a countdown until their birthday!'
    },
    congratulations: {
      key: 'congratulations',
      emoji: '🎉',
      label: 'Congratulations',
      nameLabel: "Recipient's Name",
      dateLabel: 'Special Date',
      messageLabel: 'Write Your Congratulations Message',
      messagePlaceholder: 'Type your warm congratulations here...',
      namePlaceholder: 'Their name',
      heroTitle: 'Surprise Card Maker',
      heroSubtitle: 'Create a heartfelt celebration card for a special milestone.',
      greeting: (name) => `Congratulations, ${name}!`,
      badgeText: () => null,
      lockTitle: "This surprise isn't ready yet!",
      lockMessage: (dateFormatted) => `The celebration isn't ready yet. Come back on ${dateFormatted}.`,
      previewGreeting: (name) => (name ? `Congratulations, ${name}!` : 'Congratulations!'),
      modalHint: 'the celebration date',
      dateHint: 'Recipients will see a countdown until the celebration date.'
    },
    'job-promotion': {
      key: 'job-promotion',
      emoji: '💼',
      label: 'Job Promotion',
      nameLabel: 'Their Name',
      dateLabel: 'Celebration Date',
      messageLabel: 'Write Your Promotion Message',
      messagePlaceholder: 'Type your promotion message here...',
      namePlaceholder: 'Their name',
      heroTitle: 'Surprise Card Maker',
      heroSubtitle: 'Celebrate their new milestone with a polished surprise card.',
      greeting: (name) => `You Got Promoted, ${name}!`,
      badgeText: () => null,
      lockTitle: "This surprise isn't ready yet!",
      lockMessage: (dateFormatted) => `The promotion surprise isn't ready yet. Come back on ${dateFormatted}.`,
      previewGreeting: (name) => (name ? `You Got Promoted, ${name}!` : 'You Got Promoted!'),
      modalHint: 'the celebration date',
      dateHint: 'Recipients will see a countdown until the celebration date.'
    },
    'youre-hired': {
      key: 'youre-hired',
      emoji: '🎊',
      label: "You're Hired!",
      nameLabel: "New Hire's Name",
      dateLabel: 'Start Date',
      messageLabel: 'Write Your Welcome Message',
      messagePlaceholder: 'Type your welcoming message here...',
      namePlaceholder: 'Their name',
      heroTitle: 'Surprise Card Maker',
      heroSubtitle: 'Welcome them aboard with a cheerful surprise card.',
      greeting: (name) => `Welcome Aboard, ${name}!`,
      badgeText: () => null,
      lockTitle: "This surprise isn't ready yet!",
      lockMessage: (dateFormatted) => `The welcome surprise isn't ready yet. Come back on ${dateFormatted}.`,
      previewGreeting: (name) => (name ? `Welcome Aboard, ${name}!` : 'Welcome Aboard!'),
      modalHint: 'the start date',
      dateHint: 'Recipients will see a countdown until the start date.'
    },
    anniversary: {
      key: 'anniversary',
      emoji: '💝',
      label: 'Anniversary',
      nameLabel: "Couple's Name",
      dateLabel: 'Anniversary Date',
      messageLabel: 'Write Your Anniversary Message',
      messagePlaceholder: 'Type your anniversary message here...',
      namePlaceholder: 'Their names',
      heroTitle: 'Surprise Card Maker',
      heroSubtitle: 'Celebrate their special day with a heartfelt surprise card.',
      greeting: (name) => `Happy Anniversary, ${name}!`,
      badgeText: () => null,
      lockTitle: "This surprise isn't ready yet!",
      lockMessage: (dateFormatted) => `The anniversary surprise isn't ready yet. Come back on ${dateFormatted}.`,
      previewGreeting: (name) => (name ? `Happy Anniversary, ${name}!` : 'Happy Anniversary!'),
      modalHint: 'the anniversary date',
      dateHint: 'Recipients will see a countdown until the anniversary date.'
    },
    graduation: {
      key: 'graduation',
      emoji: '🎓',
      label: 'Graduation',
      nameLabel: "Graduate's Name",
      dateLabel: 'Graduation Date',
      messageLabel: 'Write Your Graduation Message',
      messagePlaceholder: 'Type your graduation message here...',
      namePlaceholder: 'Their name',
      heroTitle: 'Surprise Card Maker',
      heroSubtitle: 'Honor their achievement with a joyful surprise card.',
      greeting: (name) => `Congratulations Graduate, ${name}!`,
      badgeText: () => null,
      lockTitle: "This surprise isn't ready yet!",
      lockMessage: (dateFormatted) => `The graduation surprise isn't ready yet. Come back on ${dateFormatted}.`,
      previewGreeting: (name) => (name ? `Congratulations Graduate, ${name}!` : 'Congratulations Graduate!'),
      modalHint: 'the graduation date',
      dateHint: 'Recipients will see a countdown until the graduation date.'
    }
  };

  return occasions[key] || occasions.birthday;
}

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
