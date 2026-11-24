import { BUSINESS } from '../lib/site-data.js';

export default function AreaChips() {
  return (
    <ul className="chip-group" style={{ listStyle: 'none', margin: 0, padding: 0 }} data-stagger="">
      {BUSINESS.serviceAreas.map((area) => (
        <li key={area}>
          <span className="area-chip">{area}</span>
        </li>
      ))}
    </ul>
  );
}
