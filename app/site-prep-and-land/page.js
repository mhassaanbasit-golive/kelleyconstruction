import { ArrowLeftRight, ArrowUpRight, Phone } from 'lucide-react';
import {
  BASE_URL,
  BUSINESS,
  buildPageMetadata,
  getBreadcrumbJsonLd,
  getFaqJsonLd,
} from '../../lib/site-data.js';
import FaqSection from '../../components/FaqSection.js';
import CtaBand from '../../components/CtaBand.js';
import CloudImg from '../../components/CloudImg.js';

export const metadata = buildPageMetadata({
  title: 'Land Clearing, Grading & Concrete Slabs in Cleveland, TX | WK Construction',
  description:
    'Land clearing, grading, leveling and concrete slab foundations in Cleveland, TX and Liberty, Chambers and Hardin counties. One crew from bare ground to a finished build.',
  path: '/site-prep-and-land/',
  imageKey: 'grading',
});

const SITE_FAQS = [
  {
    q: 'How long does land clearing take?',
    a: 'It depends on how thick the brush is and how big the lot is. We give you a timeline when we see the land.',
  },
  {
    q: 'Will you build on the land after you clear it?',
    a: 'Yes. We can clear, grade, pour the slab, and build, all with the same crew.',
  },
  {
    q: 'Do you work outside Cleveland?',
    a: 'Yes. Liberty, Chambers, and Hardin counties, plus Plum Grove, Humble, Dayton, Crosby, and Shepherd.',
  },
];

const SITE_STEPS = [
  {
    num: '1',
    title: 'Clearing',
    text: 'We take out brush, trees, and stumps so you can see what you have to work with.',
  },
  {
    num: '2',
    title: 'Grading',
    text: 'We shape the ground so water runs away from where you will build.',
  },
  {
    num: '3',
    title: 'Leveling',
    text: 'A flat, packed pad is the base for every building. We do not rush it.',
  },
  {
    num: '4',
    title: 'Concrete slab',
    text: 'We set the forms and rebar, then pour the concrete.',
  },
];

export default function SitePrepAndLandPage() {
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Land Clearing, Grading and Concrete Slabs',
    provider: { '@id': `${BASE_URL}/#business` },
    areaServed: ['Liberty County, TX', 'Chambers County, TX', 'Hardin County, TX'],
    description: 'Land clearing, grading, leveling, and concrete slab foundations in Cleveland, TX.',
  };

  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Site Prep and Land', path: '/site-prep-and-land/' },
  ]);

  const jsonLdBlocks = [serviceJsonLd, breadcrumbJsonLd, getFaqJsonLd(SITE_FAQS)];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBlocks) }}
      />

      <section className="hero-split" data-hero="" aria-labelledby="site-hero-h1">
        <div className="hero-split-text">
          <h1 id="site-hero-h1" data-split="">
            Solid ground first.
          </h1>
          <p className="body-lg measure" data-hero-para="" style={{ marginTop: '20px', color: 'rgba(255, 255, 255, 0.78)' }}>
            Land clearing, grading, leveling, and concrete slabs in Liberty, Chambers, and Hardin counties.
          </p>
          <div className="btn-group" data-hero-actions="" style={{ marginTop: '32px' }}>
            <a href="/contact/" className="btn btn-primary">
              <span>Get a free quote</span>
              <ArrowUpRight size={16} className="btn-arrow" aria-hidden="true" />
            </a>
            <a href={BUSINESS.phoneMain.href} className="btn btn-outline-dark hero-phone-cta">
              <Phone size={15} className="hero-phone-icon" aria-hidden="true" />
              <span>{BUSINESS.phoneMain.display}</span>
            </a>
          </div>
        </div>

        <div className="hero-split-media" data-parallax="">
          <CloudImg
            imgKey="grading"
            eager
            sizes="(max-width: 899px) 100vw, 50vw"
            defaultWidth={1440}
          />
        </div>
      </section>

      <section className="section section-light-white" aria-labelledby="timeline-h2">
        <div className="container">
          <h2 id="timeline-h2" data-split="">
            Four steps to a build-ready lot
          </h2>

          <div className="timeline-wrap">
            <div className="timeline-rail" aria-hidden="true">
              <div className="timeline-rail-fill" />
            </div>

            {SITE_STEPS.map((step) => (
              <div key={step.num} className="timeline-step" data-reveal="">
                <span className="timeline-dot" aria-hidden="true" />
                <div>
                  <h3>
                    {step.num} {step.title}
                  </h3>
                  <p className="measure" style={{ marginTop: '10px', marginBottom: 0, color: 'var(--slate)' }}>
                    {step.text}
                  </p>
                </div>
                <div className="timeline-ghost" aria-hidden="true">
                  0{step.num}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark-navy" aria-labelledby="ba-h2">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h2 id="ba-h2" data-split="">
              Same lot, a few months apart
            </h2>
            <p className="body-lg" data-reveal="" style={{ marginTop: '14px', color: 'var(--ash)' }}>
              Raw land on one side. A finished building on the other.
            </p>
          </div>

          <div className="ba-slider" data-reveal="">
            <div className="ba-layer">
              <CloudImg imgKey="before" sizes="(max-width: 899px) 100vw, 1100px" defaultWidth={1440} />
            </div>
            <div className="ba-layer ba-after">
              <CloudImg imgKey="after" sizes="(max-width: 899px) 100vw, 1100px" defaultWidth={1440} />
            </div>
            <span className="ba-tag ba-tag-after">After</span>
            <span className="ba-tag ba-tag-before">Before</span>
            <div className="ba-divider" aria-hidden="true" />
            <button
              type="button"
              className="ba-handle"
              role="slider"
              aria-label="Before and after comparison"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={50}
            >
              <ArrowLeftRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <section className="slab-fullbleed" aria-labelledby="slab-h2">
        <div className="hero-media" data-parallax="">
          <CloudImg imgKey="slab" sizes="100vw" defaultWidth={1440} />
        </div>
        <div className="container">
          <div className="slab-card">
            <h2 id="slab-h2" data-split="">
              The slab matters most
            </h2>
            <p data-reveal="" style={{ marginTop: '16px', color: 'rgba(255, 255, 255, 0.78)' }}>
              Cracks and settling start at the base. We form it right, set the rebar, and pour it to hold.
            </p>
            <div className="btn-group" data-reveal="" style={{ marginTop: '24px' }}>
              <a href="/metal-buildings/" className="link-btn">
                <span>Metal Buildings</span>
                <ArrowUpRight size={15} className="btn-arrow" aria-hidden="true" />
              </a>
              <a href="/custom-construction/" className="link-btn">
                <span>Custom Construction</span>
                <ArrowUpRight size={15} className="btn-arrow" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <FaqSection id="site-faq" faqs={SITE_FAQS} surface="mist" />

      <CtaBand />
    </>
  );
}
