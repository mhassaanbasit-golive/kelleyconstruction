import { ArrowUpRight, Phone } from 'lucide-react';
import {
  BASE_URL,
  BUSINESS,
  buildPageMetadata,
  getBusinessJsonLd,
  getFaqJsonLd,
} from '../lib/site-data.js';
import AreaChips from '../components/AreaChips.js';
import FaqSection from '../components/FaqSection.js';
import CtaBand from '../components/CtaBand.js';
import CloudImg from '../components/CloudImg.js';

export const metadata = buildPageMetadata({
  title: 'Metal Buildings & Custom Homes in Cleveland, TX | WK Construction',
  description:
    'Family-owned construction company in Cleveland, TX. Metal buildings, land clearing, slabs, custom homes and build-outs in Liberty, Chambers and Hardin counties. Free quotes.',
  path: '/',
  imageKey: 'hero',
});

const HOME_FAQS = [
  {
    q: 'Do you give free quotes?',
    a: 'Yes. Call us or stop by during office hours and we will set up a time to look at the job. You get a written quote after that.',
  },
  {
    q: 'Do you do the land work and the slab too?',
    a: 'Yes. We clear, grade, level, and pour the slab, so one crew can take a job from bare ground to a finished building.',
  },
  {
    q: 'What kinds of metal buildings do you put up?',
    a: 'Shops, warehouses, barns, and commercial buildings. Clear-span steel in a size that fits your work.',
  },
  {
    q: 'Do you build log homes?',
    a: 'Yes. We build custom homes, including log homes.',
  },
  {
    q: 'Is there a warranty?',
    // EDIT: The one-year warranty wording
    a: "We give a one-year warranty on new projects and renovations. HVAC units and appliances carry the manufacturer's warranty.",
  },
  {
    q: 'Where do you work?',
    a: 'Liberty, Chambers, and Hardin counties, and the towns of Cleveland, Plum Grove, Humble, Dayton, Crosby, and Shepherd.',
  },
];

const SERVICE_CARDS = [
  {
    key: 'metal-ext',
    title: 'Metal Buildings',
    short: 'Shops, warehouses, and barns in clear-span steel that goes up fast and lasts.',
    hover:
      'Pre-engineered steel buildings for work, storage, and farm use. We handle the slab and the steel, start to finish.',
    href: '/metal-buildings/',
    wide: false,
  },
  {
    key: 'grading',
    title: 'Site Prep and Land',
    short: 'Clearing, grading, and leveling. A solid start for anything you build.',
    hover:
      'We clear brush and trees, grade the ground, and level it so the building sits flat and water runs away from it.',
    href: '/site-prep-and-land/',
    wide: false,
  },
  {
    key: 'log-ext',
    title: 'Custom Homes',
    short: 'Log homes and custom builds made to be lived in.',
    hover:
      'From the slab to the front porch. We build the home the way you want it, and we keep you in the loop the whole way.',
    href: '/custom-construction/',
    wide: false,
  },
  {
    key: 'buildout',
    title: 'Commercial Build-Outs',
    short: 'Shops, offices, and store spaces, finished and ready for work.',
    hover:
      'We turn bare space into a working one. Framing, walls, finishes, and the details in between.',
    href: '/custom-construction/#commercial',
    wide: true,
  },
  {
    key: 'barn',
    title: 'Barns and Farm Buildings',
    short: 'Steel barns for horses, cattle, hay, and equipment.',
    hover: 'Open-span barns built for animals and machines, sized to your land.',
    href: '/metal-buildings/#farm',
    wide: true,
  },
];

