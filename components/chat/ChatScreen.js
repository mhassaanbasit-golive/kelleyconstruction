'use client';

import { memo, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowUp, ArrowUpRight, Check, Mic, MicOff, Square } from 'lucide-react';
import { CHAT_CONFIG } from './lib/config.js';
import { extractFirstName, isAllowedActionHref, tokenizeMessageText } from './lib/format.js';
import { streamChat } from './lib/client.js';
import { getPageContext } from './lib/pageContext.js';
import { safeStorage } from './lib/storage.js';

function createMsg(role, text, extra = {}) {
  return {
    id: `${role}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    role,
    text,
    ts: new Date().toISOString(),
    ...extra,
  };
}

const emptySubscribe = () => () => {};
function getVoiceSnapshot() {
  try {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  } catch {
    return false;
  }
}
function getVoiceServerSnapshot() {
  return false;
}

const MessageContent = memo(function MessageContent({ text }) {
  const tokens = tokenizeMessageText(text);
  return (
    <>
      {tokens.map((tok, i) => {
        if (tok.type === 'link') {
          return (
            <a key={i} href={tok.href} className="wk-chat-inline-link">
              {tok.label}
            </a>
          );
        }
        return <span key={i}>{tok.value}</span>;
      })}
    </>
  );
});

export default function ChatScreen({
  visitor,
  messages,
  onMessagesChange,
  onHotLead,
  onActivity,
}) {
  const [inputText, setInputText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasFirstToken, setHasFirstToken] = useState(false);
  const [liveSteps, setLiveSteps] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const voiceSupported = useSyncExternalStore(
    emptySubscribe,
    getVoiceSnapshot,
    getVoiceServerSnapshot
  );
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');
  const [voiceError, setVoiceError] = useState('');

  const logRef = useRef(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const noticeTimerRef = useRef(null);
  const errorTimerRef = useRef(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const firstName = extractFirstName(visitor?.name);
  const greetingText = `Hi ${firstName} — what are you looking to build or clear?`;
  const hasUserMessage = messages.some((m) => m.role === 'user');
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : CHAT_CONFIG.siteUrl;

  // Seed initial greeting once when entering an empty chat
  useEffect(() => {
    if (messages.length === 0) {
      onMessagesChange([createMsg('bot', greetingText)]);
    }
  }, [messages.length, greetingText, onMessagesChange]);

  // Auto-scroll log to bottom on new content
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, liveSteps, isStreaming, hasFirstToken]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [inputText]);

  // Cleanup active streams or voice timers on unmount
  useEffect(() => {
    return () => {
      try {
        abortRef.current?.abort();
      } catch {}
      try {
        recognitionRef.current?.stop();
      } catch {}
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const stopListening = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    try {
      recognitionRef.current?.stop();
    } catch {}
    recognitionRef.current = null;
    setIsListening(false);
    setInterimText('');
  };

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      stopListening();
    }, 12_000);
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
      return;
    }

    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return;

      if (safeStorage.getItem('wk_voice_notice') !== '1') {
        safeStorage.setItem('wk_voice_notice', '1');
        setVoiceNotice('Your browser turns your voice into text. We only receive the text.');
        if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
        noticeTimerRef.current = setTimeout(() => setVoiceNotice(''), 4000);
      }

      setVoiceError('');
      const recognition = new SR();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onstart = () => {
        setIsListening(true);
        resetSilenceTimer();
      };

      recognition.onresult = (event) => {
        resetSilenceTimer();
        let finalChunk = '';
        let interimChunk = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const res = event.results[i];
          const transcript = res[0]?.transcript || '';
          if (res.isFinal) {
            finalChunk += transcript;
          } else {
            interimChunk += transcript;
          }
        }
        if (finalChunk) {
          setInputText((prev) => {
            const sep = prev && !prev.endsWith(' ') ? ' ' : '';
            return `${prev}${sep}${finalChunk.trim()}`.slice(0, 1000);
          });
        }
        setInterimText(interimChunk);
      };

      recognition.onerror = (event) => {
        const errCode = event?.error || '';
        if (errCode === 'not-allowed' || errCode === 'service-not-allowed' || errCode === 'audio-capture') {
          setVoiceError('Microphone access is blocked. You can type your message instead.');
          if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
          errorTimerRef.current = setTimeout(() => setVoiceError(''), 5000);
        }
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('[WK chat] voice input failed:', err);
      setVoiceError('Microphone access is blocked. You can type your message instead.');
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => setVoiceError(''), 5000);
      stopListening();
    }
  };

  const sendMessage = async (rawText) => {
    const trimmed = String(rawText || '').trim().slice(0, 1000);
    if (!trimmed || isStreaming) return;

    if (isListening) stopListening();

    const userMsg = createMsg('user', trimmed);
    const botPlaceholder = createMsg('bot', '', { action: null });
    const botMsgId = botPlaceholder.id;

    const conversationForApi = [...messagesRef.current, userMsg];
    const nextList = [...conversationForApi, botPlaceholder];
    onMessagesChange(nextList);
    onActivity();

    setInputText('');
    setInterimText('');
    setIsStreaming(true);
    setHasFirstToken(false);
    setLiveSteps([
      { text: 'Understanding your question', done: false },
      { text: 'Checking Wendell Kelley Construction details', done: false },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;

    let botText = '';
    let botAction = null;
    let firstTokenSeen = false;
    let rafId = null;

    const updateBotMessage = (updater) => {
      onMessagesChange((prev) =>
        prev.map((m) => (m.id === botMsgId ? updater(m) : m))
      );
    };

    const flushTokenFrame = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      const snapshot = botText;
      updateBotMessage((m) => (m.text === snapshot ? m : { ...m, text: snapshot }));
    };

    const scheduleTokenFrame = () => {
      if (rafId !== null) return;
      if (typeof requestAnimationFrame === 'undefined') {
        flushTokenFrame();
        return;
      }
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const snapshot = botText;
        updateBotMessage((m) => (m.text === snapshot ? m : { ...m, text: snapshot }));
      });
    };

    try {
      const outcome = await streamChat({
        messages: conversationForApi,
        page: getPageContext(),
        visitor,
        companyWebsite: visitor?.company_website || '',
        signal: controller.signal,
        onEvent: (eventName, data) => {
          if (eventName === 'status' && data?.text) {
            setLiveSteps((prev) => {
              const existingIdx = prev.findIndex((s) => s.text === data.text);
              if (existingIdx !== -1) {
                return prev.map((s, idx) => (idx === existingIdx ? { ...s, active: true } : s));
              }
              return [...prev, { text: data.text, done: false, active: true }];
            });
          } else if (eventName === 'status_done') {
            setLiveSteps((prev) => {
              let marked = false;
              return prev.map((s) => {
                if (!marked && !s.done) {
                  marked = true;
                  return { ...s, done: true, active: false };
                }
                return s;
              });
            });
          } else if (eventName === 'token') {
            const chunk = String(data?.text || '');
            if (!chunk) return;
            if (!firstTokenSeen) {
              firstTokenSeen = true;
              setHasFirstToken(true);
              setLiveSteps([]);
            }
            botText += chunk;
            scheduleTokenFrame();
          } else if (eventName === 'action' && data?.label && data?.href) {
            botAction = { label: String(data.label), href: String(data.href) };
            updateBotMessage((m) => ({ ...m, action: botAction }));
          } else if (eventName === 'suggestions' && Array.isArray(data)) {
            setSuggestions(data.filter((s) => typeof s === 'string' && s.trim()).slice(0, 4));
          } else if (eventName === 'meta' && data?.hotLead) {
            onHotLead();
          }
        },
      });

      flushTokenFrame();

      if (!outcome.ok && !firstTokenSeen) {
        setHasFirstToken(true);
        setLiveSteps([]);
        updateBotMessage((m) => ({
          ...m,
          text: outcome.errorMessage,
        }));
      } else if (!outcome.ok && firstTokenSeen) {
        // Tokens already arrived before timeout
        setLiveSteps([]);
      }
    } catch (err) {
      flushTokenFrame();
      if (err?.name === 'AbortError') {
        // User stopped stream: keep tokens already shown with no error
        if (!firstTokenSeen) {
          onMessagesChange((prev) => prev.filter((m) => m.id !== botMsgId));
        }
      } else if (!firstTokenSeen) {
        updateBotMessage((m) => ({
          ...m,
          text: 'Something went wrong connecting right now. Please call (281) 592-3792 or (281) 593-5422.',
        }));
      }
    } finally {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      abortRef.current = null;
      setIsStreaming(false);
      setLiveSteps([]);
      onActivity();
    }
  };

  const handleStopStream = () => {
    try {
      abortRef.current?.abort();
    } catch {}
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && inputText.trim()) {
        sendMessage(inputText);
      }
    }
  };

  const lastBotMsg = [...messages].reverse().find((m) => m.role === 'bot');

  return (
    <div className="wk-chat-screen">
      <div
        ref={logRef}
        className="wk-chat-log"
        role="log"
        aria-live="polite"
        data-lenis-prevent=""
      >
        <div className="wk-chat-log-inner">
          {messages.map((msg) => {
            if (msg.role === 'user') {
              return (
                <div key={msg.id} className="wk-chat-row is-user">
                  <div className="wk-chat-bubble-user">{msg.text}</div>
                </div>
              );
            }

            // Skip rendering empty placeholder while steps card is visible
            if (!msg.text && isStreaming && !hasFirstToken && msg.id === lastBotMsg?.id) {
              return null;
            }

            const isCurrentStreamingBot = isStreaming && hasFirstToken && msg.id === lastBotMsg?.id;
            const showAction =
              msg.action &&
              isAllowedActionHref(msg.action.href, currentOrigin);

            return (
              <div key={msg.id} className="wk-chat-row is-bot">
                <div className="wk-chat-bubble-bot">
                  <div className="wk-chat-bubble-text">
                    <MessageContent text={msg.text} />
                    {isCurrentStreamingBot ? (
                      <span className="wk-chat-caret" aria-hidden="true" />
                    ) : null}
                  </div>

                  {showAction ? (
                    <div className="wk-chat-action-wrap">
                      <a
                        href={msg.action.href}
                        className="wk-chat-action-pill"
                        target={msg.action.href.startsWith('http') ? '_blank' : undefined}
                        rel={msg.action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        <span>{msg.action.label}</span>
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}

          {isStreaming && !hasFirstToken && liveSteps.length > 0 ? (
            <div className="wk-chat-row is-bot">
              <div className="wk-chat-bubble-bot wk-chat-steps-card" aria-label="Working on your question">
                {liveSteps.map((step, idx) => (
                  <div key={idx} className="wk-chat-step-row">
                    {step.done ? (
                      <span className="wk-chat-step-check" aria-hidden="true">
                        <Check size={14} />
                      </span>
                    ) : (
                      <span className="wk-chat-step-dot" aria-hidden="true" />
                    )}
                    <span>{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="wk-chat-bottom">
        {!hasUserMessage ? (
          <div className="wk-chat-marquee-outer" aria-label="Suggested questions">
            <div className="wk-chat-marquee-track">
              {[...CHAT_CONFIG.starterPrompts, ...CHAT_CONFIG.starterPrompts].map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="wk-chat-chip"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : suggestions.length > 0 && !isStreaming ? (
          <div className="wk-chat-suggestions-row" aria-label="Follow-up suggestions">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                className="wk-chat-chip"
                onClick={() => sendMessage(s)}
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}

        {voiceNotice ? (
          <div className="wk-chat-voice-banner" role="status">
            {voiceNotice}
          </div>
        ) : null}

        {voiceError ? (
          <div className="wk-chat-voice-banner is-error" role="alert">
            {voiceError}
          </div>
        ) : null}

        {interimText ? (
          <div className="wk-chat-interim" aria-live="polite">
            {interimText}
          </div>
        ) : null}

        <div className="wk-chat-composer-wrap">
          <div className="wk-chat-composer">
            <textarea
              ref={textareaRef}
              rows={1}
              maxLength={1000}
              placeholder="Ask about metal buildings, land clearing, or quotes..."
              aria-label="Message"
              className="wk-chat-textarea"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            {voiceSupported ? (
              <button
                type="button"
                className={`wk-chat-mic-btn ${isListening ? 'is-listening' : ''}`}
                onClick={toggleVoice}
                aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                aria-pressed={isListening}
                disabled={isStreaming}
              >
                {isListening ? <MicOff size={18} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />}
              </button>
            ) : null}

            {isStreaming ? (
              <button
                type="button"
                className="wk-chat-send-btn is-stop"
                onPointerDown={(e) => e.preventDefault()}
                onClick={handleStopStream}
                aria-label="Stop response"
              >
                <Square size={15} fill="currentColor" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                className={`wk-chat-send-btn ${inputText.trim() ? 'is-ready' : ''}`}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => sendMessage(inputText)}
                disabled={!inputText.trim()}
                aria-label="Send message"
              >
                <ArrowUp size={18} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
