const EchoWallModel = require('../models/echoWallModel');
const { ECHO_STATUS, ECHO_CLOSED_REASON, MESSAGES } = require('../config/constants');

function createError(message, code) {
  const err = new Error(message);
  err.code = code;
  return err;
}

function isClosed(request, now = Date.now()) {
  return (
    request.status !== ECHO_STATUS.OPEN ||
    request.deadline_at <= now
  );
}

function requestState(request, now = Date.now()) {
  const expired =
    request.status === ECHO_STATUS.OPEN && request.deadline_at <= now;
  const status = expired ? ECHO_STATUS.EXPIRED : request.status;
  return {
    open: status === ECHO_STATUS.OPEN,
    displayStatus: status === ECHO_STATUS.OPEN ? 'open' : 'closed',
    status,
    closedReason:
      status === ECHO_STATUS.ACCEPTED
        ? ECHO_CLOSED_REASON.ACCEPTED
        : status === ECHO_STATUS.EXPIRED
          ? ECHO_CLOSED_REASON.EXPIRED
          : null
  };
}

function formatRequest(request, userId, options = {}) {
  const state = requestState(request);
  const isAuthor = request.author_id === userId;
  const includeContent = state.open || isAuthor || request.my_reply_id != null;

  return {
    id: request.id,
    content: includeContent ? request.content : null,
    createdAt: request.created_at,
    deadlineAt: request.deadline_at,
    status: state.displayStatus,
    state: state.status,
    closedReason: state.closedReason,
    open: state.open,
    replyCount: request.reply_count || 0,
    isAuthor,
    canReply: !isAuthor && state.open && request.my_reply_id == null,
    canAdopt: isAuthor && state.open,
    myReplyId: request.my_reply_id == null ? null : request.my_reply_id,
    selectedReplyId:
      options.includeSelected === false && !isAuthor
        ? null
        : request.selected_reply_id || null
  };
}

