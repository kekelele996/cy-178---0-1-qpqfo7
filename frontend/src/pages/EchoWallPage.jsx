import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ECHO_STATE_TEXT, LABELS, ROUTES } from '../config/constants.js';
import { EchoWallApi } from '../services/echoWallApi.js';
import { formatDateTime } from '../utils/time.js';

function EchoCard({ item, onOpen }) {
  const closed = item.status === 'closed';
  return (
    <article className="echo-card" onClick={() => onOpen(item.id)}>
      <div className="echo-card-head">
        <span className={`echo-badge ${closed ? 'closed' : 'open'}`}>
          {closed ? LABELS.ECHO_CLOSED : LABELS.ECHO_OPEN}
        </span>
        <span className="echo-state">{ECHO_STATE_TEXT[item.state]}</span>
      </div>
      {item.content ? (
        <p className="echo-preview">{item.content}</p>
      ) : (
        <p className="echo-preview private">{LABELS.ECHO_NON_PARTICIPANT_HINT}</p>
      )}
      <div className="echo-card-foot">
        <span>{LABELS.ECHO_REPLY_COUNT(item.replyCount)}</span>
        <span>
          {item.isAuthor ? '我发起的' : item.myReplyId ? '我已回复' : `截止 ${formatDateTime(item.deadlineAt)}`}
        </span>
      </div>
    </article>
  );
}

export default function EchoWallPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const data = await EchoWallApi.list();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="echo-page">
      <div className="echo-page-head">
        <div>
          <h2>{LABELS.ECHO_WALL}</h2>
          <p>{LABELS.ECHO_DEADLINE_HINT}</p>
        </div>
        <button className="big-btn" onClick={() => navigate(ROUTES.ECHO_COMPOSE)}>
          {LABELS.ECHO_COMPOSE}
        </button>
      </div>

      {loading ? (
        <div className="loading">加载回音墙…</div>
      ) : error ? (
        <div className="error-text">{error}</div>
      ) : requests.length === 0 ? (
        <div className="empty-state">{LABELS.ECHO_EMPTY}</div>
      ) : (
        <div className="echo-list">
          {requests.map((item) => (
            <EchoCard key={item.id} item={item} onOpen={(id) => navigate(`/echo-wall/${id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
