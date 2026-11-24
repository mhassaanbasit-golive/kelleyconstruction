import { buildCloudinaryUrl, buildCloudinarySrcSet } from './site-utils.js';

// EDIT: The domain in BASE_URL
export const BASE_URL = 'https://kelleyconstruction.net';

export const BUSINESS = {
  displayName: 'WK Construction Inc.',
  legalName: 'Wendell Kelley Construction, Inc.',
  alternateName: 'Wendell Kelley Construction Co.',
  address: {
    street: '195 Bartlett Rd',
    city: 'Cleveland',
    state: 'TX',
    zip: '77328',
    full: '195 Bartlett Rd, Cleveland, TX 77328',
  },
  // EDIT: Owner title "Owner" and the owner name block
  owner: {
    name: 'Wendell Kelley',
    title: 'Owner',
    full: 'Wendell Kelley, Owner',
  },
  phoneMain: {
    display: '(281) 592-3792',
    href: 'tel:+12815923792',
    schema: '+1-281-592-3792',
  },
  phoneOffice: {
    display: '(281) 593-5422',
    href: 'tel:+12815935422',
    schema: '+1-281-593-5422',
  },
  email: 'wendellkelley@gmail.com',
  // EDIT: Office hours (opening time is known, closing time is assumed 5:00 PM)
  hours: {
    display: 'Monday to Friday, opens 9:00 AM',
    walkIns: 'Walk-ins welcome during office hours. Free estimates.',
    opens: '09:00',
    closes: '17:00',
  },
  bbbUrl: 'https://www.bbb.org/us/tx/cleveland/profile/metal-building/wendell-kelley-construction-co-0845-7001777',
  yelpUrl: 'https://m.yelp.com/biz/kelley-wendell-construction-cleveland',
  mapsEmbedUrl: 'https://www.google.com/maps?q=195+Bartlett+Rd,+Cleveland,+TX+77328&output=embed',
  mapsDirectionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=195+Bartlett+Rd,+Cleveland,+TX+77328',
  serviceAreas: [
    'Cleveland',
    'Plum Grove',
    'Humble',
    'Dayton',
    'Crosby',
    'Shepherd',
    'Liberty County',
    'Chambers County',
    'Hardin County',
  ],
};

