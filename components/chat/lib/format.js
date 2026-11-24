export function stripMarkdown(input) {
  return String(input || '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/^\s*#{1,6}\s*/gm, '')
    .replace(/#{1,6}/g, '')
    .replace(/^\s*-{3,}\s*$/gm, '')
    .replace(/-{3,}/g, '')
    .replace(/\*/g, '');
}

const CONTACT_TOKEN_RE = /(\(281\)\s*592-3792|\(281\)\s*593-5422|wendellkelley@gmail\.com)/gi;

export function tokenizeMessageText(rawText) {
  const cleaned = stripMarkdown(rawText);
  if (!cleaned) return [];

  const tokens = [];
  let lastIndex = 0;

  for (const match of cleaned.matchAll(CONTACT_TOKEN_RE)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      tokens.push({ type: 'text', value: cleaned.slice(lastIndex, idx) });
    }
    const raw = match[0];
    if (raw.toLowerCase() === 'wendellkelley@gmail.com') {
      tokens.push({ type: 'link', label: raw, href: 'mailto:wendellkelley@gmail.com' });
    } else if (raw.includes('592')) {
      tokens.push({ type: 'link', label: raw, href: 'tel:+12815923792' });
    } else {
      tokens.push({ type: 'link', label: raw, href: 'tel:+12815935422' });
    }
    lastIndex = idx + raw.length;
  }

  if (lastIndex < cleaned.length) {
    tokens.push({ type: 'text', value: cleaned.slice(lastIndex) });
  }

  return tokens;
}

export function isAllowedActionHref(href, currentOrigin = 'https://kelleyconstruction.net') {
  const raw = String(href || '').trim();
  if (!raw) return false;
  const lower = raw.toLowerCase();

  if (lower.startsWith('tel:') || lower.startsWith('mailto:')) {
    return raw.length > 5 && !/[\r\n]/.test(raw);
  }
  if (raw.startsWith('#')) {
    return true;
  }
  if (raw.startsWith('/') && !raw.startsWith('//')) {
    return true;
  }

  try {
    const parsed = new URL(raw, currentOrigin);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    if (parsed.origin === currentOrigin) {
      return true;
    }
    const host = parsed.hostname.toLowerCase();
    if (
      (host === 'google.com' || host === 'www.google.com' || host === 'maps.google.com') &&
      (host === 'maps.google.com' || parsed.pathname.startsWith('/maps'))
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function validateDetailsForm({ name, email, phone }) {
  const errors = {};
  const trimmedName = String(name || '').trim();
  const trimmedEmail = String(email || '').trim();
  const trimmedPhone = String(phone || '').trim();

  if (trimmedName.length < 2) {
    errors.name = 'Please enter your name (at least 2 characters).';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (trimmedPhone) {
    const normalized = trimmedPhone.replace(/[\s+\-()]/g, '');
    if (!/^\d{10,}$/.test(normalized)) {
      errors.phone = 'If provided, phone must have at least 10 digits.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function extractFirstName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/);
  return parts[0] || 'there';
}
