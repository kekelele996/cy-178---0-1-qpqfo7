const db = require('../data/database');

const EchoWallModel = {
  createRequest({ authorId, content, deadlineAt, createdAt }) {
    const info = db
      .prepare(
        `INSERT INTO help_requests (author_id, content, deadline_at, status, created_at)
         VALUES (?, ?, ?, 'open', ?)`
      )
      .run(authorId, content, deadlineAt, createdAt);
    return info.lastInsertRowid;
  },

  findRequestById(id) {
    return db.prepare('SELECT * FROM help_requests WHERE id = ?').get(id);
  },

  listRequestsForUser(userId) {
    return db
      .prepare(
        `SELECT h.*,
                (SELECT COUNT(*) FROM help_replies r
                 WHERE r.help_request_id = h.id) AS reply_count,
                (SELECT r.id FROM help_replies r
                 WHERE r.help_request_id = h.id AND r.author_id = ?) AS my_reply_id
         FROM help_requests h
         ORDER BY CASE h.status WHEN 'open' THEN 0 ELSE 1 END,
                  h.created_at DESC`
      )
      .all(userId);
  },

  closeExpired(now) {
    return db
      .prepare(
        `UPDATE help_requests
         SET status = 'expired'
         WHERE status = 'open' AND deadline_at <= ?`
      )
      .run(now);
  },

  adoptReply({ requestId, replyId, authorId, now }) {
    const run = db.transaction(() => {
      const result = db
        .prepare(
          `UPDATE help_requests
           SET status = 'accepted', selected_reply_id = ?
           WHERE id = ?
             AND author_id = ?
             AND status = 'open'
             AND deadline_at > ?
             AND EXISTS (
               SELECT 1 FROM help_replies r
               WHERE r.id = ?
                 AND r.help_request_id = help_requests.id
                 AND r.author_id != help_requests.author_id
             )`
        )
        .run(replyId, requestId, authorId, now, replyId);
      return result.changes > 0;
    });
    return run();
  },

  createReply({ requestId, authorId, content, createdAt }) {
    const info = db
      .prepare(
        `INSERT INTO help_replies (help_request_id, author_id, content, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(requestId, authorId, content, createdAt, createdAt);
    return info.lastInsertRowid;
  },

  findReplyById(id) {
    return db.prepare('SELECT * FROM help_replies WHERE id = ?').get(id);
  },

  findReplyByRequestAndAuthor({ requestId, authorId }) {
    return db
      .prepare(
        'SELECT * FROM help_replies WHERE help_request_id = ? AND author_id = ?'
      )
      .get(requestId, authorId);
  },

  listRepliesForRequest(requestId) {
    return db
      .prepare(
        `SELECT * FROM help_replies
         WHERE help_request_id = ?
         ORDER BY created_at ASC`
      )
      .all(requestId);
  },

  updateReplyContent({ replyId, content, updatedAt }) {
    return db
      .prepare(
        'UPDATE help_replies SET content = ?, updated_at = ? WHERE id = ?'
      )
      .run(content, updatedAt, replyId);
  }
};

module.exports = EchoWallModel;
