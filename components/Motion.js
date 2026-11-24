'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  validateLeadForm,
  buildMailtoHref,
  filterProjects,
  clampSliderPercent,
} from '../lib/site-utils.js';

// EDIT: FORM_ENDPOINT value
const FORM_ENDPOINT = '';
const FALLBACK_EMAIL = 'wendellkelley@gmail.com';

export default function Motion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Demo override: ?motion=full ignores prefers-reduced-motion and persists in sessionStorage
    let forceFullMotion = false;
    try {
      const params = new URLSearchParams(window.location.search);
      const motionParam = params.get('motion');
      if (motionParam === 'full') {
        sessionStorage.setItem('wk_motion', 'full');
      } else if (motionParam === 'auto') {
        sessionStorage.removeItem('wk_motion');
      }
      forceFullMotion = sessionStorage.getItem('wk_motion') === 'full';
    } catch {}
    document.documentElement.classList.toggle('wk-motion-full', forceFullMotion);

    const osReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reducedMotion = !forceFullMotion && osReducedMotion;
    const isTouchOnly = window.matchMedia('(hover: none)').matches;
    const hasFinePointer = window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches;
    const pathname = window.location.pathname || '/';
    const isContactPage = pathname === '/contact' || pathname.startsWith('/contact/');

    document.body.classList.toggle('is-contact-page', isContactPage);

    // Highlight active nav links with aria-current="page"
    const normalizePath = (p) => {
      if (!p) return '/';
      return p.endsWith('/') ? p : `${p}/`;
    };
    const currentNorm = normalizePath(pathname);
    document.querySelectorAll('.site-header nav a, .mobile-menu-overlay a').forEach((link) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/') && normalizePath(href) === currentNorm) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    // Lenis slow Framer-style smooth scroll (removed in reduced-motion lite mode)
    let lenis = null;
    let tickerFn = null;

    try {
      if (!reducedMotion) {
        lenis = new Lenis({
          lerp: 0.055,
          wheelMultiplier: 0.55,
          smoothWheel: true,
          touchMultiplier: 1.1,
          syncTouch: false,
          respectReducedMotion: false,
        });
        window.__lenis = lenis;

        lenis.on('scroll', ScrollTrigger.update);
        tickerFn = (t) => {
          lenis.raf(t * 1000);
        };
        gsap.ticker.add(tickerFn);
        gsap.ticker.lagSmoothing(0);
      }
    } catch (err) {
      console.warn('[WK motion] lenis failed:', err);
      lenis = null;
      window.__lenis = null;
    }

    const pauseLenis = (shouldPause) => {
      if (!lenis) return;
      if (shouldPause) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };
    window.__wkLenisPause = pauseLenis;

    // Anchor link smooth scroll
    const handleAnchorClick = (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -80, duration: 2.2 });
      } else {
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    };
    document.addEventListener('click', handleAnchorClick);

    // Sticky header
    const header = document.getElementById('site-header');
    let lastScrollY = window.scrollY;
    const onScrollHeader = () => {
      if (!header) return;
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 80);
      if (y > 240 && y > lastScrollY + 4) {
        header.classList.add('is-hidden');
      } else if (y < lastScrollY - 4 || y <= 240) {
        header.classList.remove('is-hidden');
      }
      lastScrollY = y;
    };
    window.addEventListener('scroll', onScrollHeader, { passive: true });
    onScrollHeader();

    // Header Services dropdown
    try {
      const dropdownWrap = document.getElementById('nav-services-wrap');
      const dropdownBtn = document.getElementById('nav-services-btn');
      let dropdownTimer = null;
      const openDropdown = () => {
        if (dropdownTimer) clearTimeout(dropdownTimer);
        if (!dropdownWrap || !dropdownBtn) return;
        dropdownWrap.classList.add('nav-dropdown-open');
        dropdownBtn.setAttribute('aria-expanded', 'true');
      };
      const closeDropdownDelayed = () => {
        if (dropdownTimer) clearTimeout(dropdownTimer);
        dropdownTimer = setTimeout(() => {
          if (!dropdownWrap || !dropdownBtn) return;
          dropdownWrap.classList.remove('nav-dropdown-open');
          dropdownBtn.setAttribute('aria-expanded', 'false');
        }, 220);
      };
      if (dropdownWrap && dropdownBtn) {
        dropdownWrap.addEventListener('mouseenter', openDropdown);
        dropdownWrap.addEventListener('mouseleave', closeDropdownDelayed);
        dropdownWrap.addEventListener('focusin', openDropdown);
        dropdownWrap.addEventListener('focusout', (e) => {
          if (!dropdownWrap.contains(e.relatedTarget)) {
            closeDropdownDelayed();
          }
        });
        dropdownBtn.addEventListener('click', () => {
          const isOpen = dropdownWrap.classList.contains('nav-dropdown-open');
          if (isOpen) {
            dropdownWrap.classList.remove('nav-dropdown-open');
            dropdownBtn.setAttribute('aria-expanded', 'false');
          } else {
            openDropdown();
          }
        });
      }
    } catch (err) {
      console.warn('[WK motion] dropdown failed:', err);
    }

    // Mobile menu
    let onKeyDownMenu = null;
    let onResize = null;
    try {
      const mobileMenuBtn = document.getElementById('mobile-menu-btn');
      const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
      const mobileServicesToggle = document.getElementById('mobile-services-toggle');
      const mobileServicesSublinks = document.getElementById('mobile-services-sublinks');

      const setMobileMenu = (open) => {
        if (!mobileMenuBtn || !mobileMenuOverlay) return;
        mobileMenuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        mobileMenuOverlay.classList.toggle('is-open', open);
        mobileMenuOverlay.setAttribute('aria-hidden', open ? 'false' : 'true');
        document.body.style.overflow = open ? 'hidden' : '';
        pauseLenis(open);
        if (open) {
          const items = mobileMenuOverlay.querySelectorAll('.mobile-menu-list > li');
          if (reducedMotion) {
            gsap.fromTo(
              items,
              { opacity: 0 },
              { opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power1.out' }
            );
          } else {
            gsap.fromTo(
              items,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: 'expo.out' }
            );
          }
        }
      };

      if (mobileMenuBtn && mobileMenuOverlay) {
        mobileMenuBtn.addEventListener('click', () => {
          const isOpen = mobileMenuOverlay.classList.contains('is-open');
          setMobileMenu(!isOpen);
        });
        mobileMenuOverlay.querySelectorAll('a').forEach((a) => {
          a.addEventListener('click', () => setMobileMenu(false));
        });
      }

      if (mobileServicesToggle && mobileServicesSublinks) {
        mobileServicesToggle.addEventListener('click', () => {
          const isOpen = mobileServicesSublinks.classList.toggle('is-open');
          mobileServicesToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
      }

      onKeyDownMenu = (e) => {
        if (e.key === 'Escape' && mobileMenuOverlay?.classList.contains('is-open')) {
          setMobileMenu(false);
          mobileMenuBtn?.focus();
        }
      };
      document.addEventListener('keydown', onKeyDownMenu);

      onResize = () => {
        if (window.innerWidth >= 900 && mobileMenuOverlay?.classList.contains('is-open')) {
          setMobileMenu(false);
        }
      };
      window.addEventListener('resize', onResize);
    } catch (err) {
      console.warn('[WK motion] mobileMenu failed:', err);
    }

    // Split text helper (preserves full aria-label on heading)
    try {
      const splitTargets = Array.from(document.querySelectorAll('[data-split]'));
      splitTargets.forEach((el) => {
        if (el.dataset.splitDone === '1') return;
        const fullText = el.textContent.trim();
        el.setAttribute('aria-label', fullText);
        el.dataset.splitDone = '1';

        const wrapTextNodes = (node) => {
          const children = Array.from(node.childNodes);
          children.forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
              const parts = child.textContent.split(/(\s+)/);
              const frag = document.createDocumentFragment();
              parts.forEach((part) => {
                if (!part) return;
                if (/^\s+$/.test(part)) {
                  frag.appendChild(document.createTextNode(part));
                } else {
                  const mask = document.createElement('span');
                  mask.className = 'split-word-mask';
                  mask.setAttribute('aria-hidden', 'true');
                  const inner = document.createElement('span');
                  inner.className = 'split-word-inner';
                  inner.textContent = part;
                  mask.appendChild(inner);
                  frag.appendChild(mask);
                }
              });
              child.replaceWith(frag);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              wrapTextNodes(child);
            }
          });
        };
        wrapTextNodes(el);

        if (!reducedMotion) {
          const words = el.querySelectorAll('.split-word-inner');
          if (words.length) {
            gsap.set(words, { yPercent: 115, y: 0 });
          }
        }
      });
    } catch (err) {
      console.warn('[WK motion] splitText failed:', err);
    }

    let gsapCtx = null;

    // Opening animation (prepares paused hero timeline at mount; plays after page transition finishes)
    const runOpeningAnimation = () => {
      try {
        const hero = document.querySelector('[data-hero]');
        if (!hero) return () => {};

        let seen = false;
        try {
          seen = sessionStorage.getItem('wk_seen') === '1';
        } catch {}

        const isHome = currentNorm === '/';
        const heroImg = hero.querySelector('.hero-media img, .hero-split-media img');
        const heroH1 = hero.querySelector('h1');
        const heroH1Words = hero.querySelectorAll('h1 .split-word-inner');
        const heroPara = hero.querySelector('[data-hero-para]');
        const heroBtns = hero.querySelectorAll('[data-hero-actions] > *');
        const heroInfoItems = hero.querySelectorAll('[data-hero-info] > *');
        const scrollLine = hero.querySelector('.hero-scroll-line');
        const headerRule = document.querySelector('.header-rule');

        const tl = gsap.timeline({ paused: true });

        if (reducedMotion) {
          // Reduced-motion lite: plain opacity fade on hero opening (no scale, slide, or SVG line drawing)
          try {
            sessionStorage.setItem('wk_seen', '1');
          } catch {}
          if (heroImg) {
            tl.fromTo(heroImg, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power1.out' }, 0);
          }
          if (heroH1) {
            tl.fromTo(heroH1, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power1.out' }, 0.08);
          }
          if (heroPara) {
            tl.fromTo(heroPara, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power1.out' }, 0.16);
          }
          if (heroBtns.length) {
            tl.fromTo(heroBtns, { opacity: 0 }, { opacity: 1, duration: 0.9, stagger: 0.08, ease: 'power1.out' }, 0.24);
          }
          if (heroInfoItems.length) {
            tl.fromTo(heroInfoItems, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power1.out' }, 0.3);
          }
          return () => tl.play();
        }

        if (!seen && isHome) {
          try {
            sessionStorage.setItem('wk_seen', '1');
          } catch {}

          if (heroImg) {
            tl.fromTo(heroImg, { scale: 1.2 }, { scale: 1, duration: 3.0, ease: 'expo.out' }, 0);
          }
          if (header) {
            tl.fromTo(header, { yPercent: -100 }, { yPercent: 0, duration: 1.2, ease: 'expo.out' }, 0.15);
          }
          if (headerRule) {
            tl.fromTo(headerRule, { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'expo.out' }, 0.2);
          }
          if (heroH1Words.length) {
            tl.fromTo(
              heroH1Words,
              { yPercent: 115, y: 0 },
              { yPercent: 0, y: 0, duration: 1.5, stagger: 0.07, ease: 'expo.out' },
              0.35
            );
          }
          const heroCorner = hero.querySelector('.deco-corner-svg polyline, .deco-corner-svg path');
          if (heroCorner && heroCorner.getTotalLength) {
            const len = heroCorner.getTotalLength();
            gsap.set(heroCorner, { strokeDasharray: len, strokeDashoffset: len });
            tl.to(heroCorner, { strokeDashoffset: 0, duration: 1.6, ease: 'expo.out' }, 0.9);
          }
          if (heroPara) {
            tl.fromTo(heroPara, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4, ease: 'expo.out' }, 1.2);
          }
          if (heroBtns.length) {
            tl.fromTo(
              heroBtns,
              { y: 30, opacity: 0 },
              { y: 0, opacity: 1, duration: 1.2, stagger: 0.14, ease: 'expo.out' },
              1.5
            );
          }
          if (heroInfoItems.length) {
            tl.fromTo(
              heroInfoItems,
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 1.2, stagger: 0.12, ease: 'expo.out' },
              1.7
            );
          }
          if (scrollLine) {
            tl.fromTo(
              scrollLine,
              { scaleY: 0 },
              {
                scaleY: 1,
                duration: 1.2,
                ease: 'expo.out',
                onComplete: () => scrollLine.classList.add('is-looping'),
              },
              2.1
            );
          }
        } else {
          try {
            sessionStorage.setItem('wk_seen', '1');
          } catch {}

          if (heroImg) {
            tl.fromTo(heroImg, { scale: 1.2 }, { scale: 1, duration: 3.0, ease: 'expo.out' }, 0);
          }
          if (heroH1Words.length) {
            tl.fromTo(
              heroH1Words,
              { yPercent: 115, y: 0 },
              { yPercent: 0, y: 0, duration: 1.5, stagger: 0.07, ease: 'expo.out' },
              0.1
            );
          }
          if (heroPara) {
            tl.fromTo(heroPara, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out' }, 0.45);
          }
          if (heroBtns.length) {
            tl.fromTo(
              heroBtns,
              { y: 24, opacity: 0 },
              { y: 0, opacity: 1, duration: 1.1, stagger: 0.12, ease: 'expo.out' },
              0.65
            );
          }
          if (heroInfoItems.length) {
            tl.fromTo(
              heroInfoItems,
              { y: 18, opacity: 0 },
              { y: 0, opacity: 1, duration: 1.0, stagger: 0.1, ease: 'expo.out' },
              0.8
            );
          }
          if (scrollLine) {
            scrollLine.classList.add('is-looping');
          }
        }

        return () => tl.play();
      } catch (err) {
        console.warn('[WK motion] openingAnimation failed:', err);
        return () => {};
      }
    };

    // Scroll animations wrapped in gsap.context(), with per-feature try/catch and reduced-motion lite branches
    const setupScrollAnimations = () => {
      const isMobile = window.innerWidth < 900;

      if (gsapCtx) gsapCtx.revert();
      gsapCtx = gsap.context(() => {
        // Split headings outside hero
        try {
          document.querySelectorAll('[data-split]').forEach((heading) => {
            if (heading.closest('[data-hero]')) return;
            if (reducedMotion) {
              gsap.fromTo(
                heading,
                { opacity: 0 },
                {
                  opacity: 1,
                  duration: 0.9,
                  ease: 'power1.out',
                  scrollTrigger: {
                    trigger: heading,
                    start: 'top 92%',
                    once: true,
                  },
                }
              );
              return;
            }
            const words = heading.querySelectorAll('.split-word-inner');
            if (!words.length) return;
            gsap.fromTo(
              words,
              { yPercent: 115, y: 0 },
              {
                yPercent: 0,
                y: 0,
                duration: 1.5,
                stagger: 0.07,
                ease: 'expo.out',
                scrollTrigger: {
                  trigger: heading,
                  start: 'top 92%',
                  once: true,
                },
              }
            );
          });
        } catch (err) {
          console.warn('[WK motion] splitHeadings failed:', err);
        }

        // Data-reveal (0.9s opacity-only fade in reduced-motion lite mode)
        try {
          document.querySelectorAll('[data-reveal]').forEach((el) => {
            if (reducedMotion) {
              gsap.fromTo(
                el,
                { opacity: 0 },
                {
                  opacity: 1,
                  duration: 0.9,
                  ease: 'power1.out',
                  scrollTrigger: {
                    trigger: el,
                    start: 'top 92%',
                    once: true,
                  },
                }
              );
            } else {
              gsap.fromTo(
                el,
                { y: 60, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 1.8,
                  ease: 'expo.out',
                  scrollTrigger: {
                    trigger: el,
                    start: 'top 92%',
                    once: true,
                  },
                }
              );
            }
          });
        } catch (err) {
          console.warn('[WK motion] reveal failed:', err);
        }

        // Data-stagger (0.9s opacity-only fade in reduced-motion lite mode)
        try {
          document.querySelectorAll('[data-stagger]').forEach((group) => {
            const items = group.children;
            if (!items.length) return;
            if (reducedMotion) {
              gsap.fromTo(
                items,
                { opacity: 0 },
                {
                  opacity: 1,
                  duration: 0.9,
                  stagger: 0.08,
                  ease: 'power1.out',
                  scrollTrigger: {
                    trigger: group,
                    start: 'top 92%',
                    once: true,
                  },
                }
              );
            } else {
              gsap.fromTo(
                items,
                { y: 60, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 1.6,
                  stagger: 0.14,
                  ease: 'expo.out',
                  scrollTrigger: {
                    trigger: group,
                    start: 'top 92%',
                    once: true,
                  },
                }
              );
            }
          });
        } catch (err) {
          console.warn('[WK motion] stagger failed:', err);
        }

        // Data-image-reveal (removed in reduced-motion lite mode)
        try {
          if (!reducedMotion) {
            document.querySelectorAll('[data-image-reveal]').forEach((frame) => {
              const img = frame.querySelector('img');
              gsap.fromTo(
                frame,
                { clipPath: 'inset(0 0 100% 0)' },
                {
                  clipPath: 'inset(0 0 0% 0)',
                  duration: 1.8,
                  ease: 'expo.inOut',
                  scrollTrigger: {
                    trigger: frame,
                    start: 'top 92%',
                    once: true,
                  },
                }
              );
              if (img) {
                gsap.fromTo(
                  img,
                  { scale: 1.3 },
                  {
                    scale: 1,
                    duration: 2.2,
                    ease: 'expo.out',
                    scrollTrigger: {
                      trigger: frame,
                      start: 'top 92%',
                      once: true,
                    },
                  }
                );
              }
            });
          }
        } catch (err) {
          console.warn('[WK motion] imageReveal failed:', err);
        }

        // Data-parallax on big photos (desktop only, removed in reduced-motion lite mode)
        try {
          if (!isMobile && !reducedMotion) {
            document.querySelectorAll('[data-parallax]').forEach((wrap) => {
              const img = wrap.querySelector('img');
              if (!img) return;
              gsap.fromTo(
                img,
                { yPercent: -6 },
                {
                  yPercent: 6,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: wrap,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.2,
                  },
                }
              );
            });
          }
        } catch (err) {
          console.warn('[WK motion] parallax failed:', err);
        }

        // Word-by-word text fill scrub 1 (kept in reduced-motion lite mode)
        try {
          document.querySelectorAll('[data-text-fill]').forEach((heading) => {
            const words = heading.querySelectorAll('.text-fill-word');
            if (!words.length) return;
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: heading,
                start: 'top 78%',
                end: 'bottom 45%',
                scrub: 1,
              },
            });
            words.forEach((word) => {
              tl.to(word, { backgroundPosition: '0% 0%', duration: 1, ease: 'none' });
            });
          });
        } catch (err) {
          console.warn('[WK motion] textFill failed:', err);
        }

        // Counters (kept in reduced-motion lite mode)
        try {
          document.querySelectorAll('[data-counter]').forEach((el) => {
            const target = parseInt(el.dataset.counter, 10);
            const suffix = el.dataset.counterSuffix || '';
            const obj = { val: 0 };
            ScrollTrigger.create({
              trigger: el,
              start: 'top 90%',
              once: true,
              onEnter: () => {
                gsap.to(obj, {
                  val: target,
                  duration: 2.0,
                  ease: 'expo.out',
                  onUpdate: () => {
                    el.textContent = `${Math.round(obj.val)}`;
                  },
                  onComplete: () => {
                    el.textContent = `${target}${suffix}`;
                  },
                });
              },
            });
          });
        } catch (err) {
          console.warn('[WK motion] counters failed:', err);
        }

        // Decorative gold lines draw on scroll (desktop only, removed in reduced-motion lite mode)
        try {
          if (!isMobile && !reducedMotion) {
            document.querySelectorAll('[data-draw-svg]').forEach((svg) => {
              if (svg.closest('[data-hero]')) return;
              const paths = svg.querySelectorAll('path, polyline, line');
              paths.forEach((p) => {
                const len = p.getTotalLength ? p.getTotalLength() : 200;
                gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
                gsap.to(p, {
                  strokeDashoffset: 0,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: svg,
                    start: 'top 88%',
                    end: 'bottom 45%',
                    scrub: 1,
                  },
                });
              });
            });
          }
        } catch (err) {
          console.warn('[WK motion] drawSvg failed:', err);
        }

        // Checklist SVG draw (removed in reduced-motion lite mode)
        try {
          if (!reducedMotion) {
            document.querySelectorAll('[data-check-svg]').forEach((svg) => {
              const path = svg.querySelector('path, polyline');
              if (!path || !path.getTotalLength) return;
              const len = path.getTotalLength();
              gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
              gsap.to(path, {
                strokeDashoffset: 0,
                duration: 0.9,
                ease: 'expo.out',
                scrollTrigger: {
                  trigger: svg,
                  start: 'top 92%',
                  once: true,
                },
              });
            });
          }
        } catch (err) {
          console.warn('[WK motion] checkSvg failed:', err);
        }

        // Timeline rail fill scrub 1
        try {
          const railFill = document.querySelector('.timeline-rail-fill');
          const timelineWrap = document.querySelector('.timeline-wrap');
          if (railFill && timelineWrap) {
            gsap.to(railFill, {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: timelineWrap,
                start: 'top 78%',
                end: 'bottom 55%',
                scrub: 1,
              },
            });
          }
        } catch (err) {
          console.warn('[WK motion] timelineRail failed:', err);
        }

        // Metal buildings horizontal scroll gallery (desktop only, removed in reduced-motion lite mode)
        try {
          const hscrollSection = document.querySelector('.hscroll-section');
          const hscrollTrack = document.querySelector('.hscroll-track');
          if (!isMobile && !reducedMotion && hscrollSection && hscrollTrack) {
            const getScrollDistance = () => Math.max(0, hscrollTrack.scrollWidth - hscrollSection.clientWidth + 64);
            gsap.to(hscrollTrack, {
              x: () => -getScrollDistance(),
              ease: 'none',
              scrollTrigger: {
                trigger: hscrollSection,
                pin: true,
                scrub: 1.2,
                end: '+=2000',
                invalidateOnRefresh: true,
              },
            });
          }
        } catch (err) {
          console.warn('[WK motion] hscroll failed:', err);
        }
      });

      ScrollTrigger.refresh();
    };

    // Start scroll animations immediately at mount right after preparing hero timeline
    const playOpeningAnimation = runOpeningAnimation();
    setupScrollAnimations();

    // Debounced ScrollTrigger.refresh() on fonts ready, window load, and below-the-fold image loads
    let refreshTimer = null;
    const scheduleRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleRefresh);
    }
    window.addEventListener('load', scheduleRefresh);

    const belowFoldImgListeners = [];
    document.querySelectorAll('img').forEach((img) => {
      if (img.closest('[data-hero]')) return;
      if (!img.complete) {
        img.addEventListener('load', scheduleRefresh, { once: true });
        belowFoldImgListeners.push(img);
      }
    });

    // Page transition overlay arrival & navigation (only hero timeline waits for page transition)
    const transitionEl = document.getElementById('page-transition');
    const transitionDots = transitionEl ? transitionEl.querySelectorAll('.pt-dot') : [];

    const finishArrival = () => {
      const emitSiteReady = () => {
        try {
          window.dispatchEvent(new CustomEvent('site:ready'));
        } catch {}
      };

      if (!transitionEl) {
        document.documentElement.classList.add('pt-ready');
        playOpeningAnimation();
        emitSiteReady();
        return;
      }

      if (reducedMotion) {
        gsap.to(transitionEl, {
          opacity: 0,
          duration: 0.3,
          ease: 'power1.out',
          onComplete: () => {
            transitionEl.style.visibility = 'hidden';
            transitionEl.style.pointerEvents = 'none';
            document.documentElement.classList.add('pt-ready');
            playOpeningAnimation();
            emitSiteReady();
          },
        });
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          transitionEl.style.visibility = 'hidden';
          transitionEl.style.pointerEvents = 'none';
          document.documentElement.classList.add('pt-ready');
          playOpeningAnimation();
          emitSiteReady();
        },
      });

      if (transitionDots.length) {
        tl.to(transitionDots, { scale: 0, duration: 0.6, stagger: 0.08, ease: 'expo.in' });
      }
      tl.to(transitionEl, { yPercent: -100, duration: 1.2, ease: 'expo.inOut' }, '-=0.15');
    };

    // Wait for fonts and hero image (max 1.4s) before lifting page transition & playing hero timeline
    const waitReady = () => {
      const heroImg = document.querySelector('[data-hero] img');
      const fontPromise = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      const imgPromise = heroImg && !heroImg.complete
        ? new Promise((res) => {
            heroImg.addEventListener('load', res, { once: true });
            heroImg.addEventListener('error', res, { once: true });
          })
        : Promise.resolve();

      const timeoutPromise = new Promise((res) => setTimeout(res, 1400));
      Promise.race([Promise.all([fontPromise, imgPromise]), timeoutPromise]).then(finishArrival);
    };
    waitReady();

    // Intercept internal links for page transition (0.3s fade in reduced-motion lite, 1.1s slide cover in full)
    const handleInternalLink = (e) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = e.target.closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      if (href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('#')) return;

      let url;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.hash) return;

      e.preventDefault();
      if (!transitionEl) {
        window.location.href = url.href;
        return;
      }

      if (reducedMotion) {
        transitionEl.style.visibility = 'visible';
        transitionEl.style.pointerEvents = 'auto';
        transitionEl.style.opacity = '0';
        transitionEl.style.transform = 'translateY(0)';
        gsap.to(transitionEl, {
          opacity: 1,
          duration: 0.3,
          ease: 'power1.out',
          onComplete: () => {
            window.location.href = url.href;
          },
        });
        return;
      }

      transitionEl.style.visibility = 'visible';
      transitionEl.style.pointerEvents = 'auto';
      gsap.set(transitionDots, { scale: 0.4, opacity: 1 });

      gsap.fromTo(
        transitionEl,
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 1.1,
          ease: 'expo.inOut',
          onComplete: () => {
            gsap.to(transitionDots, {
              scale: 1,
              duration: 0.7,
              stagger: 0.14,
              repeat: -1,
              yoyo: true,
              ease: 'power1.inOut',
            });
            setTimeout(() => {
              window.location.href = url.href;
            }, 220);
          },
        }
      );
    };
    document.addEventListener('click', handleInternalLink);

    // Handle bfcache back/forward navigation
    const onPageShow = (event) => {
      if (event.persisted && transitionEl) {
        gsap.killTweensOf(transitionEl);
        transitionEl.style.visibility = 'hidden';
        transitionEl.style.pointerEvents = 'none';
        document.documentElement.classList.add('pt-ready');
      }
    };
    window.addEventListener('pageshow', onPageShow);

    // Desktop custom pointer cursor (removed in reduced-motion lite mode)
    let removeCursorListeners = null;
    try {
      const cursorEl = document.getElementById('wk-cursor');
      if (hasFinePointer && cursorEl && !reducedMotion) {
        const moveX = gsap.quickTo(cursorEl, 'x', { duration: 0.2, ease: 'power3.out' });
        const moveY = gsap.quickTo(cursorEl, 'y', { duration: 0.2, ease: 'power3.out' });

        const photoSelector =
          '.project-card, .project-row-img, .split-block-img, .process-step-media, .hscroll-panel-img, .overlap-frame-primary, .overlap-frame-secondary, .bleed-split-media, .ba-slider';
        const goldSurfaceSelector = '.service-card, .btn-primary, .btn-outline-dark, .area-chip';
        const interactiveSelector =
          'a, button, input, select, textarea, label, [role="button"], .faq-trigger, .filter-tab, .ba-handle';

        const onPointerMove = (e) => {
          moveX(e.clientX);
          moveY(e.clientY);
          cursorEl.classList.add('is-active');

          const target = e.target;
          if (!target || typeof target.closest !== 'function') return;

          // Check ba-handle first so it gets interactive ring rather than View photo cursor
          if (target.closest('.ba-handle')) {
            cursorEl.classList.remove('is-photo', 'is-on-gold');
            cursorEl.classList.add('is-interactive');
          } else if (target.closest(photoSelector)) {
            cursorEl.classList.add('is-photo');
            cursorEl.classList.remove('is-interactive', 'is-on-gold');
          } else if (target.closest(goldSurfaceSelector)) {
            cursorEl.classList.remove('is-photo');
            cursorEl.classList.add('is-interactive', 'is-on-gold');
          } else if (target.closest(interactiveSelector)) {
            cursorEl.classList.remove('is-photo', 'is-on-gold');
            cursorEl.classList.add('is-interactive');
          } else {
            cursorEl.classList.remove('is-photo', 'is-interactive', 'is-on-gold');
          }
        };

        const onPointerLeave = () => {
          cursorEl.classList.remove('is-active', 'is-photo', 'is-interactive', 'is-on-gold');
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        document.addEventListener('mouseleave', onPointerLeave);
        removeCursorListeners = () => {
          window.removeEventListener('pointermove', onPointerMove);
          document.removeEventListener('mouseleave', onPointerLeave);
        };
      }
    } catch (err) {
      console.warn('[WK motion] cursor failed:', err);
    }

    // Mobile slim sticky bar visibility (hidden in hero and footer form, and on contact page)
    let barObserver = null;
    let syncStickyBar = null;
    try {
      const stickyBar = document.getElementById('mobile-sticky-bar');
      const stickyHeroEl = document.querySelector('[data-hero]');
      const footerEl = document.getElementById('footer-form-col') || document.getElementById('site-footer');
      let heroVisible = Boolean(stickyHeroEl);
      let footerVisible = false;

      syncStickyBar = () => {
        if (!stickyBar || isContactPage) return;
        const shouldShow = !heroVisible && !footerVisible && window.scrollY > 120;
        stickyBar.classList.toggle('is-visible', shouldShow);
      };

      if (stickyBar && !isContactPage && 'IntersectionObserver' in window) {
        barObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.target === stickyHeroEl) {
                heroVisible = entry.isIntersecting;
              } else if (entry.target === footerEl) {
                footerVisible = entry.isIntersecting;
              }
            });
            syncStickyBar();
          },
          { threshold: 0.08 }
        );
        if (stickyHeroEl) barObserver.observe(stickyHeroEl);
        if (footerEl) barObserver.observe(footerEl);
        window.addEventListener('scroll', syncStickyBar, { passive: true });
      }
    } catch (err) {
      console.warn('[WK motion] stickyBar failed:', err);
    }

    // Service cards touch tap logic (tablet >=900px with touch)
    try {
      document.querySelectorAll('.service-card').forEach((card) => {
        card.addEventListener('click', (e) => {
          if (!isTouchOnly || window.innerWidth < 900) return;
          if (!card.classList.contains('is-flipped')) {
            e.preventDefault();
            document.querySelectorAll('.service-card.is-flipped').forEach((other) => {
              if (other !== card) other.classList.remove('is-flipped');
            });
            card.classList.add('is-flipped');
          }
        });
      });
    } catch (err) {
      console.warn('[WK motion] serviceCardsTouch failed:', err);
    }

    // FAQ accordion (one open at a time)
    try {
      document.querySelectorAll('.faq-trigger').forEach((btn) => {
        btn.addEventListener('click', () => {
          const item = btn.closest('.faq-item');
          const list = btn.closest('.faq-list');
          if (!item || !list) return;
          const willOpen = !item.classList.contains('is-open');

          list.querySelectorAll('.faq-item.is-open').forEach((openItem) => {
            openItem.classList.remove('is-open');
            const openBtn = openItem.querySelector('.faq-trigger');
            if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
          });

          if (willOpen) {
            item.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
          }
        });
      });
    } catch (err) {
      console.warn('[WK motion] accordion failed:', err);
    }

    // Before / After Slider
    try {
      const baSlider = document.querySelector('.ba-slider');
      if (baSlider) {
        const afterLayer = baSlider.querySelector('.ba-after');
        const divider = baSlider.querySelector('.ba-divider');
        const handle = baSlider.querySelector('.ba-handle');
        let currentPct = 50;
        let dragging = false;

        const applyPct = (pct) => {
          currentPct = clampSliderPercent(pct);
          if (afterLayer) afterLayer.style.clipPath = `inset(0 ${100 - currentPct}% 0 0)`;
          if (divider) divider.style.left = `${currentPct}%`;
          if (handle) {
            handle.style.left = `${currentPct}%`;
            handle.setAttribute('aria-valuenow', String(Math.round(currentPct)));
          }
        };

        const updateFromClientX = (clientX) => {
          const rect = baSlider.getBoundingClientRect();
          if (!rect.width) return;
          const pct = ((clientX - rect.left) / rect.width) * 100;
          applyPct(pct);
        };

        if (handle) {
          handle.addEventListener('pointerdown', (e) => {
            dragging = true;
            baSlider.classList.add('is-dragging');
            handle.setPointerCapture(e.pointerId);
            updateFromClientX(e.clientX);
          });
          handle.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            updateFromClientX(e.clientX);
          });
          handle.addEventListener('pointerup', () => {
            dragging = false;
            baSlider.classList.remove('is-dragging');
          });
          handle.addEventListener('pointercancel', () => {
            dragging = false;
            baSlider.classList.remove('is-dragging');
          });
          handle.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              applyPct(currentPct - 5);
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              applyPct(currentPct + 5);
            }
          });
        }

        baSlider.addEventListener('click', (e) => {
          if (e.target.closest('.ba-handle')) return;
          updateFromClientX(e.clientX);
        });

        // Gentle intro move once
        if (!reducedMotion && 'IntersectionObserver' in window) {
          const io = new IntersectionObserver(
            (entries) => {
              if (entries[0].isIntersecting) {
                io.disconnect();
                const obj = { p: 50 };
                gsap
                  .timeline()
                  .to(obj, { p: 70, duration: 0.9, ease: 'power2.inOut', onUpdate: () => applyPct(obj.p) })
                  .to(obj, { p: 50, duration: 0.9, ease: 'power2.inOut', onUpdate: () => applyPct(obj.p) });
              }
            },
            { threshold: 0.35 }
          );
          io.observe(baSlider);
        }
      }
    } catch (err) {
      console.warn('[WK motion] slider failed:', err);
    }

    // Projects filter & lightbox
    try {
      const filterTabs = Array.from(document.querySelectorAll('.filter-tab'));
      const projectCards = Array.from(document.querySelectorAll('.project-card'));
      const lightbox = document.getElementById('project-lightbox');

      if (filterTabs.length && projectCards.length) {
        const cardData = projectCards.map((c) => ({
          el: c,
          id: c.dataset.projectId,
          category: c.dataset.category,
          title: c.dataset.title,
          text: c.dataset.text,
          imgSrc: c.dataset.fullImg,
          imgAlt: c.dataset.imgAlt,
        }));

        filterTabs.forEach((tab) => {
          tab.addEventListener('click', () => {
            const cat = tab.dataset.filter || 'All';
            filterTabs.forEach((t) => t.setAttribute('aria-pressed', t === tab ? 'true' : 'false'));
            const visibleSet = new Set(filterProjects(cardData, cat).map((item) => item.id));
            const shownEls = [];
            cardData.forEach((item) => {
              const match = visibleSet.has(item.id);
              item.el.hidden = !match;
              if (match) shownEls.push(item.el);
            });
            if (!reducedMotion && shownEls.length) {
              gsap.fromTo(
                shownEls,
                { opacity: 0, scale: 0.96 },
                { opacity: 1, scale: 1, duration: 0.8, stagger: 0.06, ease: 'expo.out' }
              );
            } else if (shownEls.length) {
              gsap.fromTo(
                shownEls,
                { opacity: 0 },
                { opacity: 1, duration: 0.6, stagger: 0.04, ease: 'power1.out' }
              );
            }
          });
        });

        if (lightbox) {
          const lbImg = document.getElementById('lightbox-img');
          const lbTitle = document.getElementById('lightbox-title');
          const lbText = document.getElementById('lightbox-text');
          const lbPrev = document.getElementById('lightbox-prev');
          const lbNext = document.getElementById('lightbox-next');
          const lbClose = document.getElementById('lightbox-close');
          let activeIdx = 0;
          let lastTrigger = null;

          const getVisibleCards = () => cardData.filter((c) => !c.el.hidden);

          const renderLightbox = () => {
            const visible = getVisibleCards();
            if (!visible.length) return;
            const item = visible[(activeIdx + visible.length) % visible.length];
            if (lbImg) {
              lbImg.src = item.imgSrc;
              lbImg.alt = item.imgAlt;
            }
            if (lbTitle) lbTitle.textContent = item.title;
            if (lbText) lbText.textContent = item.text;
          };

          const openLightbox = (id, triggerEl) => {
            const visible = getVisibleCards();
            const idx = visible.findIndex((c) => c.id === id);
            activeIdx = idx >= 0 ? idx : 0;
            lastTrigger = triggerEl || document.activeElement;
            renderLightbox();
            lightbox.classList.add('is-open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            pauseLenis(true);
            lbClose?.focus();
          };

          const closeLightbox = () => {
            lightbox.classList.remove('is-open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            pauseLenis(false);
            lastTrigger?.focus();
          };

          projectCards.forEach((card) => {
            card.addEventListener('click', () => openLightbox(card.dataset.projectId, card));
          });

          lbPrev?.addEventListener('click', () => {
            const visible = getVisibleCards();
            activeIdx = (activeIdx - 1 + visible.length) % visible.length;
            renderLightbox();
          });
          lbNext?.addEventListener('click', () => {
            const visible = getVisibleCards();
            activeIdx = (activeIdx + 1) % visible.length;
            renderLightbox();
          });
          lbClose?.addEventListener('click', closeLightbox);
          lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
          });

          let touchStartX = 0;
          lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
          }, { passive: true });
          lightbox.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 48) {
              const visible = getVisibleCards();
              activeIdx = dx < 0
                ? (activeIdx + 1) % visible.length
                : (activeIdx - 1 + visible.length) % visible.length;
              renderLightbox();
            }
          });

          document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('is-open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') lbPrev?.click();
            if (e.key === 'ArrowRight') lbNext?.click();
          });
        }
      }
    } catch (err) {
      console.warn('[WK motion] filters failed:', err);
    }

    // Forms validation + submit (footer, contact, offer popup)
    try {
      document.querySelectorAll('.wk-lead-form').forEach((form) => {
        const requireEmail = form.dataset.requireEmail === 'true';
        const successCopy = form.dataset.successText || 'Thanks. We got your message and will call you back soon.';

        const setFieldError = (fieldName, msg) => {
          const errEl = form.querySelector(`[data-error-for="${fieldName}"]`);
          if (errEl) errEl.textContent = msg || '';
        };

        const readFields = () => ({
          name: form.elements.name?.value || '',
          phone: form.elements.phone?.value || '',
          email: form.elements.email?.value || '',
          projectType: form.elements.project_type?.value || '',
          location: form.elements.job_location?.value || '',
          message: form.elements.message?.value || '',
          honeypot: form.elements.company_website?.value || '',
          requireEmail,
        });

        ['name', 'phone', 'email'].forEach((fname) => {
          const input = form.elements[fname];
          if (!input) return;
          input.addEventListener('blur', () => {
            const vals = readFields();
            const res = validateLeadForm(vals);
            setFieldError(fname, res.errors[fname] || '');
          });
        });

        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const vals = readFields();

          // Honeypot check
          if (vals.honeypot) {
            form.innerHTML = `<div class="form-status" role="status">${successCopy}</div>`;
            return;
          }

          const res = validateLeadForm(vals);
          setFieldError('name', res.errors.name || '');
          setFieldError('phone', res.errors.phone || '');
          setFieldError('email', res.errors.email || '');

          if (!res.valid) {
            const firstBad = Object.keys(res.errors)[0];
            form.elements[firstBad]?.focus();
            return;
          }

          const submitBtn = form.querySelector('button[type="submit"]');
          const originalLabel = submitBtn ? submitBtn.innerHTML : '';
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';
          }

          try {
            if (FORM_ENDPOINT) {
              const resp = await fetch(FORM_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(vals),
              });
              if (!resp.ok) throw new Error('Request failed');
            } else {
              const mailtoUrl = buildMailtoHref(FALLBACK_EMAIL, vals, document.title);
              const a = document.createElement('a');
              a.href = mailtoUrl;
              a.click();
            }

            form.innerHTML = `<div class="form-status" role="status">${successCopy}</div>`;
          } catch {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalLabel;
            }
            const globalErr = form.querySelector('[data-form-error]');
            if (globalErr) {
              globalErr.textContent = 'Something went wrong. Please call (281) 592-3792.';
            }
          }
        });
      });
    } catch (err) {
      console.warn('[WK motion] forms failed:', err);
    }

    // Cookie banner & Offer popup
    let offerTriggerTimer = null;
    try {
      const cookieBanner = document.getElementById('cookie-banner');
      const offerModal = document.getElementById('offer-modal');
      const offerCloseBtn = document.getElementById('offer-close-btn');
      const offerNoThanks = document.getElementById('offer-no-thanks');
      let offerReadyAfterMs = Date.now() + 10000;
      let offerOpened = false;

      const openOfferModal = () => {
        if (offerOpened || isContactPage || !offerModal) return;
        if (Date.now() < offerReadyAfterMs) return;
        let alreadyShown = false;
        try {
          alreadyShown = sessionStorage.getItem('wk_offer') === '1';
        } catch {}
        if (alreadyShown) return;

        offerOpened = true;
        try {
          sessionStorage.setItem('wk_offer', '1');
        } catch {}
        offerModal.classList.add('is-open');
        offerModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        pauseLenis(true);
        const nameField = offerModal.querySelector('input[name="name"]');
        nameField?.focus();
      };

      const closeOfferModal = () => {
        if (!offerModal) return;
        offerModal.classList.remove('is-open');
        offerModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        pauseLenis(false);
      };

      if (offerModal) {
        offerCloseBtn?.addEventListener('click', closeOfferModal);
        offerNoThanks?.addEventListener('click', closeOfferModal);
        offerModal.addEventListener('click', (e) => {
          if (e.target === offerModal) closeOfferModal();
        });
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && offerModal.classList.contains('is-open')) {
            closeOfferModal();
          }
        });
      }

      const scheduleOfferTriggers = (extraDelayMs = 0) => {
        if (isContactPage || !offerModal) return;
        const startTime = Date.now() + extraDelayMs;
        offerReadyAfterMs = Math.max(offerReadyAfterMs, startTime);

        const isMobileViewport = window.innerWidth < 900;
        if (!isMobileViewport) {
          const onMouseOut = (e) => {
            if (!e.relatedTarget && e.clientY <= 4) {
              openOfferModal();
            }
          };
          document.addEventListener('mouseout', onMouseOut);
          offerTriggerTimer = setTimeout(openOfferModal, Math.max(35000, extraDelayMs + 10000));
        } else {
          let mobileScrollMet = false;
          let mobileTimeMet = false;
          const maybeOpenMobile = () => {
            if (mobileScrollMet && mobileTimeMet) openOfferModal();
          };
          const onMobileScroll = () => {
            const docH = document.documentElement.scrollHeight - window.innerHeight;
            if (docH > 0 && window.scrollY / docH >= 0.55) {
              mobileScrollMet = true;
              maybeOpenMobile();
            }
          };
          window.addEventListener('scroll', onMobileScroll, { passive: true });
          offerTriggerTimer = setTimeout(() => {
            mobileTimeMet = true;
            maybeOpenMobile();
          }, Math.max(20000, extraDelayMs + 10000));
        }
      };

      let savedCookie = null;
      try {
        savedCookie = localStorage.getItem('wk_cookie');
      } catch {}

      window.WK_CONSENT = { analytics: savedCookie === 'all' };

      if (!savedCookie && cookieBanner) {
        setTimeout(() => {
          cookieBanner.classList.add('is-visible');
          scheduleOfferTriggers(8000);
        }, 1200);

        const saveCookieChoice = (choice) => {
          try {
            localStorage.setItem('wk_cookie', choice);
          } catch {}
          window.WK_CONSENT = { analytics: choice === 'all' };
          cookieBanner.classList.remove('is-visible');
          if (!offerTriggerTimer) {
            scheduleOfferTriggers(2000);
          }
        };

        document.getElementById('cookie-accept-btn')?.addEventListener('click', () => saveCookieChoice('all'));
        document.getElementById('cookie-needed-btn')?.addEventListener('click', () => saveCookieChoice('needed'));
      } else {
        scheduleOfferTriggers(0);
      }
    } catch (err) {
      console.warn('[WK motion] popups failed:', err);
    }

    // Required debug line after setup
    console.info('[WK motion]', {
      reducedMotion,
      hasFinePointer,
      lenis: !!lenis,
      triggers: ScrollTrigger.getAll().length,
    });

    // Cleanup on unmount / pagehide
    const cleanupScrollTriggers = () => {
      if (gsapCtx) gsapCtx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
    window.addEventListener('pagehide', cleanupScrollTriggers);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      document.removeEventListener('click', handleInternalLink);
      if (onKeyDownMenu) document.removeEventListener('keydown', onKeyDownMenu);
      window.removeEventListener('scroll', onScrollHeader);
      if (syncStickyBar) window.removeEventListener('scroll', syncStickyBar);
      if (onResize) window.removeEventListener('resize', onResize);
      window.removeEventListener('load', scheduleRefresh);
      belowFoldImgListeners.forEach((img) => img.removeEventListener('load', scheduleRefresh));
      if (refreshTimer) clearTimeout(refreshTimer);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('pagehide', cleanupScrollTriggers);
      if (barObserver) barObserver.disconnect();
      if (removeCursorListeners) removeCursorListeners();
      if (offerTriggerTimer) clearTimeout(offerTriggerTimer);
      if (tickerFn) gsap.ticker.remove(tickerFn);
      if (lenis) {
        lenis.destroy();
        window.__lenis = null;
      }
      cleanupScrollTriggers();
    };
  }, []);

  return null;
}
