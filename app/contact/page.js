import { ArrowUpRight } from 'lucide-react';
import {
  BASE_URL,
  BUSINESS,
  buildPageMetadata,
  getBreadcrumbJsonLd,
} from '../../lib/site-data.js';
import AreaChips from '../../components/AreaChips.js';
import CloudImg from '../../components/CloudImg.js';

export const metadata = buildPageMetadata({
  title: 'Contact WK Construction | Free Quotes in Cleveland, TX',
  description:
    'Call (281) 592-3792 or send a message. WK Construction, 195 Bartlett Rd, Cleveland, TX 77328. Free quotes for metal buildings, land work and custom homes.',
  path: '/contact/',
  imageKey: 'contact',
});

export default function ContactPage() {
  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact WK Construction Inc.',
    url: `${BASE_URL}/contact/`,
    mainEntity: { '@id': `${BASE_URL}/#business` },
  };

  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact/' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([contactJsonLd, breadcrumbJsonLd]) }}
      />

      <section className="hero hero-60" data-hero="" aria-labelledby="contact-hero-h1">
        <div className="hero-media frame" data-parallax="">
          <CloudImg imgKey="contact" eager decorative layered sizes="100vw" defaultWidth={1440} />
        </div>
        <div className="hero-overlay" aria-hidden="true" />

        <div className="container">
          <div className="hero-content">
            <h1 id="contact-hero-h1" data-split="">
              Have a job? <span style={{ color: 'var(--gold)', display: 'block' }}>Let&apos;s talk.</span>
            </h1>
          </div>
        </div>
      </section>

      <section className="section-light-white" style={{ paddingBottom: '72px' }} aria-label="Quote request form and contact details">
        <div className="container">
          <div className="contact-overlap-card" data-reveal="">
            <form
              className="wk-lead-form"
              data-require-email="false"
              data-success-text="Thanks. We got your message and will call you back soon."
              noValidate
            >
              <div className="honeypot-field" aria-hidden="true">
                <label htmlFor="contact-honeypot">Company Website</label>
                <input id="contact-honeypot" type="text" name="company_website" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="field-wrap">
                <label htmlFor="contact-name" className="field-label">
                  Name
                </label>
                <input id="contact-name" type="text" name="name" autoComplete="name" required className="field-input" />
                <span className="field-focus-line" aria-hidden="true" />
                <div className="field-error" data-error-for="name" aria-live="polite" />
              </div>

              <div className="field-wrap">
                <label htmlFor="contact-phone" className="field-label">
                  Phone
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  name="phone"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  className="field-input"
                />
                <span className="field-focus-line" aria-hidden="true" />
                <div className="field-error" data-error-for="phone" aria-live="polite" />
              </div>

              <div className="field-wrap">
                <label htmlFor="contact-email" className="field-label">
                  Email
                </label>
                <input id="contact-email" type="email" name="email" autoComplete="email" className="field-input" />
                <span className="field-focus-line" aria-hidden="true" />
                <div className="field-error" data-error-for="email" aria-live="polite" />
              </div>

              <div className="field-wrap">
                <label htmlFor="contact-type" className="field-label">
                  What are you building?
                </label>
                <select id="contact-type" name="project_type" className="field-select" defaultValue="Metal building">
                  <option value="Metal building">Metal building</option>
                  <option value="Land work">Land work</option>
                  <option value="Custom home">Custom home</option>
                  <option value="Commercial build-out">Commercial build-out</option>
                  <option value="Renovation">Renovation</option>
                  <option value="Something else">Something else</option>
                </select>
                <span className="field-focus-line" aria-hidden="true" />
              </div>

              <div className="field-wrap">
                <label htmlFor="contact-location" className="field-label">
                  Where is the job?
                </label>
                <input
                  id="contact-location"
                  type="text"
                  name="job_location"
                  placeholder="Town or county"
                  className="field-input"
                />
                <span className="field-focus-line" aria-hidden="true" />
              </div>

              <div className="field-wrap">
                <label htmlFor="contact-message" className="field-label">
                  Your message
                </label>
                <textarea id="contact-message" name="message" className="field-textarea" />
                <span className="field-focus-line" aria-hidden="true" />
              </div>

              <div className="field-error" data-form-error="" aria-live="polite" />

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <span>Send it</span>
              </button>
            </form>

            <div>
              {/* EDIT: Owner title "Owner" and the owner name block */}
              <ul className="contact-detail-list">
                <li className="contact-detail-item">
                  <span className="gold-square" aria-hidden="true" />
                  <span>{BUSINESS.owner.full}</span>
                </li>
                <li className="contact-detail-item">
                  <span className="gold-square" aria-hidden="true" />
                  <span>
                    Main:{' '}
                    <a href={BUSINESS.phoneMain.href} className="inline-link">
                      {BUSINESS.phoneMain.display}
                    </a>
                  </span>
                </li>
                <li className="contact-detail-item">
                  <span className="gold-square" aria-hidden="true" />
                  <span>
                    Office:{' '}
                    <a href={BUSINESS.phoneOffice.href} className="inline-link">
                      {BUSINESS.phoneOffice.display}
                    </a>
                  </span>
                </li>
                <li className="contact-detail-item">
                  <span className="gold-square" aria-hidden="true" />
                  <a href={`mailto:${BUSINESS.email}`} className="inline-link">
                    {BUSINESS.email}
                  </a>
                </li>
                <li className="contact-detail-item">
                  <span className="gold-square" aria-hidden="true" />
                  <address>{BUSINESS.address.full}</address>
                </li>
                <li className="contact-detail-item">
                  <span className="gold-square" aria-hidden="true" />
                  {/* EDIT: Office hours (opening time is known, closing time is assumed 5:00 PM) */}
                  <span>{BUSINESS.hours.display}</span>
                </li>
                <li className="contact-detail-item">
                  <span className="gold-square" aria-hidden="true" />
                  <span>{BUSINESS.hours.walkIns}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-light-mist" style={{ position: 'relative' }} aria-labelledby="find-us-h2">
        <div className="container">
          <h2 id="find-us-h2" data-split="">
            Find us
          </h2>
        </div>

        <div style={{ position: 'relative', marginTop: '28px' }}>
          <svg
            className="deco-edge-svg"
            style={{ left: '24px', top: '24px', width: '64px', height: '140px' }}
            viewBox="0 0 64 140"
            fill="none"
            aria-hidden="true"
            data-draw-svg=""
          >
            <polyline points="63,0 1,62 1,140" stroke="#D9A62E" strokeWidth="1" />
          </svg>
          <svg
            className="deco-edge-svg"
            style={{ right: '24px', bottom: '24px', width: '64px', height: '140px' }}
            viewBox="0 0 64 140"
            fill="none"
            aria-hidden="true"
            data-draw-svg=""
          >
            <polyline points="1,140 63,78 63,0" stroke="#D9A62E" strokeWidth="1" />
          </svg>

          <iframe
            src={BUSINESS.mapsEmbedUrl}
            title="Map showing WK Construction at 195 Bartlett Rd, Cleveland, TX"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="map-frame"
          />
        </div>

        <div
          className="container"
          style={{
            marginTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <a href={BUSINESS.mapsDirectionsUrl} target="_blank" rel="noopener noreferrer" className="link-btn">
            <span>Get directions</span>
            <ArrowUpRight size={15} className="btn-arrow" aria-hidden="true" />
          </a>
          <address style={{ color: 'var(--slate)' }}>{BUSINESS.address.full}</address>
        </div>
      </section>

      <section className="section section-dark-navy" aria-labelledby="contact-area-h2">
        <div className="container">
          <div className="sticky-split" style={{ alignItems: 'center' }}>
            <h2 id="contact-area-h2" data-split="">
              Where we work
            </h2>
            <AreaChips />
          </div>
        </div>
      </section>
    </>
  );
}
