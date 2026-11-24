import { ArrowUpRight, Check, Phone } from 'lucide-react';
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
  title: 'Metal Buildings in Cleveland, TX | Steel Shops, Barns & Warehouses | WK Construction',
  description:
    'Pre-engineered steel buildings in Cleveland, TX and nearby counties. Shops, warehouses, barns and commercial buildings, with slab work and erection done by one crew. Free quotes.',
  path: '/metal-buildings/',
  imageKey: 'metal-ext',
});

const METAL_FAQS = [
  {
    q: 'How long does a metal building take?',
    a: 'It depends on the size, the ground, and the permits. We give you a timeline in the written quote.',
  },
  {
    q: 'Can you build on my land?',
    a: 'Yes. We work in Liberty, Chambers, and Hardin counties and the towns around Cleveland. If the lot needs clearing or leveling, we do that too.',
  },
  {
    q: 'Can I get a building for my farm?',
    a: 'Yes. Barns, hay storage, and equipment buildings are some of the buildings we put up most.',
  },
];

const METAL_BLOCKS = [
  {
    key: 'metal-ext',
    title: 'Shops and warehouses',
    text: 'Wide open floors with no posts in the way. Move trucks, stock, and machines the way you need to.',
  },
  {
    id: 'farm',
    key: 'barn',
    title: 'Farm and ranch buildings',
    text: 'Barns, hay storage, and equipment sheds. Built tough for weather, animals, and heavy use.',
  },
  {
    key: 'buildout',
    title: 'Commercial buildings',
    text: 'Storefronts, offices, and light industrial space in steel, ready for the next step.',
  },
  {
    key: 'metal-int',
    title: 'Clear-span frames',
    text: 'No columns inside the span. More usable floor, easier to lay out, and easier to change later.',
  },
];

const GALLERY_PANELS = [
  {
    key: 'metal-ext',
    caption: 'Outside: steel panels, roll-up doors, room to pull a truck in.',
  },
  {
    key: 'metal-int',
    caption: 'Inside: a clear span and a clean concrete floor.',
  },
  {
    key: 'barn',
    caption: 'On the farm: an open barn for animals and equipment.',
  },
];

const CHECKLIST_ITEMS = [
  'Site walk and written quote',
  'Land clearing and grading',
  'Concrete slab',
  'Steel frame and panels',
  'Doors, windows, and insulation options',
  'Final walk-through and a one-year warranty',
];

export default function MetalBuildingsPage() {
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Pre-Engineered Metal Buildings',
    provider: { '@id': `${BASE_URL}/#business` },
    areaServed: ['Liberty County, TX', 'Chambers County, TX', 'Hardin County, TX'],
    description:
      'Shops, warehouses, barns, and commercial buildings in clear-span steel, with concrete slab and erection done by one crew.',
  };

  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Metal Buildings', path: '/metal-buildings/' },
  ]);

  const jsonLdBlocks = [serviceJsonLd, breadcrumbJsonLd, getFaqJsonLd(METAL_FAQS)];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBlocks) }}
      />

      <section className="hero hero-80" data-hero="" aria-labelledby="metal-hero-h1">
        <div className="hero-media" data-parallax="">
          <CloudImg imgKey="metal-ext" eager sizes="100vw" defaultWidth={1440} />
        </div>
        <div className="hero-overlay" aria-hidden="true" />

        <div className="container">
          <div className="hero-content">
            <h1 id="metal-hero-h1" data-split="">
              Metal buildings, built start to finish.
            </h1>
            <p className="body-lg measure" data-hero-para="" style={{ marginTop: '20px', color: 'rgba(255, 255, 255, 0.78)' }}>
              Shops, warehouses, barns, and commercial buildings. We pour the slab and put up the steel.
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

      <section className="section section-light-white chamfer-top" aria-labelledby="steel-fits-h2">
        <div className="container">
          <div className="sticky-split">
            <div className="sticky-split-aside">
              <h2 id="steel-fits-h2" data-split="">
                Steel that fits your work
              </h2>
              <p className="measure" data-reveal="" style={{ marginTop: '18px', color: 'var(--slate)' }}>
                A good steel building starts with how you will use it. Tell us what goes inside, and we will size it to
                match.
              </p>
              <div style={{ marginTop: '28px' }} data-reveal="">
                <a href="/contact/" className="btn btn-outline-light">
                  <span>Talk to us</span>
                  <ArrowUpRight size={16} className="btn-arrow" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="sticky-split-blocks">
              {METAL_BLOCKS.map((block) => (
                <article key={block.title} id={block.id} className="split-block" data-reveal="">
                  <h3>{block.title}</h3>
                  <p style={{ marginTop: '10px', marginBottom: 0, color: 'var(--slate)' }}>{block.text}</p>
                  <div className="split-block-img" data-image-reveal="" data-parallax="">
                    <CloudImg
                      imgKey={block.key}
                      sizes="(max-width: 899px) 100vw, 55vw"
                      defaultWidth={960}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-dark-ink hscroll-section" aria-labelledby="inside-out-h2">
        <div className="container">
          <h2 id="inside-out-h2" data-split="">
            Inside and out
          </h2>

          <div className="hscroll-track">
            {GALLERY_PANELS.map((panel) => (
              <figure key={panel.key} className="hscroll-panel" style={{ margin: 0 }}>
                <div className="hscroll-panel-img">
                  <CloudImg
                    imgKey={panel.key}
                    sizes="(max-width: 899px) 84vw, 820px"
                    defaultWidth={1440}
                  />
                </div>
                <figcaption style={{ marginTop: '14px', color: 'var(--ash)' }}>{panel.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-light-mist" aria-labelledby="one-crew-h2">
        <div className="container">
          <div className="sticky-split">
            <div>
              <h2 id="one-crew-h2" data-split="">
                One crew, one job
              </h2>
              <div className="btn-group" data-reveal="" style={{ marginTop: '28px' }}>
                <a href="/site-prep-and-land/" className="link-btn">
                  <span>Site Prep and Land</span>
                  <ArrowUpRight size={15} className="btn-arrow" aria-hidden="true" />
                </a>
                <a href="/custom-construction/" className="link-btn">
                  <span>Custom Construction</span>
                  <ArrowUpRight size={15} className="btn-arrow" aria-hidden="true" />
                </a>
              </div>
            </div>

            <ul className="checklist" data-stagger="">
              {CHECKLIST_ITEMS.map((item) => (
                <li key={item} className="checklist-item">
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '4px',
                      border: '1px solid var(--gold)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: 'var(--gold-deep)',
                    }}
                    data-check-svg=""
                  >
                    <Check size={16} aria-hidden="true" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <FaqSection id="metal-faq" faqs={METAL_FAQS} surface="white" />

      <CtaBand />
    </>
  );
}
