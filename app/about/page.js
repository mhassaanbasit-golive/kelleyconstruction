import { ArrowUpRight } from 'lucide-react';
import {
  BASE_URL,
  BUSINESS,
  buildPageMetadata,
  getBreadcrumbJsonLd,
} from '../../lib/site-data.js';
import CtaBand from '../../components/CtaBand.js';
import CloudImg from '../../components/CloudImg.js';

export const metadata = buildPageMetadata({
  title: 'About WK Construction | Family-Owned Builder in Cleveland, TX',
  description:
    'WK Construction (Wendell Kelley Construction, Inc.) is a family-owned builder in Cleveland, TX with over 45 years of experience, a BBB A+ rating and a one-year warranty.',
  path: '/about/',
  imageKey: 'about',
});

export default function AboutPage() {
  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About WK Construction Inc.',
    url: `${BASE_URL}/about/`,
    mainEntity: { '@id': `${BASE_URL}/#business` },
  };

  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about/' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([aboutJsonLd, breadcrumbJsonLd]) }}
      />

      <section className="hero hero-70" data-hero="" aria-labelledby="about-hero-h1">
        <div className="hero-media frame" data-parallax="">
          <CloudImg imgKey="about" eager layered sizes="100vw" defaultWidth={1440} />
        </div>
        <div className="hero-overlay" aria-hidden="true" />

        <div className="container">
          <div className="hero-content">
            <h1 id="about-hero-h1" data-split="">
              A family business in Cleveland, TX.
            </h1>
            <p className="body-lg measure" data-hero-para="" style={{ marginTop: '20px', color: 'rgba(255, 255, 255, 0.78)' }}>
              Over 45 years of building in East Texas.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-dark-navy chamfer-top text-fill-section" aria-labelledby="about-fill-h2">
        <div className="container">
          <h2 id="about-fill-h2" className="text-fill-heading" data-text-fill="">
            <span className="text-fill-word" data-word="We">We</span>{' '}
            <span className="text-fill-word" data-word="are">are</span>{' '}
            <span className="text-fill-word" data-word="a">a</span>{' '}
            <span className="text-fill-word" data-accent="" data-word="family">family</span>{' '}
            <span className="text-fill-word" data-word="business.">business.</span>{' '}
            <span className="text-fill-word" data-word="We">We</span>{' '}
            <span className="text-fill-word" data-word="have">have</span>{' '}
            <span className="text-fill-word" data-word="built">built</span>{' '}
            <span className="text-fill-word" data-word="around">around</span>{' '}
            <span className="text-fill-word" data-word="Cleveland">Cleveland</span>{' '}
            <span className="text-fill-word" data-word="for">for</span>{' '}
            <span className="text-fill-word" data-word="over">over</span>{' '}
            <span className="text-fill-word" data-accent="" data-word="45">45</span>{' '}
            <span className="text-fill-word" data-accent="" data-word="years.">years.</span>{' '}
            <span className="text-fill-word" data-word="Our">Our</span>{' '}
            <span className="text-fill-word" data-accent="" data-word="name">name</span>{' '}
            <span className="text-fill-word" data-word="is">is</span>{' '}
            <span className="text-fill-word" data-word="on">on</span>{' '}
            <span className="text-fill-word" data-word="every">every</span>{' '}
            <span className="text-fill-word" data-word="job.">job.</span>
          </h2>
        </div>
      </section>

      <section className="section section-light-white" aria-labelledby="how-we-work-h2">
        <div className="container">
          <div className="sticky-split">
            <div>
              <h2 id="how-we-work-h2" data-split="">
                How we work
              </h2>
            </div>

            <div className="measure" data-reveal="">
              <p className="body-lg" style={{ marginTop: 0 }}>
                Wendell Kelley Construction started in Cleveland, Texas, and we have stayed right here. We are family
                owned, and we still work the way we always have.
              </p>
              <p className="body-lg">
                We answer the phone. We show up when we say we will. We tell you the truth about your job, even when it
                is not the answer you wanted.
              </p>
              <p className="body-lg" style={{ marginBottom: 0 }}>
                A small renovation or a big steel building, you get the same care.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-light-mist" aria-labelledby="record-h2">
        <div className="container">
          <div className="about-record">
            <div className="a-plus-mark" aria-hidden="true" data-reveal="">
              A+
            </div>

            <div>
              <h2 id="record-h2" data-split="">
                Our record
              </h2>
              <div className="record-lines" style={{ marginTop: '24px' }} data-stagger="">
                <div className="record-line">BBB rating: A+</div>
                <div className="record-line">BBB Accredited since 2004</div>
                <div className="record-line">No BBB complaints in the last three years</div>
              </div>
              <div style={{ marginTop: '28px' }} data-reveal="">
                <a href={BUSINESS.bbbUrl} target="_blank" rel="noopener noreferrer" className="link-btn">
                  <span>See us on the BBB</span>
                  <ArrowUpRight size={15} className="btn-arrow" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-dark-steel" aria-labelledby="stand-behind-h2" style={{ overflow: 'hidden' }}>
        <CloudImg imgKey="steel" decorative sizes="100vw" defaultWidth={1440} className="texture-bg" />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <h2 id="stand-behind-h2" data-split="">
            We stand behind the work
          </h2>
          {/* EDIT: The one-year warranty wording */}
          <p className="body-lg measure" data-reveal="" style={{ marginTop: '20px', marginBottom: 0, color: 'rgba(255, 255, 255, 0.78)' }}>
            New projects and renovations come with a one-year warranty. HVAC units and appliances carry the
            manufacturer&apos;s warranty. If something is not right, call us.
          </p>
        </div>
      </section>

      <section className="section section-light-white" aria-labelledby="talk-wendell-h2">
        <div className="container">
          <h2 id="talk-wendell-h2" data-split="">
            Talk to Wendell
          </h2>

          {/* EDIT: Owner title "Owner" and the owner name block */}
          <div className="owner-card" style={{ marginTop: '32px' }} data-reveal="">
            <p style={{ marginTop: 0, fontWeight: 700, fontSize: '1.125rem' }}>{BUSINESS.owner.full}</p>
            <p style={{ margin: '8px 0' }}>
              <a href={BUSINESS.phoneMain.href} className="inline-link">
                {BUSINESS.phoneMain.display}
              </a>
            </p>
            <p style={{ margin: '8px 0' }}>
              <a href={BUSINESS.phoneOffice.href} className="inline-link">
                {BUSINESS.phoneOffice.display}
              </a>
            </p>
            <p style={{ margin: '8px 0' }}>
              <a href={`mailto:${BUSINESS.email}`} className="inline-link">
                {BUSINESS.email}
              </a>
            </p>
            <address style={{ margin: '8px 0', color: 'var(--slate)' }}>{BUSINESS.address.full}</address>
            {/* EDIT: Office hours (opening time is known, closing time is assumed 5:00 PM) */}
            <p style={{ margin: '8px 0 0', color: 'var(--slate)' }}>
              Monday to Friday, opens 9:00 AM. Walk-ins welcome.
            </p>

            <div className="btn-group" style={{ marginTop: '28px' }}>
              <a href={BUSINESS.phoneMain.href} className="btn btn-primary">
                <span>Call now</span>
              </a>
              <a href="/contact/" className="btn btn-outline-light">
                <span>Send a message</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
