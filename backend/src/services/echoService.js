const EchoModel = require('../models/echoModel');
const { ECHO_STATUS, ECHO_REPLY_STATUS, ECHO_LIMITS, MESSAGES } = require('../config/constants');

function fail(message, code) {
  const err = new Error(message);
  err.code = code;
  return err;
}

const EchoService = {
  createRequest({ ownerId, content, deadlineAt }) {
    const now = Date.now();
    if (
      !Number.isFinite(deadlineAt) ||
      deadlineAt < now + ECHO_LIMITS.MIN_LEAD_MS ||
      deadlineAt > now + ECHO_LIMITS.MAX_LEAD_MS
    ) {
      throw fail(MESSAGES.ECHO_DEADLINE_INVALID, 'VALIDATION');
    }
    const id = EchoModel.createRequest({
      ownerId,
      content,
      deadlineAt,
      status: ECHO_STATUS.OPEN,
      createdAt: now
    });
    return EchoModel.findRequestById(id);
  },

  listWall(userId) {
    EchoModel.closeExpired(Date.now());
    const replied = new Set(EchoModel.listMyReplyRequestIds(userId));
    return EchoModel.listRequests().map((r) => ({
      id: r.id,
      preview: r.content.slice(0, 80),
      status: r.status,
      replyCount: r.reply_count,
      deadlineAt: r.deadline_at,
      closedAt: r.closed_at,
      createdAt: r.created_at,
      isMine: r.owner_id === userId,
      hasReplied: replied.has(r.id)
    }));
  },

  getDetail({ userId, requestId }) {
    EchoModel.closeExpired(Date.now());
    const request = EchoModel.findRequestById(requestId);
    if (!request) {
      throw fail(MESSAGES.ECHO_NOT_FOUND, 'NOT_FOUND');
    }
    const isOwner = request.owner_id === userId;
    const myReply = EchoModel.findReplyByUser(requestId, userId);
    const decorate = (r) => ({
      id: r.id,
      content: r.content,
      status: r.status,
      createdAt: r.created_at,
      isMine: r.replier_id === userId
    });
    // Replies are only ever visible to the request owner and to their own
    // author — repliers never see each other's answers, open or closed.
    let replies = [];
    if (isOwner) {
      replies = EchoModel.listReplies(requestId).map(decorate);
    } else if (myReply) {
      replies = [decorate(myReply)];
    }
    const now = Date.now();
    return {
      id: request.id,
      content: request.content,
      status: request.status,
      replyCount: EchoModel.countReplies(requestId),
      deadlineAt: request.deadline_at,
      closedAt: request.closed_at,
      createdAt: request.created_at,
      isOwner,
      hasReplied: !!myReply,
      canReply:
        !isOwner &&
        request.status === ECHO_STATUS.OPEN &&
        !myReply &&
        request.deadline_at > now,
      replies
    };
  },

  reply({ userId, requestId, content }) {
    const now = Date.now();
    EchoModel.closeExpired(now);
    const request = EchoModel.findRequestById(requestId);
    if (!request) {
      throw fail(MESSAGES.ECHO_NOT_FOUND, 'NOT_FOUND');
    }
    if (request.owner_id === userId) {
      throw fail(MESSAGES.ECHO_OWN_REQUEST, 'FORBIDDEN');
    }
    if (request.status !== ECHO_STATUS.OPEN || request.deadline_at <= now) {
      throw fail(MESSAGES.ECHO_CLOSED, 'CLOSED');
    }
    if (EchoModel.findReplyByUser(requestId, userId)) {
      throw fail(MESSAGES.ECHO_DUPLICATE, 'DUPLICATE');
    }
    try {
      const id = EchoModel.createReply({
        requestId,
        replierId: userId,
        content,
        status: ECHO_REPLY_STATUS.PENDING,
        createdAt: now
      });
      return EchoModel.findReplyById(id);
    } catch (err) {
      if (String(err.code || '').startsWith('SQLITE_CONSTRAINT')) {
        throw fail(MESSAGES.ECHO_DUPLICATE, 'DUPLICATE');
      }
      throw err;
    }
  },

  accept({ userId, requestId, replyId }) {
    const now = Date.now();
    EchoModel.closeExpired(now);
    const request = EchoModel.findRequestById(requestId);
    if (!request) {
      throw fail(MESSAGES.ECHO_NOT_FOUND, 'NOT_FOUND');
    }
    if (request.owner_id !== userId) {
      throw fail(MESSAGES.NOT_YOUR_ECHO, 'FORBIDDEN');
    }
    const reply = EchoModel.findReplyById(replyId);
    if (!reply || reply.request_id !== requestId) {
      throw fail(MESSAGES.ECHO_REPLY_NOT_FOUND, 'NOT_FOUND');
    }
    if (request.status !== ECHO_STATUS.OPEN) {
      throw fail(
        request.accepted_reply_id ? MESSAGES.ECHO_ACCEPT_CONFLICT : MESSAGES.ECHO_CLOSED,
        'CONFLICT'
      );
    }
    const ok = EchoModel.acceptReply({ requestId, replyId, now });
    if (!ok) {
      throw fail(MESSAGES.ECHO_ACCEPT_CONFLICT, 'CONFLICT');
    }
    return true;
  }
};

module.exports = EchoService;
