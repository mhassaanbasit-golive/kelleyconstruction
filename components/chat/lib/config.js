export const GETGOLIVE_URL = 'https://getgolive.io';

export const CHAT_CONFIG = Object.freeze({
  companyName: 'Wendell Kelley Construction, Inc.',
  shortName: 'WK Construction Inc.',
  phones: Object.freeze([
    Object.freeze({ display: '(281) 592-3792', href: 'tel:+12815923792' }),
    Object.freeze({ display: '(281) 593-5422', href: 'tel:+12815935422' }),
  ]),
  email: 'wendellkelley@gmail.com',
  address: '195 Bartlett Rd, Cleveland, TX 77328',
  quoteUrl: '/contact/',
  getGoLiveUrl: GETGOLIVE_URL,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://kelleyconstruction.net',
  starterPrompts: Object.freeze([
    'How much does a metal building cost?',
    'Do you build log homes?',
    'Do you clear and grade land?',
    'Which counties do you serve?',
    'Can I get a free estimate?',
  ]),
});