const FEATURED_WORK = [
  {
    num: '01',
    key: 'pavilion',
    title: 'City of Cleveland Pavilion, Cleveland, TX',
    // EDIT: The City of Cleveland pavilion text (confirm scope and add a real photo)
    text: 'We were one of the contractors on the new city pavilion, finished in May 2024. A covered place for the town to gather.',
    offset: false,
  },
  {
    num: '02',
    key: 'metal-int',
    // EDIT: All project photos other than the pavilion are illustrative: replace them with real job photos
    title: 'Metal shops and warehouses',
    text: 'Clear-span steel buildings with big roll-up doors and open floors, sized for how you work.',
    offset: true,
  },
  {
    num: '03',
    key: 'log-int',
    title: 'Custom log homes',
    text: 'Warm, solid homes built from the slab up. One owner told the BBB they had no failures in their log home, and that is saying a lot.',
    offset: false,
  },
  {
    num: '04',
    key: 'barn',
    title: 'Steel barns',
    text: 'Barns for horses, cattle, hay, and equipment on open pasture.',
    offset: true,
  },
];

const PROCESS_STEPS = [
  {
    key: 'about',
    title: 'We come out',
    text: 'Call or stop by the office. We walk the land with you, hear what you need, and give you a written quote. It is free.',
  },
  {
    key: 'grading',
    title: 'We prep the ground',
    text: 'Clearing, grading, and leveling, so the build starts on solid, dry ground.',
  },
  {
    key: 'slab',
    title: 'Slab and frame',
    text: 'We pour the concrete slab and put up the frame, steel or wood.',
  },
  {
    key: 'metal-ext',
    title: 'Finish and hand over',
    text: 'We finish the job, walk it with you, and stand behind it with a one-year warranty on new work.',
  },
];

