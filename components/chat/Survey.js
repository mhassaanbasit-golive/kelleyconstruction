'use client';

import { useEffect, useRef, useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';

export default function Survey({ visitor, onCompleteSurvey }) {
  const [first, setFirst] = useState(null);
  const [resolved, setResolved] = useState(null);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const finishTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitted) return;

    setSubmitted(true);

    const trimmedComment = comment.trim();
    const firstBool = first === true;
    const resolvedBool = resolved === true;

    try {
      if (!String(visitor?.company_website || '').trim()) {
        await fetch('/api/survey/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first: firstBool,
            resolved: resolvedBool,
            rating,
            comment: trimmedComment,
            name: visitor?.name || '',
            email: visitor?.email || '',
            company_website: visitor?.company_website || '',
          }),
        });
      }
    } catch (err) {
      console.warn('[WK chat] survey post skipped:', err);
    }

    finishTimerRef.current = setTimeout(() => {
      onCompleteSurvey({ rating, comment: trimmedComment });
    }, 1500);
  };

  return (
    <div className="wk-chat-survey-scroll" data-lenis-prevent="">
      <div className="wk-chat-survey-wrap">
        {submitted ? (
          <div className="wk-chat-survey-thanks" role="status">
            <h2 className="wk-chat-survey-title">Thank you.</h2>
            <p className="wk-chat-survey-sub">Your feedback has been sent.</p>
          </div>
        ) : (
          <>
            <h2 className="wk-chat-survey-title">You have closed the chat.</h2>

            <form className="wk-chat-survey-form" onSubmit={handleSubmit}>
              <div className="wk-chat-survey-q">
                <span className="wk-chat-label">
                  Is this the first time you have chatted with us about this project?
                </span>
                <div className="wk-chat-yesno-group" role="group" aria-label="First time chatting">
                  <button
                    type="button"
                    className={`wk-chat-choice-btn ${first === true ? 'is-active' : ''}`}
                    aria-pressed={first === true}
                    onClick={() => setFirst(true)}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`wk-chat-choice-btn ${first === false ? 'is-active' : ''}`}
                    aria-pressed={first === false}
                    onClick={() => setFirst(false)}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="wk-chat-survey-q">
                <span className="wk-chat-label">Did you get what you needed?</span>
                <div className="wk-chat-yesno-group" role="group" aria-label="Did you get what you needed">
                  <button
                    type="button"
                    className={`wk-chat-choice-btn ${resolved === true ? 'is-active' : ''}`}
                    aria-pressed={resolved === true}
                    onClick={() => setResolved(true)}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`wk-chat-choice-btn ${resolved === false ? 'is-active' : ''}`}
                    aria-pressed={resolved === false}
                    onClick={() => setResolved(false)}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="wk-chat-survey-q">
                <span className="wk-chat-label">How would you rate this chat?</span>
                <div className="wk-chat-thumbs-group" role="group" aria-label="Rate this chat">
                  <button
                    type="button"
                    className={`wk-chat-thumb-btn ${rating === 'Thumbs up' ? 'is-active' : ''}`}
                    aria-label="Thumbs up"
                    aria-pressed={rating === 'Thumbs up'}
                    onClick={() => setRating((r) => (r === 'Thumbs up' ? '' : 'Thumbs up'))}
                  >
                    <ThumbsUp size={18} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={`wk-chat-thumb-btn ${rating === 'Thumbs down' ? 'is-active' : ''}`}
                    aria-label="Thumbs down"
                    aria-pressed={rating === 'Thumbs down'}
                    onClick={() => setRating((r) => (r === 'Thumbs down' ? '' : 'Thumbs down'))}
                  >
                    <ThumbsDown size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="wk-chat-field">
                <label htmlFor="wk-chat-survey-comment" className="wk-chat-label">
                  Optional comment
                </label>
                <input
                  id="wk-chat-survey-comment"
                  type="text"
                  className="wk-chat-input"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <button type="submit" className="wk-chat-submit-btn">
                Submit
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
