export function buildCloudinaryUrl(rawUrl, width, options = {}) {
  const marker = '/image/upload/';
  const idx = rawUrl.indexOf(marker);
  if (idx === -1) return rawUrl;
  const prefix = rawUrl.slice(0, idx + marker.length);
  const rest = rawUrl.slice(idx + marker.length);
  const parts = ['f_auto', 'q_auto'];
  if (options.crop) {
    parts.push(`c_${options.crop}`);
  }
  if (width) {
    parts.push(`w_${width}`);
  }
  if (options.height) {
    parts.push(`h_${options.height}`);
  }
  return `${prefix}${parts.join(',')}/${rest}`;
}

export function buildCloudinarySrcSet(rawUrl, widths = [640, 960, 1440, 2000]) {
  return widths.map((w) => `${buildCloudinaryUrl(rawUrl, w)} ${w}w`).join(', ');
}

export function validateLeadForm(fields) {
  const errors = {};
  const name = String(fields.name || '').trim();
  const phone = String(fields.phone || '').trim();
  const email = String(fields.email || '').trim();

  if (!name || name.length < 2) {
    errors.name = 'Please enter your name.';
  }

  const digits = phone.replace(/\D/g, '');
  if (!phone || digits.length < 7) {
    errors.phone = 'Please enter a valid phone number.';
  }

  if (fields.requireEmail || email.length > 0) {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      errors.email = 'Please enter a valid email address.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function buildMailtoHref(recipient, fields, pageTitle = '') {
  const lines = [];
  if (fields.name) lines.push(`Name: ${fields.name}`);
  if (fields.phone) lines.push(`Phone: ${fields.phone}`);
  if (fields.email) lines.push(`Email: ${fields.email}`);
  if (fields.projectType) lines.push(`Project type: ${fields.projectType}`);
  if (fields.location) lines.push(`Where is the job: ${fields.location}`);
  if (fields.message) lines.push(`Message: ${fields.message}`);
  if (pageTitle) lines.push(`Page: ${pageTitle}`);

  const subject = encodeURIComponent(
    `Quote request from ${fields.name || 'website visitor'}`
  );
  const body = encodeURIComponent(lines.join('\n'));
  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}

export function filterProjects(items, category) {
  if (!category || category === 'All') return items;
  return items.filter((item) => item.category === category);
}

export function clampSliderPercent(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 50;
  return Math.max(0, Math.min(100, Math.round(num * 10) / 10));
}