export const IMAGES = {
  hero: {
    url: 'https://res.cloudinary.com/cyfb9slf/image/upload/v1795476898/hero-iamge.png',
    alt: 'Large steel commercial building with pine trees behind it in East Texas',
    width: 1920,
    height: 1080,
  },
  'metal-ext': {
    url: 'https://res.cloudinary.com/cyfb9slf/image/upload/v1795476908/metal_building_exterior.png',
    alt: 'Clear-span steel warehouse with roll-up doors and a pickup truck',
    width: 1600,
    height: 1200,
  },
  'metal-int': {
    url: 'https://res.cloudinary.com/cyfb9slf/image/upload/v1795476909/metal_building_interior.png',
    alt: 'Inside a clear-span steel building with a wide open concrete floor',
    width: 1600,
    height: 1200,
  },
  barn: {
    url: 'https://res.cloudinary.com/cyfb9slf/image/upload/v1795476864/agricultural_barn.png',
    alt: 'Steel barn on green pasture with a wood fence',
    width: 1600,
    height: 1200,
  },
  grading: {
    url: 'https://res.cloudinary.com/cyfb9slf/image/upload/v1795476903/site_grading.png',
    alt: 'Bulldozer leveling red clay soil on a cleared lot',
    width: 1600,
    height: 1200,
  },
  slab: {
    url: 'https://res.cloudinary.com/cyfb9slf/image/upload/v1795476894/concrete_slab.png',
    alt: 'Fresh concrete slab with rebar and wood forms, steel frame starting behind it',
    width: 1600,
    height: 1067,
  },
  before: {
    url: 'https://res.cloudinary.com/cyfb9slf/image/upload/v1795476889/before_site.png',
    alt: 'Raw lot with brush before clearing',
    width: 1600,
    height: 900,
  },
  after: {
    url: 'https://res.cloudinary.com/cyfb9slf/image/upload/v1795476859/after_site.png',
    alt: 'The same lot with a finished steel building',
    width: 1600,
    height: 900,
  },
  'log-ext': {
    url: 'https://res.cloudinary.com/cyfb9slf/image/upload/v1795476899/log_home_exterior.png',
    alt: 'Custom log home with a covered porch and stone chimney',
    width: 1600,
    height: 1200,
  },
  'log-int': {
    url: 'https://res.cloudinary.com/cyfb9slf/image/upload/v1795476909/log_home_interior.png',
    alt: 'Log home great room with wood beams and a stone fireplace',
    width: 1600,
    height: 1200,
  },
  buildout: {
    url: 'https://res.cloudinary.com/cyfb9slf/image/upload/v1795476894/commercial_buildout.png',
    alt: 'Commercial space during build-out with metal studs and new drywall',
    width: 1600,
    height: 1200,
  },
  pavilion: {
    url: 'https://res.cloudinary.com/cyfb9slf/image/upload/v1795476901/pavilion_project.png',
    alt: 'Open steel pavilion in a small-town park',
    width: 1200,
    height: 1600,
  },
  about: {
    url: 'https://res.cloudinary.com/cyfb9slf/image/upload/v1795476859/about_family_trade.png',
    alt: 'Work truck at a job site at sunrise with blueprints and a hard hat on the hood',
    width: 1600,
    height: 1067,
  },
  steel: {
    url: 'https://res.cloudinary.com/cyfb9slf/image/upload/v1795476904/steel_texture.png',
    alt: '',
    width: 1600,
    height: 900,
  },
  contact: {
    url: 'https://res.cloudinary.com/cyfb9slf/image/upload/v1795476903/contact.bg.png',
    alt: '',
    width: 1920,
    height: 1080,
  },
};

export function getImageProps(key, { eager = false, sizes = '(max-width: 900px) 100vw, 50vw', defaultWidth = 1440, decorative = false } = {}) {
  const img = IMAGES[key];
  return {
    src: buildCloudinaryUrl(img.url, defaultWidth),
    srcSet: buildCloudinarySrcSet(img.url),
    sizes,
    width: img.width,
    height: img.height,
    alt: decorative ? '' : img.alt,
    loading: eager ? 'eager' : 'lazy',
    fetchPriority: eager ? 'high' : undefined,
    decoding: eager ? 'sync' : 'async',
    ...(decorative ? { 'aria-hidden': 'true' } : {}),
  };
}

export function getOgImageUrl(key = 'hero') {
  const img = IMAGES[key] || IMAGES.hero;
  return buildCloudinaryUrl(img.url, 1200, { crop: 'fill', height: 630 });
}

