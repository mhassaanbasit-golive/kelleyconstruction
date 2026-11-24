import { ArrowUpRight, Phone } from 'lucide-react';
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
  title: 'Custom Homes, Log Homes & Commercial Build-Outs in Cleveland, TX | WK Construction',
  description:
    'Custom home builder in Cleveland, TX. Log homes, commercial build-outs and renovations by a family-owned crew with over 45 years of experience and a one-year warranty.',
  path: '/custom-construction/',
  imageKey: 'log-ext',
});

const CUSTOM_FAQS = [
  {
    q: 'Do you build log homes?',
    a: 'Yes. Custom homes, including log homes, are some of our favorite jobs.',
  },
  {
    q: 'Can you finish out a commercial space?',
    a: 'Yes. We frame, finish, and hand over the space ready to use.',
  },
  {
    q: 'Do renovations have a warranty?',
    a: "Yes. New projects and renovations both come with a one-year warranty. HVAC units and appliances carry the manufacturer's warranty.",
  },
];

const RENOVATIONS = [
  { num: '01', title: 'Repairs', text: 'Structural fixes done right, so you do not fix them twice.' },
  { num: '02', title: 'Additions', text: 'More room, built to match what you already have.' },
  { num: '03', title: 'Updates', text: 'Inside and out, from a single room to the whole building.' },
];

const PROMISES = [
  { title: 'Reliable', text: 'We show up when we say we will.' },
  { title: 'Clear talk', text: 'You know what is happening on your job.' },
  { title: 'Honest', text: 'If something changes, you hear it from us first.' },
  { title: 'Built to last', text: 'We build it right, and we fix what is not.' },
];

export default function CustomConstructionPage() {
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Custom Homes, Log Homes, Commercial Build-Outs and Renovations',
    provider: { '@id': `${BASE_URL}/#business` },
    areaServed: ['Liberty County, TX', 'Chambers County, TX', 'Hardin County, TX'],
    description:
      'Custom homes including log homes, commercial build-outs, and renovations with a one-year warranty.',
  };

  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Custom Construction', path: '/custom-construction/' },
  ]);

  const jsonLdBlocks = [serviceJsonLd, breadcrumbJsonLd, getFaqJsonLd(CUSTOM_FAQS)];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBlocks) }}
      />

      <section className="hero hero-85" data-hero="" aria-labelledby="custom-hero-h1">
        <div className="hero-media frame" data-parallax="">
          <CloudImg imgKey="log-ext" eager layered sizes="100vw" defaultWidth={1440} />
        </div>
        <div className="hero-overlay-bottom" aria-hidden="true" />

        <div className="container">
          <div className="hero-content">
            <h1 id="custom-hero-h1" data-split="">
              Homes and spaces built to be used.
            </h1>
            <p className="body-lg measure" data-hero-para="" style={{ marginTop: '20px', color: 'rgba(255, 255, 255, 0.78)' }}>
              Custom homes, log homes, commercial build-outs, and renovations, built by one family-owned crew.
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
        </div>
      </section>

      <section className="section section-light-white chamfer-top" aria-labelledby="custom-homes-h2">
        <div className="container">
          <div className="custom-split">
            <div>
              <h2 id="custom-homes-h2" data-split="">
                Custom homes
              </h2>
              <p className="measure" data-reveal="" style={{ marginTop: '18px', color: 'var(--slate)' }}>
                We build custom homes, including log homes. You tell us how you live, and we build around that. From
                the slab to the front porch, you know what is happening on your job.
              </p>
              <div style={{ marginTop: '28px' }} data-reveal="">
                <a href="/contact/" className="link-btn">
                  <span>Start with a visit</span>
                  <ArrowUpRight size={15} className="btn-arrow" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="overlap-frames">
              <div className="overlap-frame-primary frame" data-image-reveal="" data-parallax="">
                <CloudImg imgKey="log-ext" layered sizes="(max-width: 899px) 100vw, 45vw" defaultWidth={960} />
              </div>
              <div className="overlap-frame-secondary frame" data-image-reveal="">
                <CloudImg imgKey="log-int" layered sizes="(max-width: 899px) 100vw, 30vw" defaultWidth={960} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-light-mist" aria-labelledby="custom-quote-h2">
        <div className="container">
          <div style={{ maxWidth: '820px', marginInline: 'auto', textAlign: 'center' }}>
            <blockquote id="custom-quote-h2" className="quote-text" data-split="">
              &ldquo;I can honestly say that we have not had any failures in the construction of our home and that is
              saying a lot for a log home!&rdquo;
            </blockquote>
            <p data-reveal="" style={{ marginTop: '20px', marginBottom: 0, fontWeight: 700, color: 'var(--slate)' }}>
              Ann B., BBB customer review
            </p>
          </div>
        </div>
      </section>

      <section id="commercial" className="section section-dark-navy" style={{ paddingBlock: 0 }} aria-labelledby="commercial-h2">
        <div className="bleed-split">
          <div className="bleed-split-media frame" data-image-reveal="" data-parallax="">
            <CloudImg imgKey="buildout" layered sizes="(max-width: 899px) 100vw, 50vw" defaultWidth={1440} />
          </div>

          <div className="bleed-split-body">
            <h2 id="commercial-h2" data-split="">
              Commercial build-outs
            </h2>
            <p className="body-lg measure" data-reveal="" style={{ marginTop: '18px', color: 'var(--ash)' }}>
              Empty space is only the start. We frame it, finish it, and hand it back ready to open.
            </p>
            <div className="btn-group" data-reveal="" style={{ marginTop: '28px' }}>
              <a href="/metal-buildings/" className="link-btn">
                <span>Metal Buildings</span>
                <ArrowUpRight size={15} className="btn-arrow" aria-hidden="true" />
              </a>
              <a href="/site-prep-and-land/" className="link-btn">
                <span>Site Prep and Land</span>
                <ArrowUpRight size={15} className="btn-arrow" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-light-white" aria-labelledby="reno-h2">
        <div className="container">
          <h2 id="reno-h2" data-split="">
            Renovations
          </h2>

          <div className="reno-list" data-stagger="">
            {RENOVATIONS.map((row) => (
              <div key={row.num} className="reno-row">
                <div className="reno-num" aria-hidden="true">
                  {row.num}
                </div>
                <div>
                  <h3>{row.title}</h3>
                  <p style={{ marginTop: '8px', marginBottom: 0, color: 'var(--slate)' }}>{row.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* EDIT: The one-year warranty wording */}
          <p className="body-lg" data-reveal="" style={{ marginTop: '28px', marginBottom: 0, fontWeight: 700 }}>
            Every renovation comes with a one-year warranty.
          </p>
        </div>
      </section>

      <section className="section section-dark-steel" aria-labelledby="count-on-h2">
        <div className="container">
          <h2 id="count-on-h2" data-split="">
            What you can count on
          </h2>

          <div className="promise-grid" data-stagger="">
            {PROMISES.map((item) => (
              <article key={item.title} className="promise-col">
                <h3>{item.title}</h3>
                <p style={{ marginTop: '10px', marginBottom: 0, color: 'var(--ash)' }}>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FaqSection id="custom-faq" faqs={CUSTOM_FAQS} surface="white" />

      <CtaBand />
    </>
  );
}
