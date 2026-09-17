import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ECHO_STATE_TEXT, LABELS, ROUTES } from '../config/constants.js';
import { EchoWallApi } from '../services/echoWallApi.js';
import { formatDateTime } from '../utils/time.js';

function ReplyCard({ reply, isAuthor, open, onAdopt, adoptingId }) {
  return (
    <article className={`echo-reply ${reply.adopted ? 'adopted' : ''}`}>
      <div className="echo-reply-head">
        <span>
          {reply.isMine ? '我的回音' : '匿名回音'}
          {reply.adopted && (
            <span className="echo-badge closed adopted-tag">{LABELS.ECHO_ADOPTED}</span>
          )}
        </span>
        <span>{formatDateTime(reply.updatedAt || reply.createdAt)}</span>
      </div>
      <p className="echo-reply-content">{reply.content}</p>
      {isAuthor && open && (
        <button
          className="secondary-btn"
          disabled={adoptingId === reply.id}
          onClick={() => onAdopt(reply.id)}
        >
          {adoptingId === reply.id ? '采纳中…' : LABELS.ECHO_ADOPT}
        </button>
      )}
    </article>
  );
}

export default function EchoRequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adoptingId, setAdoptingId] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const result = await EchoWallApi.get(id);
      setData(result.request);
      const myReply = result.request.replies.find((reply) => reply.isMine);
      setReplyContent(myReply ? myReply.content : '');
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const submitReply = async () => {
    setError('');
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      const existing = data.replies.find((reply) => reply.isMine);
      if (existing) {
        await EchoWallApi.updateReply({ id: existing.id, content: replyContent.trim() });
      } else {
        await EchoWallApi.reply({ id, content: replyContent.trim() });
      }
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const adopt = async (replyId) => {
    setError('');
    if (!window.confirm('采纳后其余回音会立即关闭，确定采纳这一条吗？')) return;
    setAdoptingId(replyId);
    try {
      await EchoWallApi.adopt(replyId);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setAdoptingId(null);
    }
  };

  if (loading) return <div className="loading">加载求助信…</div>;
  if (!data) {
    return (
      <div className="empty-state">
        <div>{error || '无法加载求助信'}</div>
        <button className="secondary-btn" onClick={() => navigate(ROUTES.ECHO_WALL)}>
          {LABELS.BACK}
        </button>
      </div>
    );
  }

  const myReply = data.replies.find((reply) => reply.isMine);
  const showReplyForm = !data.isAuthor && data.open && (!myReply || isEditing);
  const closedHint = !data.open
    ? data.closedReason === 'accepted'
      ? '发起人已采纳一条回音，其余回复已关闭。'
      : '回复时间已截止，回音已自动关闭。'
    : '';

  return (
    <div className="echo-detail">
      <button className="secondary-btn" onClick={() => navigate(ROUTES.ECHO_WALL)}>
        {LABELS.BACK}
      </button>

      <section className="echo-request-panel">
        <div className="echo-detail-head">
          <span className={`echo-badge ${data.open ? 'open' : 'closed'}`}>
            {data.open ? LABELS.ECHO_OPEN : LABELS.ECHO_CLOSED}
          </span>
          <span>{ECHO_STATE_TEXT[data.state]}</span>
          <span>截止 {formatDateTime(data.deadlineAt)}</span>
          <span>{LABELS.ECHO_REPLY_COUNT(data.replyCount)}</span>
        </div>
        <h2>匿名求助</h2>
        <p className="echo-request-content">{data.content || LABELS.ECHO_NON_PARTICIPANT_HINT}</p>
        {data.isAuthor && <p className="echo-form-hint">{LABELS.ECHO_CANNOT_REPLY_OWN}</p>}
        {closedHint && <p className="echo-form-hint">{closedHint}</p>}
      </section>

      <section className="echo-reply-list">
        {data.replies.length === 0 ? (
          <div className="empty-state">{LABELS.ECHO_NO_REPLY}</div>
        ) : (
          data.replies.map((reply) => (
            <ReplyCard
              key={reply.id}
              reply={reply}
              isAuthor={data.isAuthor}
              open={data.open}
              onAdopt={adopt}
              adoptingId={adoptingId}
            />
          ))
        )}
      </section>

      {showReplyForm && (
        <div className="echo-reply-editor">
          <h3>{myReply ? LABELS.ECHO_SAVE_REPLY : LABELS.ECHO_SEND_REPLY}</h3>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="匿名写下你的回音，其他回复者看不到它。"
            maxLength={2000}
          />
          <div className="reply-footer">
            <span className="echo-form-hint">
              {myReply ? LABELS.ECHO_ALREADY_REPLIED : LABELS.ECHO_DEADLINE_HINT}
            </span>
            <button
              className="big-btn"
              onClick={submitReply}
              disabled={submitting || !replyContent.trim()}
            >
              {submitting ? '提交中…' : myReply ? LABELS.ECHO_SAVE_REPLY : LABELS.ECHO_SUBMIT_REPLY}
            </button>
          </div>
        </div>
      )}

      {!data.isAuthor && myReply && !isEditing && data.open && (
        <div className="echo-own-reply-actions">
          <button className="secondary-btn" onClick={() => setIsEditing(true)}>
            修改我的回音
          </button>
          <span className="echo-form-hint">{LABELS.ECHO_ALREADY_REPLIED}</span>
        </div>
      )}

      {!data.open && myReply && <p className="echo-form-hint">{LABELS.ECHO_CLOSED_HINT}</p>}
      {error && <div className="error-text">{error}</div>}
    </div>
  );
}
