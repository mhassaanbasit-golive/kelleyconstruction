import { Anton, DM_Sans } from 'next/font/google';
import {
  ArrowUpRight,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  X,
} from 'lucide-react';
import 'lenis/dist/lenis.css';
import './globals.css';
import { BUSINESS, getImageProps } from '../lib/site-data.js';
import Motion from '../components/Motion.js';
import ChatWidget from '../components/chat/ChatWidget.js';

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-anton',
});

const dmSans = DM_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
});

export const viewport = {
  themeColor: '#0E1114',
};

export default function RootLayout({ children }) {
  const steelProps = getImageProps('steel', {
    decorative: true,
    sizes: '100vw',
    defaultWidth: 1440,
  });

  return (
    <html
      lang="en-US"
      className={`no-js ${anton.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.remove('no-js');document.documentElement.classList.add('js');setTimeout(function(){document.documentElement.classList.add('pt-ready');},2400);",
          }}
        />
        <noscript>
          <style>{`
            #page-transition{display:none!important;}
            [data-reveal],[data-stagger]>*,[data-image-reveal],[data-image-reveal] img{opacity:1!important;transform:none!important;clip-path:none!important;}
          `}</style>
        </noscript>
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <header id="site-header" className="site-header">
          <div className="container">
            <div className="header-inner">
              <a href="/" className="site-logo">
                {BUSINESS.displayName}
              </a>

              <nav className="desktop-nav" aria-label="Main">
                <div id="nav-services-wrap" className="nav-link-wrap">
                  <button
                    type="button"
                    id="nav-services-btn"
                    className="nav-link"
                    aria-expanded="false"
                    aria-controls="nav-services-panel"
                  >
                    <span>Services</span>
                    <ChevronDown size={14} className="nav-caret" aria-hidden="true" />
                  </button>
                  <div id="nav-services-panel" className="nav-dropdown-panel">
                    <a href="/metal-buildings/" className="nav-dropdown-item">
                      Metal Buildings
                    </a>
                    <a href="/site-prep-and-land/" className="nav-dropdown-item">
                      Site Prep and Land
                    </a>
                    <a href="/custom-construction/" className="nav-dropdown-item">
                      Custom Construction
                    </a>
                  </div>
                </div>

                <a href="/projects/" className="nav-link">
                  Projects
                </a>
                <a href="/about/" className="nav-link">
                  About
                </a>
              </nav>

              <div className="header-cta">
                <a href="/contact/" className="btn btn-outline-dark btn-nav">
                  <span>Contact Us</span>
                  <ArrowUpRight size={15} className="btn-arrow" aria-hidden="true" />
                </a>
              </div>

              <div className="mobile-header-actions">
                <a
                  href={BUSINESS.phoneMain.href}
                  className="mobile-call-icon"
                  aria-label={`Call ${BUSINESS.phoneMain.display}`}
                >
                  <Phone size={18} aria-hidden="true" />
                </a>

                <button
                  type="button"
                  id="mobile-menu-btn"
                  className="mobile-menu-btn"
                  aria-expanded="false"
                  aria-controls="mobile-menu-overlay"
                  aria-label="Open menu"
                >
                  <span className="hamburger-line" />
                  <span className="hamburger-line" />
                </button>
              </div>
            </div>
            <div className="header-rule" aria-hidden="true" />
          </div>
        </header>

        <div id="mobile-menu-overlay" className="mobile-menu-overlay" aria-hidden="true">
          <nav aria-label="Mobile menu">
            <ul className="mobile-menu-list">
              <li>
                <button
                  type="button"
                  id="mobile-services-toggle"
                  className="mobile-menu-link"
                  aria-expanded="false"
                  aria-controls="mobile-services-sublinks"
                >
                  <span>Services</span>
                  <ChevronDown size={22} aria-hidden="true" />
                </button>
                <div id="mobile-services-sublinks" className="mobile-sublinks">
                  <div className="mobile-sublinks-inner">
                    <a href="/metal-buildings/" className="mobile-sublink">
                      Metal Buildings
                    </a>
                    <a href="/site-prep-and-land/" className="mobile-sublink">
                      Site Prep and Land
                    </a>
                    <a href="/custom-construction/" className="mobile-sublink">
                      Custom Construction
                    </a>
                  </div>
                </div>
              </li>
              <li>
                <a href="/projects/" className="mobile-menu-link">
                  Projects
                </a>
              </li>
              <li>
                <a href="/about/" className="mobile-menu-link">
                  About
                </a>
              </li>
              <li>
                <a href="/contact/" className="mobile-menu-link">
                  Contact Us
                </a>
              </li>
            </ul>
          </nav>

          <div className="mobile-menu-footer">
            <a href={BUSINESS.phoneMain.href} className="btn btn-primary btn-full-mobile">
              <Phone size={16} aria-hidden="true" />
              <span>{BUSINESS.phoneMain.display}</span>
            </a>
            <a href={`mailto:${BUSINESS.email}`} className="small-text" style={{ color: 'var(--ash)' }}>
              {BUSINESS.email}
            </a>
            <address className="small-text" style={{ color: 'var(--ash)' }}>
              {BUSINESS.address.full}
            </address>
          </div>
        </div>

        <main id="main">{children}</main>

        <footer id="site-footer" className="site-footer">
          <img
            src={steelProps.src}
            srcSet={steelProps.srcSet}
            sizes={steelProps.sizes}
            width={steelProps.width}
            height={steelProps.height}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="texture-bg"
          />
          <div className="container">
            <div className="footer-grid">
              <div>
                <a href="/" className="site-logo" style={{ fontSize: '1.375rem', display: 'inline-block' }}>
                  {BUSINESS.displayName}
                </a>
                <p style={{ marginTop: '12px', color: 'var(--ash)' }}>
                  Family owned in Cleveland, TX for over 45 years.
                </p>
                <div style={{ height: '1px', backgroundColor: 'var(--line-dark)', marginTop: '24px' }} />

                <div className="footer-links-cols">
                  <ul className="footer-nav-list">
                    <li>
                      <a href="/metal-buildings/" className="inline-link">
                        Metal Buildings
                      </a>
                    </li>
                    <li>
                      <a href="/site-prep-and-land/" className="inline-link">
                        Site Prep and Land
                      </a>
                    </li>
                    <li>
                      <a href="/custom-construction/" className="inline-link">
                        Custom Construction
                      </a>
                    </li>
                  </ul>
                  <ul className="footer-nav-list">
                    <li>
                      <a href="/projects/" className="inline-link">
                        Projects
                      </a>
                    </li>
                    <li>
                      <a href="/about/" className="inline-link">
                        About
                      </a>
                    </li>
                    <li>
                      <a href="/contact/" className="inline-link">
                        Contact
                      </a>
                    </li>
                  </ul>
                </div>

                <ul className="footer-contact-list">
                  <li className="footer-contact-item">
                    <Phone size={16} color="#D9A62E" style={{ flexShrink: 0, marginTop: '4px' }} aria-hidden="true" />
                    <div>
                      <a href={BUSINESS.phoneMain.href} className="inline-link">
                        {BUSINESS.phoneMain.display}
                      </a>
                      <span> · </span>
                      <a href={BUSINESS.phoneOffice.href} className="inline-link">
                        {BUSINESS.phoneOffice.display}
                      </a>
                    </div>
                  </li>
                  <li className="footer-contact-item">
                    <Mail size={16} color="#D9A62E" style={{ flexShrink: 0, marginTop: '4px' }} aria-hidden="true" />
                    <a href={`mailto:${BUSINESS.email}`} className="inline-link">
                      {BUSINESS.email}
                    </a>
                  </li>
                  <li className="footer-contact-item">
                    <MapPin size={16} color="#D9A62E" style={{ flexShrink: 0, marginTop: '4px' }} aria-hidden="true" />
                    <address>{BUSINESS.address.full}</address>
                  </li>
                  <li className="footer-contact-item">
                    <Clock size={16} color="#D9A62E" style={{ flexShrink: 0, marginTop: '4px' }} aria-hidden="true" />
                    <span>{BUSINESS.hours.display}</span>
                  </li>
                  <li className="footer-contact-item">
                    <ShieldCheck
                      size={16}
                      color="#D9A62E"
                      style={{ flexShrink: 0, marginTop: '4px' }}
                      aria-hidden="true"
                    />
                    <span>BBB Accredited, A+ rated</span>
                  </li>
                </ul>
              </div>

              <div id="footer-form-col" className="footer-form-col">
                <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)' }}>
                  Tell us <span style={{ color: 'var(--gold)' }}>what you want to build</span>
                </h2>

                <form
                  className="wk-lead-form form-dark"
                  data-require-email="false"
                  data-success-text="Thanks. We got your message and will call you back soon."
                  style={{ marginTop: '24px' }}
                  noValidate
                >
                  <div className="honeypot-field" aria-hidden="true">
                    <label htmlFor="footer-honeypot">Company Website</label>
                    <input
                      id="footer-honeypot"
                      type="text"
                      name="company_website"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="field-grid-3">
                    <div className="field-wrap">
                      <label htmlFor="footer-name" className="field-label">
                        Name
                      </label>
                      <input
                        id="footer-name"
                        type="text"
                        name="name"
                        autoComplete="name"
                        required
                        className="field-input"
                      />
                      <span className="field-focus-line" aria-hidden="true" />
                      <div className="field-error" data-error-for="name" aria-live="polite" />
                    </div>

                    <div className="field-wrap">
                      <label htmlFor="footer-phone" className="field-label">
                        Phone
                      </label>
                      <input
                        id="footer-phone"
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
                      <label htmlFor="footer-email" className="field-label">
                        Email
                      </label>
                      <input
                        id="footer-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        className="field-input"
                      />
                      <span className="field-focus-line" aria-hidden="true" />
                      <div className="field-error" data-error-for="email" aria-live="polite" />
                    </div>
                  </div>

                  <div className="field-wrap">
                    <label htmlFor="footer-message" className="field-label">
                      Message
                    </label>
                    <textarea id="footer-message" name="message" className="field-textarea" />
                    <span className="field-focus-line" aria-hidden="true" />
                  </div>

                  <div className="field-error" data-form-error="" aria-live="polite" />

                  <button type="submit" className="btn btn-outline-dark">
                    <span>Send</span>
                    <ArrowUpRight size={16} className="btn-arrow" aria-hidden="true" />
                  </button>

                  <p className="small-text" style={{ color: 'var(--ash)', marginTop: '12px' }}>
                    We read every message and call you back.
                  </p>
                </form>
              </div>
            </div>

            <div className="footer-bottom">
              <span>&copy; 2026 {BUSINESS.legalName} All rights reserved.</span>
              {/* EDIT: correct link */}
              <a
                href="https://getgolive.io"
                target="_blank"
                rel="noopener"
                className="footer-credit-link"
              >
                Website by GetGoLive
              </a>
              <a href="/privacy/" className="inline-link">
                Privacy
              </a>
            </div>
          </div>
        </footer>

        <div id="mobile-sticky-bar" className="mobile-sticky-bar">
          <a href={BUSINESS.phoneMain.href} className="btn btn-outline-dark">
            <Phone size={15} aria-hidden="true" />
            <span>Call</span>
          </a>
          <a href="/contact/" className="btn btn-primary">
            <span>Free quote</span>
          </a>
        </div>

        <aside id="cookie-banner" className="cookie-banner" aria-label="Cookie preferences">
          <p className="small-text" style={{ margin: 0 }}>
            We use a few cookies to keep the site working and to see how people use it. You can accept all or keep only
            the needed ones.{' '}
            <a href="/privacy/" className="inline-link" style={{ color: 'var(--gold)' }}>
              Privacy
            </a>
          </p>
          <div className="cookie-actions">
            <button type="button" id="cookie-accept-btn" className="btn btn-primary">
              <span>Accept all</span>
            </button>
            <button type="button" id="cookie-needed-btn" className="btn btn-outline-dark">
              <span>Only needed</span>
            </button>
          </div>
        </aside>

        <div
          id="offer-modal"
          className="offer-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="offer-modal-heading"
          aria-hidden="true"
        >
          <div className="offer-modal-card">
            <button type="button" id="offer-close-btn" className="offer-close-btn" aria-label="Close popup">
              <X size={20} aria-hidden="true" />
            </button>

            <h2 id="offer-modal-heading" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)' }}>
              Free site visit and written quote.
            </h2>
            <p style={{ color: 'var(--slate)', marginTop: '10px' }}>
              Tell us what you want to build. We will call you back and set up a time to come look.
            </p>

            <form
              className="wk-lead-form"
              data-require-email="false"
              data-success-text="Got it. We will call you soon."
              style={{ marginTop: '20px' }}
              noValidate
            >
              <div className="honeypot-field" aria-hidden="true">
                <label htmlFor="offer-honeypot">Company Website</label>
                <input id="offer-honeypot" type="text" name="company_website" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="field-wrap">
                <label htmlFor="offer-name" className="field-label">
                  Name
                </label>
                <input id="offer-name" type="text" name="name" autoComplete="name" required className="field-input" />
                <span className="field-focus-line" aria-hidden="true" />
                <div className="field-error" data-error-for="name" aria-live="polite" />
              </div>

              <div className="field-wrap">
                <label htmlFor="offer-phone" className="field-label">
                  Phone
                </label>
                <input
                  id="offer-phone"
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

              <div className="field-error" data-form-error="" aria-live="polite" />

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <span>Request my free visit</span>
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '14px' }}>
              <button type="button" id="offer-no-thanks" className="inline-link small-text" style={{ color: 'var(--slate)' }}>
                No thanks
              </button>
            </div>
          </div>
        </div>

        <div id="page-transition" aria-hidden="true">
          <span className="pt-dot" />
          <span className="pt-dot" />
          <span className="pt-dot" />
        </div>

        <div id="wk-cursor" className="wk-cursor" aria-hidden="true">
          <span className="wk-cursor-label">View</span>
        </div>

        <Motion />
        <ChatWidget />
      </body>
    </html>
  );
}