const EchoWallService = {
  createRequest({ userId, content, deadlineAt }) {
    const now = Date.now();
    if (!deadlineAt) {
      throw createError(MESSAGES.ECHO_DEADLINE_REQUIRED, 'VALIDATION');
    }
    const parsedDeadline = Number(deadlineAt);
    if (!Number.isFinite(parsedDeadline) || parsedDeadline <= now) {
      throw createError(MESSAGES.ECHO_DEADLINE_PAST, 'VALIDATION');
    }

    const id = EchoWallModel.createRequest({
      authorId: userId,
      content,
      deadlineAt: parsedDeadline,
      createdAt: now
    });
    const request = EchoWallModel.findRequestById(id);
    return formatRequest(request, userId);
  },

  listRequests(userId) {
    const now = Date.now();
    EchoWallModel.closeExpired(now);
    return EchoWallModel.listRequestsForUser(userId).map((request) =>
      formatRequest(request, userId, { includeSelected: false })
    );
  },

  getRequest({ userId, requestId }) {
    EchoWallModel.closeExpired(Date.now());
    const request = EchoWallModel.findRequestById(requestId);
    if (!request) {
      throw createError(MESSAGES.ECHO_NOT_FOUND, 'NOT_FOUND');
    }

    const myReply = EchoWallModel.findReplyByRequestAndAuthor({
      requestId,
      authorId: userId
    });
    const state = requestState(request);
    const isAuthor = request.author_id === userId;
    if (!isAuthor && !myReply && !state.open) {
      throw createError(MESSAGES.NOT_YOUR_ECHO_REPLY, 'FORBIDDEN');
    }

    const replyCount = EchoWallModel.listRepliesForRequest(requestId).length;
    const withAccess = {
      ...request,
      reply_count: replyCount,
      my_reply_id: myReply ? myReply.id : null
    };
    const formatted = formatRequest(withAccess, userId, {
      includeSelected: isAuthor
    });
    const replies = [];

    if (isAuthor) {
      replies.push(
        ...EchoWallModel.listRepliesForRequest(requestId).map((reply) => ({
          id: reply.id,
          content: reply.content,
          createdAt: reply.created_at,
          updatedAt: reply.updated_at,
          isMine: false,
          canEdit: false,
          adopted: request.selected_reply_id === reply.id
        }))
      );
    } else if (myReply) {
      replies.push({
        id: myReply.id,
        content: myReply.content,
        createdAt: myReply.created_at,
        updatedAt: myReply.updated_at,
        isMine: true,
        canEdit: formatted.open,
        adopted: request.selected_reply_id === myReply.id
      });
    }

    return {
      ...formatted,
      replies
    };
  },

  createReply({ userId, requestId, content }) {
    const now = Date.now();
    EchoWallModel.closeExpired(now);
    const request = EchoWallModel.findRequestById(requestId);
    if (!request) {
      throw createError(MESSAGES.ECHO_NOT_FOUND, 'NOT_FOUND');
    }
    if (request.author_id === userId) {
      throw createError(MESSAGES.CANNOT_REPLY_OWN_ECHO, 'FORBIDDEN');
    }
    if (isClosed(request, now)) {
      throw createError(MESSAGES.ECHO_CLOSED, 'CLOSED');
    }

    const existing = EchoWallModel.findReplyByRequestAndAuthor({
      requestId,
      authorId: userId
    });
    if (existing) {
      throw createError(MESSAGES.ECHO_ALREADY_REPLIED, 'CONFLICT');
    }

    try {
      const id = EchoWallModel.createReply({
        requestId,
        authorId: userId,
        content,
        createdAt: now
      });
      return EchoWallModel.findReplyById(id);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw createError(MESSAGES.ECHO_ALREADY_REPLIED, 'CONFLICT');
      }
      throw err;
    }
  },

  updateReply({ userId, replyId, content }) {
    const now = Date.now();
    const reply = EchoWallModel.findReplyById(replyId);
    if (!reply) {
      throw createError(MESSAGES.ECHO_REPLY_NOT_FOUND, 'NOT_FOUND');
    }
    if (reply.author_id !== userId) {
      throw createError(MESSAGES.NOT_YOUR_ECHO_REPLY, 'FORBIDDEN');
    }

    EchoWallModel.closeExpired(now);
    const request = EchoWallModel.findRequestById(reply.help_request_id);
    if (!request) {
      throw createError(MESSAGES.ECHO_NOT_FOUND, 'NOT_FOUND');
    }
    if (isClosed(request, now)) {
      throw createError(MESSAGES.ECHO_REPLY_CANNOT_EDIT, 'CLOSED');
    }

    EchoWallModel.updateReplyContent({ replyId, content, updatedAt: now });
    return EchoWallModel.findReplyById(replyId);
  },

  adoptReply({ userId, replyId }) {
    const now = Date.now();
    const reply = EchoWallModel.findReplyById(replyId);
    if (!reply) {
      throw createError(MESSAGES.ECHO_REPLY_NOT_FOUND, 'NOT_FOUND');
    }

    EchoWallModel.closeExpired(now);
    const request = EchoWallModel.findRequestById(reply.help_request_id);
    if (!request) {
      throw createError(MESSAGES.ECHO_NOT_FOUND, 'NOT_FOUND');
    }
    if (request.author_id !== userId) {
      throw createError(MESSAGES.NOT_YOUR_ECHO_REPLY, 'FORBIDDEN');
    }
    if (reply.author_id === userId) {
      throw createError(MESSAGES.NOT_YOUR_ECHO_REPLY, 'FORBIDDEN');
    }
    if (isClosed(request, now)) {
      throw createError(MESSAGES.ECHO_CLOSED, 'CLOSED');
    }

    const adopted = EchoWallModel.adoptReply({
      requestId: request.id,
      replyId,
      authorId: userId,
      now
    });
    if (!adopted) {
      throw createError(MESSAGES.ECHO_CLOSED, 'CONFLICT');
    }
    return true;
  }
};

module.exports = EchoWallService;
