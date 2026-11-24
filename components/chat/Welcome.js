'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import { playSound } from './lib/sound.js';

function createCubicBezierEase(x1, y1, x2, y2) {
  const sampleCurveX = (t) => ((1 - 3 * x2 + 3 * x1) * t + (3 * x2 - 6 * x1)) * t * t + 3 * x1 * t;
  const sampleCurveY = (t) => ((1 - 3 * y2 + 3 * y1) * t + (3 * y2 - 6 * y1)) * t * t + 3 * y1 * t;
  const sampleDerivativeX = (t) => (3 * (1 - 3 * x2 + 3 * x1) * t + 2 * (3 * x2 - 6 * x1)) * t + 3 * x1;

  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i += 1) {
      const err = sampleCurveX(t) - x;
      if (Math.abs(err) < 1e-5) break;
      const d = sampleDerivativeX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    return sampleCurveY(Math.max(0, Math.min(1, t)));
  };
}

const HEADLINE = 'Ask us anything.';

export default function Welcome({ isActive, isMuted, onStart }) {
  const headingRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    if (!isActive) return undefined;
    const headingEl = headingRef.current;
    const cursorEl = cursorRef.current;
    if (!headingEl) return undefined;

    let reducedMotion = false;
    try {
      const forceFull = document.documentElement.classList.contains('wk-motion-full');
      reducedMotion = !forceFull && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {}

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        if (cursorEl) gsap.set(cursorEl, { opacity: 0, display: 'none' });
        gsap.fromTo(headingEl, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power1.out' });
        return;
      }

      const chars = headingEl.querySelectorAll('.wk-chat-welcome-char');
      const easeOut = createCubicBezierEase(0.16, 1, 0.3, 1);

      gsap.set(headingEl, { opacity: 1 });
      if (chars.length) {
        gsap.fromTo(
          chars,
          { y: 8, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.045,
            ease: easeOut,
          }
        );
      }

      if (cursorEl) {
        gsap.set(cursorEl, { opacity: 1, display: 'inline-block' });
        const blinkTween = gsap.to(cursorEl, {
          opacity: 0,
          duration: 0.45,
          repeat: -1,
          yoyo: true,
          ease: 'steps(1)',
        });
        gsap.delayedCall(3.6, () => {
          blinkTween.kill();
          gsap.to(cursorEl, { opacity: 0, duration: 0.4, ease: 'power1.out' });
        });
      }
    }, headingRef);

    return () => ctx.revert();
  }, [isActive]);

  const handleStartClick = () => {
    playSound('pop', isMuted);
    onStart();
  };

  return (
    <div className="wk-chat-welcome">
      <div
        ref={headingRef}
        className="wk-chat-welcome-title"
        role="heading"
        aria-level={1}
        aria-label={HEADLINE}
      >
        {HEADLINE.split('').map((ch, idx) => (
          <span key={idx} className="wk-chat-welcome-char" aria-hidden="true">
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
        <span ref={cursorRef} className="wk-chat-welcome-cursor" aria-hidden="true" />
      </div>

      <button
        type="button"
        className="wk-chat-start-btn"
        onClick={handleStartClick}
      >
        <span>Start chat</span>
        <span className="wk-chat-start-circle" aria-hidden="true">
          <ArrowRight size={15} />
        </span>
      </button>
    </div>
  );
}
