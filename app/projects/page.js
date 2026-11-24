import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import {
  BUSINESS,
  IMAGES,
  PROJECTS_DATA,
  buildPageMetadata,
  getBreadcrumbJsonLd,
} from '../../lib/site-data.js';
import { buildCloudinaryUrl } from '../../lib/site-utils.js';
import CtaBand from '../../components/CtaBand.js';
import CloudImg from '../../components/CloudImg.js';

export const metadata = buildPageMetadata({
  title: 'Projects | Metal Buildings, Homes & Site Work | WK Construction, Cleveland TX',
  description:
    'See metal buildings, barns, land work, custom homes and build-outs by WK Construction in Cleveland, TX, including the City of Cleveland pavilion.',
  path: '/projects/',
  imageKey: 'pavilion',
});

const FILTER_CATEGORIES = ['All', 'Metal Buildings', 'Site Work', 'Homes', 'Commercial'];

export default function ProjectsPage() {
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Projects', path: '/projects/' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <section className="hero hero-50" data-hero="" aria-labelledby="projects-hero-h1">
        <div className="hero-media frame" data-parallax="">
          <CloudImg
            imgKey="steel"
            eager
            layered
            sizes="100vw"
            defaultWidth={1440}
            altOverride="Steel framing and panels"
            style={{ filter: 'grayscale(1) brightness(0.6)' }}
          />
        </div>
        <div className="hero-overlay-bottom" aria-hidden="true" />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <h1 id="projects-hero-h1" data-split="">
            Our work
          </h1>
        </div>
      </section>

      <div className="section-light-white">
        <div className="container">
          <div className="filter-tab-strip" role="group" aria-label="Filter projects">
            {FILTER_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className="filter-tab"
                data-filter={cat}
                aria-pressed={cat === 'All' ? 'true' : 'false'}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <section className="section" style={{ paddingTop: '48px' }} aria-label="Project gallery">
          <div className="container">
            <div className="projects-grid" data-stagger="">
              {PROJECTS_DATA.map((item) => {
                const fullImg = buildCloudinaryUrl(IMAGES[item.imageKey].url, 1440);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="project-card"
                    data-project-id={item.id}
                    data-category={item.category}
                    data-title={item.title}
                    data-text={item.text}
                    data-full-img={fullImg}
                    data-img-alt={IMAGES[item.imageKey].alt}
                  >
                    <span className="project-card-media frame">
                      <CloudImg
                        imgKey={item.imageKey}
                        layered
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        defaultWidth={960}
                      />
                    </span>
                    <span className="project-card-overlay" aria-hidden="true" />
                    <span className="project-card-chip">{item.category}</span>
                    <span className="project-card-content">
                      <span className="h3" style={{ display: 'block' }}>
                        {item.title}
                      </span>
                      <span className="small-text" style={{ display: 'block', marginTop: '6px', color: 'rgba(255, 255, 255, 0.78)' }}>
                        {item.text}
                      </span>
                      <span className="project-card-view">
                        <span>View</span>
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <div
        id="project-lightbox"
        className="lightbox-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lightbox-title"
        aria-hidden="true"
      >
        <div className="lightbox-inner">
          <div className="lightbox-media">
            <img id="lightbox-img" alt="" />
          </div>
          <div className="lightbox-bar">
            <div>
              <h2 id="lightbox-title" className="h3">
                Project
              </h2>
              <p id="lightbox-text" style={{ marginTop: '6px', marginBottom: 0, color: 'var(--ash)' }} />
            </div>
            <div className="lightbox-controls">
              <button type="button" id="lightbox-prev" className="icon-btn" aria-label="Previous project">
                <ArrowLeft size={18} aria-hidden="true" />
              </button>
              <button type="button" id="lightbox-next" className="icon-btn" aria-label="Next project">
                <ArrowRight size={18} aria-hidden="true" />
              </button>
              <button type="button" id="lightbox-close" className="icon-btn" aria-label="Close lightbox">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <CtaBand
        heading="Want to see yours here?"
        paragraph={`Call ${BUSINESS.phoneMain.display} or send a note.`}
      />
    </>
  );
}