export default function HomePage() {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BUSINESS.displayName,
    url: `${BASE_URL}/`,
  };

  const jsonLdBlocks = [getBusinessJsonLd(), websiteJsonLd, getFaqJsonLd(HOME_FAQS)];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBlocks) }}
      />

      <section className="hero hero-home" data-hero="" aria-labelledby="home-hero-h1">
        <div className="hero-media frame" data-parallax="">
          <CloudImg imgKey="hero" eager layered sizes="100vw" defaultWidth={1440} />
        </div>
        <div className="hero-overlay" aria-hidden="true" />

        <div className="container">
          <div className="hero-content">
            <h1 id="home-hero-h1" data-split="">
              Built right in East Texas<span className="gold-dot">.</span>
            </h1>
            <p className="body-lg measure" data-hero-para="" style={{ marginTop: '20px', color: 'rgba(255, 255, 255, 0.78)' }}>
              Metal buildings, land work, and custom homes around Cleveland, TX. Family owned for over 45 years. Call us
              and we will come take a look.
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

        <svg
          className="deco-corner-svg"
          viewBox="0 0 120 120"
          fill="none"
          aria-hidden="true"
          data-draw-svg=""
        >
          <polyline points="0,119 72,119 119,72 119,0" stroke="#D9A62E" strokeWidth="1" />
        </svg>
      </section>

      <section className="section section-dark-navy chamfer-top text-fill-section" aria-labelledby="statement-h2">
        <div className="container">
          <h2 id="statement-h2" className="text-fill-heading" data-text-fill="">
            <span className="text-fill-word" data-word="We">We</span>{' '}
            <span className="text-fill-word" data-word="clear">clear</span>{' '}
            <span className="text-fill-word" data-word="the">the</span>{' '}
            <span className="text-fill-word" data-accent="" data-word="land.">land.</span>{' '}
            <span className="text-fill-word" data-word="We">We</span>{' '}
            <span className="text-fill-word" data-word="pour">pour</span>{' '}
            <span className="text-fill-word" data-word="the">the</span>{' '}
            <span className="text-fill-word" data-accent="" data-word="slab.">slab.</span>{' '}
            <span className="text-fill-word" data-word="We">We</span>{' '}
            <span className="text-fill-word" data-word="put">put</span>{' '}
            <span className="text-fill-word" data-word="up">up</span>{' '}
            <span className="text-fill-word" data-word="the">the</span>{' '}
            <span className="text-fill-word" data-accent="" data-word="steel.">steel.</span>
          </h2>

          <p
            className="body-lg measure"
            data-reveal=""
            style={{ marginInline: 'auto', marginTop: '28px', color: 'var(--ash)' }}
          >
            Most jobs start with a phone call. Tell us what you want to build and where. We will come out, look at the
            ground, and give you a straight answer and a written quote.
          </p>

          <div style={{ marginTop: '24px' }} data-reveal="">
            <a href="#process" className="link-btn">
              <span>How a job goes</span>
              <ArrowUpRight size={15} className="btn-arrow" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="section section-light-mist" aria-labelledby="build-h2">
        <div className="container">
          <h2 id="build-h2" data-split="">
            What we build
          </h2>

          <div className="services-mosaic" data-stagger="">
            {SERVICE_CARDS.map((card) => (
              <a
                key={card.key}
                href={card.href}
                className={`service-card${card.wide ? ' is-wide' : ''}`}
              >
                <div className="service-card-media frame">
                  <CloudImg
                    imgKey={card.key}
                    layered
                    sizes={card.wide ? '(max-width: 899px) 100vw, 50vw' : '(max-width: 899px) 100vw, 33vw'}
                    defaultWidth={960}
                  />
                </div>
                <div className="service-card-scrim" aria-hidden="true" />
                <div className="service-card-front">
                  <div className="service-card-line" aria-hidden="true" />
                  <h3>{card.title}</h3>
                  <p className="service-card-short">{card.short}</p>
                </div>
                <div className="service-card-hover">
                  <div className="service-card-hover-top">
                    <ArrowUpRight size={22} aria-hidden="true" />
                  </div>
                  <div className="service-card-hover-body">
                    <h3>{card.title}</h3>
                    <p style={{ margin: 0, fontWeight: 500 }}>{card.hover}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div
            style={{
              marginTop: '40px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
            }}
            data-reveal=""
          >
            <p className="body-lg" style={{ margin: 0 }}>
              Not sure which one fits? Call us and we will talk it through.
            </p>
            <a href={BUSINESS.phoneMain.href} className="btn btn-primary">
              <span>Call {BUSINESS.phoneMain.display}</span>
            </a>
          </div>
        </div>
      </section>

      <section className="section section-dark-steel" aria-labelledby="trust-h2" style={{ overflow: 'hidden' }}>
        <CloudImg imgKey="steel" decorative sizes="100vw" defaultWidth={1440} className="texture-bg" />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <h2 id="trust-h2" data-split="">
            Why folks trust us
          </h2>

          <div className="trust-grid" data-stagger="">
            <div className="trust-cell">
              <div className="trust-number" data-counter="45" data-counter-suffix="+">
                45+
              </div>
              <p style={{ marginTop: '12px', marginBottom: 0, color: 'var(--ash)' }}>
                years in business, family owned
              </p>
            </div>
            <div className="trust-cell">
              <div className="trust-number" data-counter-fade="">
                A+
              </div>
              <p style={{ marginTop: '12px', marginBottom: 0, color: 'var(--ash)' }}>BBB rating</p>
            </div>
            <div className="trust-cell">
              <div className="trust-number" data-counter-fade="">
                2004
              </div>
              <p style={{ marginTop: '12px', marginBottom: 0, color: 'var(--ash)' }}>BBB Accredited since</p>
            </div>
            <div className="trust-cell">
              <div className="trust-number">
                <span data-counter="1">1</span> year
              </div>
              <p style={{ marginTop: '12px', marginBottom: 0, color: 'var(--ash)' }}>
                warranty on new work and renovations
              </p>
            </div>
          </div>

          <p className="small-text" data-reveal="" style={{ textAlign: 'center', marginTop: '24px', color: 'var(--ash)' }}>
            No BBB complaints in the last three years.
          </p>
        </div>
      </section>

      <section className="section section-light-white" aria-labelledby="work-h2">
        <div className="container">
          <h2 id="work-h2" data-split="">
            Work you can see
          </h2>

          <div className="project-rows">
            {FEATURED_WORK.map((item) => (
              <article
                key={item.num}
                className={`project-row${item.offset ? ' is-offset' : ''}`}
                data-reveal=""
              >
                <div className="project-row-img frame" data-image-reveal="" data-parallax="">
                  <CloudImg
                    imgKey={item.key}
                    layered
                    sizes="(max-width: 899px) 100vw, 280px"
                    defaultWidth={960}
                  />
                </div>

                <div className="project-row-body">
                  <h3>{item.title}</h3>
                  <p style={{ marginTop: '12px', marginBottom: 0, color: 'var(--slate)' }}>{item.text}</p>
                </div>

                <div className="project-row-num" aria-hidden="true">
                  {item.num}
                </div>
              </article>
            ))}
          </div>

          <div style={{ marginTop: '36px' }} data-reveal="">
            <a href="/projects/" className="link-btn">
              <span>See all projects</span>
              <ArrowUpRight size={15} className="btn-arrow" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section id="process" className="section section-dark-navy" aria-labelledby="process-h2">
        <div className="container">
          <h2 id="process-h2" data-split="">
            How a job goes
          </h2>

          <div className="process-list">
            {PROCESS_STEPS.map((step, idx) => {
              const isEven = idx % 2 === 1;
              return (
                <div key={step.title} className={`process-step${isEven ? ' is-even' : ''}`} data-reveal="">
                  <div className="process-step-media frame" data-image-reveal="" data-parallax="">
                    <CloudImg
                      imgKey={step.key}
                      layered
                      sizes="(max-width: 899px) 100vw, 50vw"
                      defaultWidth={960}
                    />
                  </div>
                  <div className="process-step-text">
                    <h3>{step.title}</h3>
                    <p style={{ marginTop: '12px', marginBottom: 0, color: 'var(--ash)' }}>{step.text}</p>
                  </div>

                  {idx < PROCESS_STEPS.length - 1 && (
                    <svg
                      className="process-connector-svg"
                      viewBox="0 0 240 80"
                      fill="none"
                      aria-hidden="true"
                      data-draw-svg=""
                    >
                      {isEven ? (
                        <path
                          d="M 190 0 L 190 32 Q 190 40 182 40 L 58 40 Q 50 40 50 48 L 50 80"
                          stroke="#D9A62E"
                          strokeWidth="1"
                        />
                      ) : (
                        <path
                          d="M 50 0 L 50 32 Q 50 40 58 40 L 182 40 Q 190 40 190 48 L 190 80"
                          stroke="#D9A62E"
                          strokeWidth="1"
                        />
                      )}
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-light-mist" aria-labelledby="quote-h2">
        <div className="container">
          <div className="quote-block">
            <blockquote id="quote-h2" className="quote-text" data-split="">
              &ldquo;I can honestly say that we have not had any failures in the construction of our home and that is
              saying a lot for a log home!&rdquo;
            </blockquote>
            <p data-reveal="" style={{ marginTop: '20px', marginBottom: 0, fontWeight: 700, color: 'var(--slate)' }}>
              Ann B., BBB customer review
            </p>
          </div>
        </div>
      </section>

      <section className="section section-light-white" aria-labelledby="area-h2">
        <div className="container">
          <div className="sticky-split" style={{ alignItems: 'center' }}>
            <div>
              <h2 id="area-h2" data-split="">
                Where we work
              </h2>
              <p className="measure" data-reveal="" style={{ marginTop: '16px', marginBottom: 0, color: 'var(--slate)' }}>
                We work in Liberty, Chambers, and Hardin counties, and in Cleveland, Plum Grove, Humble, Dayton, Crosby,
                and Shepherd. Not sure if you are in range? Call us.
              </p>
            </div>

            <AreaChips />
          </div>
        </div>
      </section>

      <FaqSection id="home-faq" faqs={HOME_FAQS} surface="mist" />

      <CtaBand />
    </>
  );
}
