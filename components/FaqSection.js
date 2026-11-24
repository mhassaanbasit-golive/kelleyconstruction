import { Plus } from 'lucide-react';

export default function FaqSection({
  id = 'faq',
  heading = 'Questions we get a lot',
  faqs,
  surface = 'white',
}) {
  const sectionClass = surface === 'mist' ? 'section section-light-mist' : 'section section-light-white';

  return (
    <section className={sectionClass} aria-labelledby={`${id}-heading`}>
      <div className="container">
        <div className="faq-split">
          <div className="faq-sticky">
            <h2 id={`${id}-heading`} data-split="">
              {heading}
            </h2>
          </div>

          <div className="faq-list" data-reveal="">
            {faqs.map((item, idx) => {
              const panelId = `${id}-panel-${idx}`;
              const triggerId = `${id}-trigger-${idx}`;
              return (
                <div className="faq-item" key={item.q}>
                  <h3>
                    <button
                      type="button"
                      id={triggerId}
                      className="faq-trigger"
                      aria-expanded="false"
                      aria-controls={panelId}
                    >
                      <span>{item.q}</span>
                      <Plus size={20} className="faq-icon" aria-hidden="true" />
                    </button>
                  </h3>
                  <div id={panelId} role="region" aria-labelledby={triggerId} className="faq-panel">
                    <div className="faq-panel-inner">
                      <p className="faq-answer">{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
