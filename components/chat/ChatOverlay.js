'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { Volume2, VolumeX, X } from 'lucide-react';
import { CHAT_CONFIG, GETGOLIVE_URL } from './lib/config.js';
import {
  clearChatSessionStorage,
  getOrCreateSessionId,
} from './lib/client.js';
import {
  buildLeadPayload,
  createLeadTracker,
  postLeadWithRetries,
  sendLeadBeacon,
} from './lib/lead.js';
import { getPageContext } from './lib/pageContext.js';
import { safeSession, safeStorage } from './lib/storage.js';
import Welcome from './Welcome.js';
import DetailsForm from './DetailsForm.js';
import ChatScreen from './ChatScreen.js';
import Survey from './Survey.js';

function getInitialVisitor() {
  const saved = safeStorage.getJson('sm_visitor', null);
  if (saved && typeof saved === 'object') {
    return {
      name: String(saved.name || ''),
      email: String(saved.email || ''),
      phone: String(saved.phone || ''),
      company_website: '',
    };
  }
  return { name: '', email: '', phone: '', company_website: '' };
}

function getInitialMessages() {
  const saved = safeSession.getJson('chat_memory', null);
  return Array.isArray(saved) ? saved : [];
}

function createInitialState() {
  return {
    isOpen: false,
    screen: 'welcome',
    visitor: getInitialVisitor(),
    messages: getInitialMessages(),
    isMuted: safeStorage.getItem('wk_chat_muted') === '1',
  };
}

function chatReducer(state, action) {
  switch (action.type) {
    case 'OPEN':
      return { ...state, isOpen: true };
    case 'CLOSE':
      return { ...state, isOpen: false };
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };
    case 'SET_LEAD':
      return {
        ...state,
        visitor: { ...state.visitor, ...action.visitor },
      };
    case 'SET_MESSAGES': {
      const nextMessages =
        typeof action.messages === 'function'
          ? action.messages(state.messages)
          : action.messages;
      return { ...state, messages: Array.isArray(nextMessages) ? nextMessages : [] };
    }
    case 'TOGGLE_MUTE': {
      const nextMuted = !state.isMuted;
      safeStorage.setItem('wk_chat_muted', nextMuted ? '1' : '0');
      return { ...state, isMuted: nextMuted };
    }
    case 'RESET':
      return {
        ...state,
        isOpen: false,
        screen: 'welcome',
        messages: [],
      };
    default:
      return state;
  }
}

