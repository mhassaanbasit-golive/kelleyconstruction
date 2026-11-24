import { ArrowUpRight } from 'lucide-react';
import { BUSINESS } from '../lib/site-data.js';

export default function CtaBand({
  heading = 'Have a job in mind?',
  paragraph = `Call ${BUSINESS.phoneMain.display} or send us a note. We will get back to you.`,
}) {
  return (
    <section className="section section-dark-ink" aria-labelledby="cta-band-heading">
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 id="cta-band-heading" data-split="">
          {heading}
        </h2>
        <p
          className="body-lg measure"
          data-reveal=""
          style={{ marginInline: 'auto', marginTop: '20px', color: 'var(--ash)' }}
        >
          {paragraph}
        </p>
        <div className="btn-group" data-reveal="" style={{ justifyContent: 'center', marginTop: '32px' }}>
          <a href="/contact/" className="btn btn-primary">
            <span>Get a free quote</span>
            <ArrowUpRight size={16} className="btn-arrow" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
