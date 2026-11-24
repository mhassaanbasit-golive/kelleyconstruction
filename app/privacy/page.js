import { BUSINESS, buildPageMetadata, getBreadcrumbJsonLd } from '../../lib/site-data.js';

export const metadata = buildPageMetadata({
  title: 'Privacy Policy | WK Construction',
  description: 'Privacy policy for Wendell Kelley Construction, Inc. in Cleveland, TX.',
  path: '/privacy/',
  imageKey: 'hero',
});

export default function PrivacyPage() {
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Privacy Policy', path: '/privacy/' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <section className="section section-light-white" style={{ paddingTop: '140px' }} aria-labelledby="privacy-h1">
        <div className="container">
          <div className="measure">
            <h1 id="privacy-h1" style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}>
              Privacy policy
            </h1>
            <p className="small-text" style={{ marginTop: '12px', color: 'var(--slate)' }}>
              Last updated: November 2026
            </p>

            <h2 style={{ marginTop: '48px', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>Who we are</h2>
            <p style={{ color: 'var(--slate)' }}>
              This website is operated by {BUSINESS.legalName}, located at {BUSINESS.address.full}.
            </p>

            <h2 style={{ marginTop: '40px', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>What we collect</h2>
            <p style={{ color: 'var(--slate)' }}>
              When you send a quote or contact form, we collect your name, phone number, email address if provided,
              and your message about the job. We also store your cookie preference on your device so we remember whether
              you chose needed cookies or all cookies.
            </p>

            <h2 style={{ marginTop: '40px', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>Why we collect it</h2>
            <p style={{ color: 'var(--slate)' }}>
              We use your contact details only to answer your question, call you back, set up a site visit, and prepare
              a written quote. We do not sell, rent, or trade your information to anyone.
            </p>

            <h2 style={{ marginTop: '40px', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>How long we keep it</h2>
            <p style={{ color: 'var(--slate)' }}>
              We keep messages and quote notes as long as needed to answer you, finish a job, and maintain standard
              business records.
            </p>

            <h2 style={{ marginTop: '40px', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>Your choices</h2>
            <p style={{ color: 'var(--slate)' }}>
              You can ask us at any time to update or delete the contact details you shared with us.
            </p>

            <h2 style={{ marginTop: '40px', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>Contact us</h2>
            <p style={{ color: 'var(--slate)' }}>
              Email{' '}
              <a href={`mailto:${BUSINESS.email}`} className="inline-link">
                {BUSINESS.email}
              </a>{' '}
              or call{' '}
              <a href={BUSINESS.phoneMain.href} className="inline-link">
                {BUSINESS.phoneMain.display}
              </a>{' '}
              with any questions about this policy.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
