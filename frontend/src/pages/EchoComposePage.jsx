import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LABELS, ROUTES } from '../config/constants.js';
import { EchoWallApi } from '../services/echoWallApi.js';
import { toDateTimeLocalValue } from '../utils/time.js';

function getDefaultDeadline() {
  const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return toDateTimeLocalValue(date);
}

export default function EchoComposePage() {
  const [content, setContent] = useState('');
  const [deadline, setDeadline] = useState(getDefaultDeadline);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async () => {
    setError('');
    const deadlineAt = deadline ? new Date(deadline).getTime() : NaN;
    if (!content.trim()) {
      setError('求助内容不能为空');
      return;
    }
    if (!Number.isFinite(deadlineAt)) {
      setError(LABELS.ECHO_DEADLINE);
      return;
    }
    setSending(true);
    try {
      const result = await EchoWallApi.create({
        content: content.trim(),
        deadlineAt
      });
      navigate(`/echo-wall/${result.request.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="compose-wrap echo-compose">
      <h2 className="compose-title">{LABELS.ECHO_COMPOSE}</h2>
      <p className="compose-hint">{LABELS.ECHO_DEADLINE_HINT}</p>
      <textarea
        className="compose-text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={LABELS.ECHO_CONTENT_PLACEHOLDER}
        maxLength={2000}
      />
      <div className="echo-deadline-row">
        <label htmlFor="echo-deadline">{LABELS.ECHO_DEADLINE}</label>
        <input
          id="echo-deadline"
          type="datetime-local"
          value={deadline}
          min={toDateTimeLocalValue(Date.now())}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>
      <div className="compose-footer">
        <span className="count">{content.length} / 2000</span>
        <div>
          <button className="secondary-btn" style={{ marginRight: 10 }} onClick={() => navigate(ROUTES.ECHO_WALL)}>
            {LABELS.BACK}
          </button>
          <button className="big-btn" onClick={submit} disabled={sending || !content.trim() || !deadline}>
            {sending ? '发布中…' : LABELS.ECHO_COMPOSE}
          </button>
        </div>
      </div>
      <div className="error-text">{error}</div>
    </div>
  );
}