export function buildPageMetadata({ title, description, path, imageKey = 'hero', robots }) {
  const canonical = `${BASE_URL}${path}`;
  const ogImage = getOgImageUrl(imageKey);
  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: robots || {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
    openGraph: {
      type: 'website',
      siteName: BUSINESS.displayName,
      title,
      description,
      url: canonical,
      locale: 'en_US',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: IMAGES[imageKey]?.alt || IMAGES.hero.alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    other: {
      'geo.region': 'US-TX',
      'geo.placename': 'Cleveland',
    },
  };
}

export function getBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['GeneralContractor', 'LocalBusiness'],
    '@id': `${BASE_URL}/#business`,
    name: BUSINESS.displayName,
    legalName: BUSINESS.legalName,
    alternateName: BUSINESS.alternateName,
    url: `${BASE_URL}/`,
    logo: `${BASE_URL}/favicon.svg`,
    image: buildCloudinaryUrl(IMAGES.hero.url, 1600),
    description:
      'Family-owned construction company in Cleveland, TX building metal buildings, clearing and grading land, pouring slabs, and building custom homes and commercial build-outs.',
    telephone: BUSINESS.phoneMain.schema,
    email: BUSINESS.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.state,
      postalCode: BUSINESS.address.zip,
      addressCountry: 'US',
    },
    // EDIT: Map coordinates in the schema (city-level)
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 30.3413,
      longitude: -95.0855,
    },
    hasMap: BUSINESS.mapsDirectionsUrl,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: BUSINESS.hours.opens,
        closes: BUSINESS.hours.closes,
      },
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: BUSINESS.phoneMain.schema,
        contactType: 'customer service',
        areaServed: 'US-TX',
        availableLanguage: 'English',
      },
      {
        '@type': 'ContactPoint',
        telephone: BUSINESS.phoneOffice.schema,
        contactType: 'office',
        areaServed: 'US-TX',
        availableLanguage: 'English',
      },
    ],
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Liberty County, TX' },
      { '@type': 'AdministrativeArea', name: 'Chambers County, TX' },
      { '@type': 'AdministrativeArea', name: 'Hardin County, TX' },
      { '@type': 'City', name: 'Cleveland, TX' },
      { '@type': 'City', name: 'Plum Grove, TX' },
      { '@type': 'City', name: 'Humble, TX' },
      { '@type': 'City', name: 'Dayton, TX' },
      { '@type': 'City', name: 'Crosby, TX' },
      { '@type': 'City', name: 'Shepherd, TX' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Construction services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Pre-engineered metal buildings' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Land clearing, grading and leveling' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Concrete slab foundations' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Custom homes and log homes' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Commercial build-outs' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Renovations' } },
      ],
    },
    sameAs: [BUSINESS.bbbUrl, BUSINESS.yelpUrl],
  };
}

export function getBreadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: `${BASE_URL}${item.path}`,
    })),
  };
}

export function getFaqJsonLd(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };
}

export const PROJECTS_DATA = [
  // EDIT: The City of Cleveland pavilion text (confirm scope and add a real photo)
  // EDIT: All project photos other than the pavilion are illustrative: replace them with real job photos
  {
    id: 'pavilion',
    imageKey: 'pavilion',
    title: 'City of Cleveland Pavilion',
    category: 'Commercial',
    text: 'Cleveland, TX. We were one of the contractors on this new city pavilion, finished in May 2024.',
  },
  {
    id: 'metal-ext',
    imageKey: 'metal-ext',
    title: 'Steel shop and warehouse',
    category: 'Metal Buildings',
    text: 'Clear-span steel with roll-up doors.',
  },
  {
    id: 'metal-int',
    imageKey: 'metal-int',
    title: 'Clear-span shop interior',
    category: 'Metal Buildings',
    text: 'A wide open floor with no posts.',
  },
  {
    id: 'barn',
    imageKey: 'barn',
    title: 'Steel barn on open pasture',
    category: 'Metal Buildings',
    text: 'Built for animals and equipment.',
  },
  {
    id: 'grading',
    imageKey: 'grading',
    title: 'Lot grading and leveling',
    category: 'Site Work',
    text: 'Red clay graded and leveled for a build.',
  },
  {
    id: 'slab',
    imageKey: 'slab',
    title: 'Slab ready for steel',
    category: 'Site Work',
    text: 'Forms, rebar, and concrete poured to hold.',
  },
  {
    id: 'after',
    imageKey: 'after',
    title: 'Raw land to finished building',
    category: 'Site Work',
    text: 'Same lot, before and after.',
  },
  {
    id: 'log-ext',
    imageKey: 'log-ext',
    title: 'Custom log home',
    category: 'Homes',
    text: 'Covered porch and stone chimney.',
  },
  {
    id: 'log-int',
    imageKey: 'log-int',
    title: 'Log home interior',
    category: 'Homes',
    text: 'Wood beams and a stone fireplace.',
  },
  {
    id: 'buildout',
    imageKey: 'buildout',
    title: 'Commercial build-out',
    category: 'Commercial',
    text: 'Framed, finished, and ready to open.',
  },
];
