import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LABELS, ROUTES, ECHO_STATUS_TEXT, ECHO_REPLY_STATUS_TEXT } from '../config/constants.js';
import { EchoApi } from '../services/echoApi.js';

function formatTime(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EchoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const detail = await EchoApi.detail(id);
      setData(detail);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const submitReply = async () => {
    setError('');
    if (!reply.trim()) return;
    setSubmitting(true);
    try {
      await EchoApi.reply({ id, content: reply.trim() });
      setReply('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const accept = async (replyId) => {
    setError('');
    setAcceptingId(replyId);
    try {
      await EchoApi.accept({ id, replyId });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) return <div className="loading">加载中…</div>;
  if (!data) return <div className="empty-state">{error || '无法加载求助'}</div>;

  const isOpen = data.status === 'open';

  return (
    <div className="thread-wrap">
      <div className="thread-head">
        <h2>
          求助 #{data.id}{' '}
          <span className={`badge ${data.status}`}>{ECHO_STATUS_TEXT[data.status]}</span>
        </h2>
        <button className="icon-btn" onClick={() => navigate(ROUTES.ECHO)}>
          {LABELS.BACK}
        </button>
      </div>

      <div className="echo-request">
        <div className="echo-content">{data.content}</div>
        <div className="letter-meta">
          <span>
            {data.isOwner ? LABELS.ECHO_MINE : LABELS.ECHO_ANONYMOUS}
            {` · ${data.replyCount} ${LABELS.ECHO_REPLY_COUNT}`}
          </span>
          <span>
            {isOpen
              ? `${LABELS.ECHO_DEADLINE_PREFIX} ${formatTime(data.deadlineAt)}`
              : `${LABELS.ECHO_CLOSED_AT_PREFIX} ${formatTime(data.closedAt || data.deadlineAt)}`}
          </span>
        </div>
      </div>

      <h3 className="echo-section-title">
        {LABELS.ECHO_REPLIES_TITLE}（{data.replies.length}）
      </h3>
      {data.replies.length > 0 ? (
        <div className="echo-reply-list">
          {data.replies.map((r, index) => (
            <div key={r.id} className={`echo-reply-card ${r.status === 'accepted' ? 'accepted' : ''}`}>
              <div className="echo-reply-head">
                <span>
                  回音 #{index + 1}
                  {r.isMine && ` · ${LABELS.ECHO_REPLIED_BY_ME}`}
                </span>
                <span>
                  <span className={`badge reply-${r.status}`}>
                    {ECHO_REPLY_STATUS_TEXT[r.status]}
                  </span>{' '}
                  {formatTime(r.createdAt)}
                </span>
              </div>
              <div className="echo-content">{r.content}</div>
              {data.isOwner && isOpen && (
                <div>
                  <button
                    className="icon-btn"
                    onClick={() => accept(r.id)}
                    disabled={acceptingId !== null}
                  >
                    {acceptingId === r.id ? '采纳中…' : LABELS.ECHO_ACCEPT}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="echo-hint">
          {data.isOwner ? LABELS.ECHO_NO_REPLIES : LABELS.ECHO_PRIVATE_HINT}
        </div>
      )}

      {data.canReply && (
        <div className="reply-box">
          <textarea
            className="reply-text"
            placeholder={LABELS.ECHO_REPLY_PLACEHOLDER}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            maxLength={2000}
          />
          <div className="reply-footer">
            <div className="error-text" style={{ margin: 'auto 0' }}>{error}</div>
            <button
              className="big-btn"
              onClick={submitReply}
              disabled={submitting || !reply.trim()}
            >
              {submitting ? '寄出中…' : LABELS.ECHO_SUBMIT_REPLY}
            </button>
          </div>
        </div>
      )}
      {!data.canReply && !data.isOwner && data.hasReplied && isOpen && (
        <div className="echo-hint">{LABELS.ECHO_ALREADY_REPLIED}</div>
      )}
      {!isOpen && <div className="echo-hint">{LABELS.ECHO_CLOSED_HINT}</div>}
      {error && !data.canReply && <div className="error-text">{error}</div>}
    </div>
  );
}
