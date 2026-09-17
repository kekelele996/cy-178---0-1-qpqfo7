import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LABELS, ROUTES, ECHO_STATUS_TEXT } from '../config/constants.js';
import { EchoApi } from '../services/echoApi.js';

function formatTime(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EchoCard({ item, onOpen }) {
  return (
    <div className="letter-card" onClick={() => onOpen(item.id)}>
      <div className="letter-meta">
        <span>
          <span className={`badge ${item.status}`}>{ECHO_STATUS_TEXT[item.status]}</span>
          {` ${item.replyCount} ${LABELS.ECHO_REPLY_COUNT}`}
          {item.isMine && <span className="badge mine">{LABELS.ECHO_MINE}</span>}
          {!item.isMine && item.hasReplied && (
            <span className="badge mine">{LABELS.ECHO_REPLIED_BY_ME}</span>
          )}
        </span>
        <span>
          {item.status === 'open'
            ? `${LABELS.ECHO_DEADLINE_PREFIX} ${formatTime(item.deadlineAt)}`
            : `${LABELS.ECHO_CLOSED_AT_PREFIX} ${formatTime(item.closedAt || item.deadlineAt)}`}
        </span>
      </div>
      <div className="letter-preview">
        {item.preview}
        {item.preview.length >= 80 ? '…' : ''}
      </div>
    </div>
  );
}

export default function EchoWallPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await EchoApi.wall();
        setItems(data.items || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <div className="echo-head">
        <div>
          <h2 className="echo-title">{LABELS.ECHO_WALL}</h2>
          <p className="echo-sub">{LABELS.ECHO_WALL_HINT}</p>
        </div>
        <button className="big-btn" onClick={() => navigate(ROUTES.ECHO_NEW)}>
          {LABELS.ECHO_COMPOSE}
        </button>
      </div>
      {loading ? (
        <div className="loading">加载中…</div>
      ) : items.length === 0 ? (
        <div className="empty-state">{LABELS.ECHO_EMPTY}</div>
      ) : (
        <div className="letter-list">
          {items.map((item) => (
            <EchoCard key={item.id} item={item} onOpen={(id) => navigate(`/echo/${id}`)} />
          ))}
        </div>
      )}
      {error && <div className="error-text">{error}</div>}
    </div>
  );
}
