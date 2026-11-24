import { ArrowUpRight } from 'lucide-react';
import { BUSINESS } from '../lib/site-data.js';

export const metadata = {
  title: 'Page not found | WK Construction Inc.',
  description: 'The requested page could not be found.',
};

export default function NotFoundPage() {
  return (
    <section
      className="section section-dark-ink"
      style={{ minHeight: '78svh', display: 'flex', alignItems: 'center', paddingTop: '140px' }}
      aria-labelledby="not-found-h1"
    >
      <div className="container">
        <h1 id="not-found-h1">That page is not here.</h1>
        <p className="body-lg measure" style={{ marginTop: '20px', color: 'var(--ash)' }}>
          Try the home page or give us a call at {BUSINESS.phoneMain.display}.
        </p>
        <div className="btn-group" style={{ marginTop: '32px' }}>
          <a href="/" className="btn btn-primary">
            <span>Back to home</span>
          </a>
          <a href="/contact/" className="btn btn-outline-dark">
            <span>Contact us</span>
            <ArrowUpRight size={16} className="btn-arrow" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
