import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LABELS, ROUTES } from '../config/constants.js';
import { EchoApi } from '../services/echoApi.js';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function toLocalInput(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EchoComposePage() {
  const [content, setContent] = useState('');
  const [deadline, setDeadline] = useState(toLocalInput(Date.now() + DAY_MS));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async () => {
    setError('');
    if (!content.trim()) return;
    const deadlineAt = new Date(deadline).getTime();
    if (!Number.isFinite(deadlineAt)) {
      setError('请选择有效的截止时间');
      return;
    }
    setSending(true);
    try {
      const res = await EchoApi.create({ content: content.trim(), deadlineAt });
      navigate(`/echo/${res.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="compose-wrap">
      <h2 className="compose-title">{LABELS.ECHO_COMPOSE}</h2>
      <p className="compose-hint">{LABELS.ECHO_COMPOSE_HINT}</p>
      <textarea
        className="compose-text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={LABELS.ECHO_CONTENT_PLACEHOLDER}
        maxLength={2000}
      />
      <div className="field" style={{ marginTop: 14 }}>
        <label>{LABELS.ECHO_DEADLINE}</label>
        <input
          type="datetime-local"
          className="deadline-input"
          value={deadline}
          min={toLocalInput(Date.now())}
          max={toLocalInput(Date.now() + 30 * DAY_MS)}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>
      <div className="compose-footer">
        <span className="count">{content.length} / 2000</span>
        <div>
          <button
            className="secondary-btn"
            style={{ marginRight: 10 }}
            onClick={() => navigate(ROUTES.ECHO)}
          >
            {LABELS.BACK}
          </button>
          <button className="big-btn" onClick={submit} disabled={sending || !content.trim()}>
            {sending ? '张贴中…' : LABELS.ECHO_SUBMIT}
          </button>
        </div>
      </div>
      <div className="error-text">{error}</div>
    </div>
  );
}
