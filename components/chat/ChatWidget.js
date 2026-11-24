'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { BotMessageSquareIcon } from '../ui/bot-message-square.js';
import { playNotificationChime } from './lib/sound.js';
import { safeSession, safeStorage } from './lib/storage.js';

const ChatOverlay = React.lazy(() => import('./ChatOverlay.js'));

function shouldAnimateIcon() {
  try {
    const forceFull = document.documentElement.classList.contains('wk-motion-full');
    const reduced = !forceFull && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !reduced;
  } catch {
    return true;
  }
}

export default function ChatWidget() {
  const [siteReady, setSiteReady] = useState(false);
  const [introAnimate, setIntroAnimate] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [overlayMounted, setOverlayMounted] = useState(false);
  const [openSignal, setOpenSignal] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [blockedByPopup, setBlockedByPopup] = useState(false);
  const [hiddenByContactForm, setHiddenByContactForm] = useState(false);
  const [stickyBarVisible, setStickyBarVisible] = useState(false);

  const hasUserGestureRef = useRef(false);
  const launcherRef = useRef(null);
  const iconRef = useRef(null);

  // Track whether user has interacted with the page (for optional proactive chime)
  useEffect(() => {
    const markGesture = () => {
      hasUserGestureRef.current = true;
    };
    window.addEventListener('pointerdown', markGesture, { passive: true, once: true });
    window.addEventListener('keydown', markGesture, { passive: true, once: true });
    return () => {
      window.removeEventListener('pointerdown', markGesture);
      window.removeEventListener('keydown', markGesture);
    };
  }, []);

  // Show launcher after site:ready event or 3.5s fallback
  useEffect(() => {
    let shown = false;
    const reveal = () => {
      if (shown) return;
      shown = true;
      setSiteReady(true);
      // Preload ChatOverlay bundle once launcher becomes ready
      import('./ChatOverlay.js').catch(() => {});
    };

    window.addEventListener('site:ready', reveal, { once: true });
    const fallbackTimer = setTimeout(reveal, 3500);

    return () => {
      window.removeEventListener('site:ready', reveal);
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Play animated bot icon once at 350ms after launcher appears
  useEffect(() => {
    if (!siteReady) return undefined;
    const t = setTimeout(() => {
      setIntroAnimate(true);
      if (shouldAnimateIcon()) {
        iconRef.current?.startAnimation?.();
      }
    }, 350);
    const stopT = setTimeout(() => {
      setIntroAnimate(false);
      iconRef.current?.stopAnimation?.();
    }, 1800);
    return () => {
      clearTimeout(t);
      clearTimeout(stopT);
    };
  }, [siteReady]);

  // Monitor cookie banner, exit offer, mobile menu, lightbox, and mobile sticky bar classes
  useEffect(() => {
    const cookieBanner = document.getElementById('cookie-banner');
    const offerModal = document.getElementById('offer-modal');
    const mobileMenu = document.getElementById('mobile-menu-overlay');
    const lightboxModal = document.getElementById('lightbox-modal');
    const stickyBar = document.getElementById('mobile-sticky-bar');

    const syncOverlays = () => {
      const cookieOpen = Boolean(cookieBanner?.classList.contains('is-visible'));
      const offerOpen = Boolean(offerModal?.classList.contains('is-open'));
      const menuOpen = Boolean(mobileMenu?.classList.contains('is-open'));
      const lightboxOpen = Boolean(lightboxModal?.classList.contains('is-open'));
      setBlockedByPopup(cookieOpen || offerOpen || menuOpen || lightboxOpen);
      setStickyBarVisible(Boolean(stickyBar?.classList.contains('is-visible')));
    };

    syncOverlays();

    if (typeof MutationObserver === 'undefined') return undefined;
    const observer = new MutationObserver(syncOverlays);
    if (cookieBanner) observer.observe(cookieBanner, { attributes: true, attributeFilter: ['class'] });
    if (offerModal) observer.observe(offerModal, { attributes: true, attributeFilter: ['class'] });
    if (mobileMenu) observer.observe(mobileMenu, { attributes: true, attributeFilter: ['class'] });
    if (lightboxModal) observer.observe(lightboxModal, { attributes: true, attributeFilter: ['class'] });
    if (stickyBar) observer.observe(stickyBar, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  // Hide launcher on phones when Contact page footer / lead form is in view
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const isContactPage =
      window.location.pathname === '/contact' ||
      window.location.pathname.startsWith('/contact/');

    const footerFormCol = document.getElementById('footer-form-col');
    const contactForm = isContactPage
      ? document.querySelector('.contact-overlap-card .wk-lead-form')
      : null;

    let footerInView = false;
    let contactFormFocused = false;
    let contactFormInView = false;

    const syncFormHide = () => {
      const isPhone = window.innerWidth < 900;
      if (!isPhone) {
        setHiddenByContactForm(false);
        return;
      }
      setHiddenByContactForm(
        footerInView || (isContactPage && (contactFormFocused || contactFormInView))
      );
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === footerFormCol) {
            footerInView = entry.isIntersecting;
          } else if (entry.target === contactForm) {
            contactFormInView = entry.intersectionRatio >= 0.55;
          }
        }
        syncFormHide();
      },
      { threshold: [0.08, 0.55] }
    );

    if (footerFormCol && !isContactPage) {
      observer.observe(footerFormCol);
    }
    if (contactForm) {
      observer.observe(contactForm);
    }

    const onFocusIn = (e) => {
      if (isContactPage && contactForm?.contains(e.target)) {
        contactFormFocused = true;
        syncFormHide();
      }
    };
    const onFocusOut = (e) => {
      if (isContactPage && contactForm && !contactForm.contains(e.relatedTarget)) {
        contactFormFocused = false;
        syncFormHide();
      }
    };

    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    window.addEventListener('resize', syncFormHide);
    syncFormHide();

    return () => {
      observer.disconnect();
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      window.removeEventListener('resize', syncFormHide);
    };
  }, []);

  // Listen for window "chat:open" custom events
  useEffect(() => {
    const onExternalOpen = () => {
      setOverlayMounted(true);
      setChatOpen(true);
      setBubbleVisible(false);
      setOpenSignal((n) => n + 1);
    };
    window.addEventListener('chat:open', onExternalOpen);
    return () => window.removeEventListener('chat:open', onExternalOpen);
  }, []);

  // Proactive bubble 500ms after launcher shows, stays 4s, once per session
  useEffect(() => {
    if (!siteReady || blockedByPopup || hiddenByContactForm || chatOpen) {
      return undefined;
    }
    if (safeSession.getItem('notificationShown') === '1') {
      return undefined;
    }

    let hideTimer = null;
    const showTimer = setTimeout(() => {
      const cookieOpen = Boolean(document.getElementById('cookie-banner')?.classList.contains('is-visible'));
      const offerOpen = Boolean(document.getElementById('offer-modal')?.classList.contains('is-open'));
      if (cookieOpen || offerOpen) return;

      safeSession.setItem('notificationShown', '1');
      setBubbleVisible(true);

      if (hasUserGestureRef.current) {
        const muted = safeStorage.getItem('wk_chat_muted') === '1';
        playNotificationChime(muted);
      }

      hideTimer = setTimeout(() => {
        setBubbleVisible(false);
      }, 4000);
    }, 500);

    return () => {
      clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [siteReady, blockedByPopup, hiddenByContactForm, chatOpen]);

  const handleOpenClick = () => {
    try {
      window.dispatchEvent(new CustomEvent('chat:open'));
    } catch {
      setOverlayMounted(true);
      setChatOpen(true);
      setBubbleVisible(false);
      setOpenSignal((n) => n + 1);
    }
  };

  const handleOverlayClose = useCallback(() => {
    setChatOpen(false);
    launcherRef.current?.focus();
  }, []);

  const handleLauncherEnter = () => {
    if (shouldAnimateIcon()) {
      iconRef.current?.startAnimation?.();
    }
  };

  const handleLauncherLeave = () => {
    if (!introAnimate) {
      iconRef.current?.stopAnimation?.();
    }
  };

  const launcherVisible = siteReady && !blockedByPopup && !hiddenByContactForm && !chatOpen;

  return (
    <>
      <div
        className={`wk-chat-widget-anchor ${launcherVisible ? 'is-visible' : ''} ${
          stickyBarVisible ? 'has-sticky-bar' : ''
        }`}
      >
        <button
          type="button"
          className={`wk-chat-proactive ${bubbleVisible && launcherVisible ? 'is-visible' : ''}`}
          onClick={handleOpenClick}
          aria-hidden={!bubbleVisible || !launcherVisible}
          tabIndex={bubbleVisible && launcherVisible ? 0 : -1}
        >
          Got a project in mind? Ask us here.
        </button>

        <button
          ref={launcherRef}
          type="button"
          className={`wk-chat-launcher ${introAnimate ? 'is-intro' : ''}`}
          onClick={handleOpenClick}
          onMouseEnter={handleLauncherEnter}
          onMouseLeave={handleLauncherLeave}
          onFocus={handleLauncherEnter}
          onBlur={handleLauncherLeave}
          aria-label="Open chat assistant"
          aria-expanded={chatOpen}
          tabIndex={launcherVisible ? 0 : -1}
        >
          <BotMessageSquareIcon
            ref={iconRef}
            size={24}
            className="wk-chat-launcher-icon"
            aria-hidden="true"
          />
        </button>
      </div>

      {overlayMounted ? (
        <Suspense fallback={null}>
          <ChatOverlay openSignal={openSignal} onCloseNotify={handleOverlayClose} />
        </Suspense>
      ) : null}
    </>
  );
}