export default function ChatOverlay({ openSignal, onCloseNotify }) {
  const [state, dispatch] = useReducer(chatReducer, null, createInitialState);

  const startedAtRef = useRef(new Date().toISOString());
  const leadTrackerRef = useRef(createLeadTracker());
  const idleTimerRef = useRef(null);
  const stateRef = useRef(state);
  const wasOpenRef = useRef(false);
  const overlayRef = useRef(null);
  const persistTimerRef = useRef(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Respond to external open trigger from launcher / bubble / chat:open event
  useEffect(() => {
    if (openSignal > 0) {
      dispatch({ type: 'OPEN' });
    }
  }, [openSignal]);

  // Debounce conversation transcript persistence so streaming tokens never thrash sessionStorage
  useEffect(() => {
    if (state.messages.length === 0) return undefined;
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      safeSession.setJson('chat_memory', state.messages);
      persistTimerRef.current = null;
    }, 450);

    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
    };
  }, [state.messages]);

  const sendLead = useCallback((reason, overrides = {}) => {
    try {
      const current = stateRef.current;
      const activeVisitor = overrides.visitor || current.visitor;
      const rating = overrides.rating || '';
      const comment = overrides.comment || '';
      const tracker = leadTrackerRef.current;

      if (
        !tracker.shouldSend({
          reason,
          messages: current.messages,
          visitor: activeVisitor,
          rating,
          comment,
          companyWebsite: activeVisitor?.company_website || '',
        })
      ) {
        return;
      }

      tracker.markSent({
        reason,
        messages: current.messages,
        visitor: activeVisitor,
        rating,
        comment,
      });

      const payload = buildLeadPayload({
        sessionId: getOrCreateSessionId(),
        reason,
        visitor: activeVisitor,
        startedAt: startedAtRef.current,
        endedAt: new Date().toISOString(),
        pageUrl: getPageContext().url,
        rating,
        comment,
        messages: current.messages,
        companyWebsite: activeVisitor?.company_website || '',
      });

      if (reason === 'leave') {
        sendLeadBeacon(payload);
      } else {
        postLeadWithRetries(payload, 3).catch((err) => {
          console.warn('[WK chat] lead retry failed:', err);
        });
      }
    } catch (err) {
      console.warn('[WK chat] lead dispatch skipped:', err);
    }
  }, []);

  const scheduleIdleLead = useCallback(() => {
    try {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        sendLead('idle');
      }, 120_000);
    } catch (err) {
      console.warn('[WK chat] idle timer failed:', err);
    }
  }, [sendLead]);

  // Leave triggers (visibilitychange hidden / pagehide)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        sendLead('leave');
      }
    };
    const handlePageHide = () => {
      sendLead('leave');
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handlePageHide);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [sendLead]);

  // Smart Close behavior
  const handleSmartClose = useCallback(() => {
    const current = stateRef.current;
    const hasUserMsg = current.messages.some(
      (m) => m.role === 'user' && String(m.text || '').trim().length > 0
    );

    if (current.screen === 'welcome' || current.screen === 'form') {
      dispatch({ type: 'CLOSE' });
      return;
    }

    if (current.screen === 'chat') {
      if (!hasUserMsg) {
        dispatch({ type: 'CLOSE' });
        return;
      }
      sendLead('close');
      dispatch({ type: 'SET_SCREEN', screen: 'survey' });
      return;
    }

    if (current.screen === 'survey') {
      sendLead('close');
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      clearChatSessionStorage();
      leadTrackerRef.current.reset();
      dispatch({ type: 'RESET' });
    }
  }, [sendLead]);

  // Lock body scroll, Lenis, <main aria-hidden>, and Escape handling
  useEffect(() => {
    const mainEl = document.querySelector('main');

    if (state.isOpen) {
      wasOpenRef.current = true;
      document.documentElement.classList.add('wk-chat-open');
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      if (mainEl) mainEl.setAttribute('aria-hidden', 'true');
      try {
        window.__lenis?.stop?.();
      } catch {}

      const overlayEl = overlayRef.current;
      const vv = window.visualViewport;
      const syncViewport = () => {
        if (!overlayEl || !vv) return;
        const nextHeight = Math.round(vv.height);
        if (nextHeight > 200) {
          overlayEl.style.height = `${nextHeight}px`;
          overlayEl.style.transform = vv.offsetTop ? `translate3d(0, ${Math.round(vv.offsetTop)}px, 0)` : '';
        }
      };

      if (vv) {
        syncViewport();
        vv.addEventListener('resize', syncViewport);
        vv.addEventListener('scroll', syncViewport);
      }

      const onKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          handleSmartClose();
        }
      };
      document.addEventListener('keydown', onKeyDown);

      return () => {
        document.removeEventListener('keydown', onKeyDown);
        if (vv) {
          vv.removeEventListener('resize', syncViewport);
          vv.removeEventListener('scroll', syncViewport);
        }
        if (overlayEl) {
          overlayEl.style.height = '';
          overlayEl.style.transform = '';
        }
      };
    }

    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      document.documentElement.classList.remove('wk-chat-open');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      if (mainEl) mainEl.removeAttribute('aria-hidden');
      try {
        window.__lenis?.start?.();
      } catch {}
      try {
        window.dispatchEvent(new CustomEvent('chat:close'));
      } catch {}
      onCloseNotify?.();
    }

    return undefined;
  }, [state.isOpen, handleSmartClose, onCloseNotify]);

  // Cleanup on unmount if closed abruptly
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove('wk-chat-open');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.querySelector('main')?.removeAttribute('aria-hidden');
      try {
        window.__lenis?.start?.();
      } catch {}
    };
  }, []);

  const isWelcome = state.screen === 'welcome';

  const handleSetMessages = useCallback((next) => {
    dispatch({ type: 'SET_MESSAGES', messages: next });
  }, []);

  const handleCompleteForm = useCallback(
    (visitorData) => {
      startedAtRef.current = new Date().toISOString();
      dispatch({ type: 'SET_LEAD', visitor: visitorData });
      sendLead('signin', { visitor: visitorData });
      dispatch({ type: 'SET_SCREEN', screen: 'chat' });
    },
    [sendLead]
  );

  const handleRecordSurvey = useCallback(
    ({ rating, comment }) => {
      sendLead('close', { rating, comment });
    },
    [sendLead]
  );

  const handleCompleteSurvey = useCallback(
    ({ rating, comment }) => {
      sendLead('close', { rating, comment });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      clearChatSessionStorage();
      leadTrackerRef.current.reset();
      dispatch({ type: 'RESET' });
    },
    [sendLead]
  );

  return (
    <div
      ref={overlayRef}
      className={`wk-chat-overlay ${isWelcome ? 'is-dark' : 'is-light'} ${state.isOpen ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="WK Construction Inc. assistant"
      aria-hidden={!state.isOpen}
    >
      {isWelcome ? (
        <header className="wk-chat-header is-welcome">
          <span className="wk-chat-header-brand">{CHAT_CONFIG.shortName}</span>
          <button
            type="button"
            className="wk-chat-close-circle"
            onClick={handleSmartClose}
            aria-label="Close assistant"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
      ) : (
        <header className="wk-chat-header is-light">
          <button
            type="button"
            className="wk-chat-header-btn"
            onClick={() => dispatch({ type: 'TOGGLE_MUTE' })}
            aria-label={state.isMuted ? 'Unmute sounds' : 'Mute sounds'}
            aria-pressed={state.isMuted}
          >
            {state.isMuted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
          </button>

          <span className="wk-chat-header-brand is-centered">{CHAT_CONFIG.shortName}</span>

          <button
            type="button"
            className="wk-chat-header-btn"
            onClick={handleSmartClose}
            aria-label="Close assistant"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
      )}

      <div className="wk-chat-body">
        {state.screen === 'welcome' ? (
          <Welcome
            isActive={state.isOpen && state.screen === 'welcome'}
            isMuted={state.isMuted}
            onStart={() => dispatch({ type: 'SET_SCREEN', screen: 'form' })}
          />
        ) : null}

        {state.screen === 'form' ? (
          <DetailsForm
            initialVisitor={state.visitor}
            isMuted={state.isMuted}
            onComplete={handleCompleteForm}
          />
        ) : null}

        {state.screen === 'chat' ? (
          <ChatScreen
            visitor={state.visitor}
            messages={state.messages}
            onMessagesChange={handleSetMessages}
            onHotLead={() => sendLead('hot')}
            onActivity={scheduleIdleLead}
          />
        ) : null}

        {state.screen === 'survey' ? (
          <Survey
            visitor={state.visitor}
            onSurveyRecord={handleRecordSurvey}
            onCompleteSurvey={handleCompleteSurvey}
          />
        ) : null}
      </div>

      <footer className="wk-chat-footer">
        <a
          href={GETGOLIVE_URL}
          target="_blank"
          rel="noopener"
          className="wk-chat-footer-link"
        >
          Website by GetGoLive
        </a>
      </footer>
    </div>
  );
}
