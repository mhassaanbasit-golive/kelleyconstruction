'use client';

import { useState } from 'react';
import { validateDetailsForm } from './lib/format.js';
import { safeStorage } from './lib/storage.js';
import { playSound } from './lib/sound.js';

export default function DetailsForm({ initialVisitor, isMuted, onComplete }) {
  const [name, setName] = useState(() => initialVisitor?.name || '');
  const [email, setEmail] = useState(() => initialVisitor?.email || '');
  const [phone, setPhone] = useState(() => initialVisitor?.phone || '');
  const [companyWebsite, setCompanyWebsite] = useState(() => initialVisitor?.company_website || '');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;

    const result = validateDetailsForm({ name, email, phone });
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const cleanVisitor = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    };

    safeStorage.setJson('sm_visitor', cleanVisitor);
    playSound('ding', isMuted);
    onComplete({
      ...cleanVisitor,
      company_website: companyWebsite,
    });
  };

  return (
    <div className="wk-chat-form-scroll" data-lenis-prevent="">
      <div className="wk-chat-form-wrap">
        <h2 className="wk-chat-form-heading">Tell us who you are</h2>

        <form className="wk-chat-form" onSubmit={handleSubmit} noValidate>
          <div className="wk-chat-honeypot" aria-hidden="true">
            <label htmlFor="wk-chat-company-website">Company Website</label>
            <input
              id="wk-chat-company-website"
              type="text"
              name="company_website"
              tabIndex={-1}
              autoComplete="off"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
            />
          </div>

          <div className="wk-chat-field">
            <label htmlFor="wk-chat-name" className="wk-chat-label">
              Name
            </label>
            <input
              id="wk-chat-name"
              type="text"
              name="name"
              autoComplete="name"
              required
              className="wk-chat-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(errors.name)}
            />
            <div className="wk-chat-field-error" aria-live="polite">
              {errors.name || ''}
            </div>
          </div>

          <div className="wk-chat-field">
            <label htmlFor="wk-chat-email" className="wk-chat-label">
              Email
            </label>
            <input
              id="wk-chat-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              className="wk-chat-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
            />
            <div className="wk-chat-field-error" aria-live="polite">
              {errors.email || ''}
            </div>
          </div>

          <div className="wk-chat-field">
            <label htmlFor="wk-chat-phone" className="wk-chat-label">
              Phone (optional)
            </label>
            <input
              id="wk-chat-phone"
              type="tel"
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(281) 000-0000"
              className="wk-chat-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-invalid={Boolean(errors.phone)}
            />
            <div className="wk-chat-field-error" aria-live="polite">
              {errors.phone || ''}
            </div>
          </div>

          <button
            type="submit"
            className="wk-chat-submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit details'}
          </button>
        </form>
      </div>
    </div>
  );
}
