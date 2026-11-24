export function getPageContext() {
  try {
    if (typeof window === 'undefined') {
      return { url: '/', title: 'WK Construction Inc.' };
    }
    return {
      url: window.location.href || '/',
      title: document.title || 'WK Construction Inc.',
    };
  } catch {
    return { url: '/', title: 'WK Construction Inc.' };
  }
}
