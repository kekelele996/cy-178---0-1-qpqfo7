const db = require('../data/database');

const EchoModel = {
  createRequest({ ownerId, content, deadlineAt, status, createdAt }) {
    const stmt = db.prepare(
      `INSERT INTO help_requests (owner_id, content, deadline_at, status, created_at)
       VALUES (?, ?, ?, ?, ?)`
    );
    const info = stmt.run(ownerId, content, deadlineAt, status, createdAt);
    return info.lastInsertRowid;
  },

  findRequestById(id) {
    return db.prepare('SELECT * FROM help_requests WHERE id = ?').get(id);
  },

  listRequests() {
    return db
      .prepare(
        `SELECT r.*,
          (SELECT COUNT(*) FROM help_replies hr WHERE hr.request_id = r.id) AS reply_count
         FROM help_requests r
         ORDER BY CASE WHEN r.status = 'open' THEN 0 ELSE 1 END, r.created_at DESC`
      )
      .all();
  },

  createReply({ requestId, replierId, content, status, createdAt }) {
    const stmt = db.prepare(
      `INSERT INTO help_replies (request_id, replier_id, content, status, created_at)
       VALUES (?, ?, ?, ?, ?)`
    );
    const info = stmt.run(requestId, replierId, content, status, createdAt);
    return info.lastInsertRowid;
  },

  findReplyById(id) {
    return db.prepare('SELECT * FROM help_replies WHERE id = ?').get(id);
  },

  findReplyByUser(requestId, replierId) {
    return db
      .prepare('SELECT * FROM help_replies WHERE request_id = ? AND replier_id = ?')
      .get(requestId, replierId);
  },

  listReplies(requestId) {
    return db
      .prepare('SELECT * FROM help_replies WHERE request_id = ? ORDER BY created_at ASC')
      .all(requestId);
  },

  countReplies(requestId) {
    const row = db
      .prepare('SELECT COUNT(*) AS c FROM help_replies WHERE request_id = ?')
      .get(requestId);
    return row.c;
  },

  listMyReplyRequestIds(userId) {
    return db
      .prepare('SELECT request_id FROM help_replies WHERE replier_id = ?')
      .all(userId)
      .map((r) => r.request_id);
  },

  // Lazily close requests whose deadline has passed, together with their
  // still-pending replies. Safe to call on every read/write path.
  closeExpired(now) {
    const tx = db.transaction(() => {
      db.prepare(
        `UPDATE help_requests SET status = 'closed', closed_at = ?
         WHERE status = 'open' AND deadline_at <= ?`
      ).run(now, now);
      db.prepare(
        `UPDATE help_replies SET status = 'closed'
         WHERE status = 'pending'
           AND request_id IN (SELECT id FROM help_requests WHERE status = 'closed')`
      ).run();
    });
    tx();
  },

  // Atomically accept one reply: the conditional UPDATE guarantees that only
  // one concurrent accept can win; the loser sees changes = 0.
  acceptReply({ requestId, replyId, now }) {
    const tx = db.transaction(() => {
      const result = db
        .prepare(
          `UPDATE help_requests
           SET status = 'closed', accepted_reply_id = ?, closed_at = ?
           WHERE id = ? AND status = 'open' AND deadline_at > ?`
        )
        .run(replyId, now, requestId, now);
      if (result.changes === 0) return false;
      db.prepare(`UPDATE help_replies SET status = 'accepted' WHERE id = ?`).run(replyId);
      db.prepare(
        `UPDATE help_replies SET status = 'closed'
         WHERE request_id = ? AND id != ? AND status = 'pending'`
      ).run(requestId, replyId);
      return true;
    });
    return tx();
  }
};

module.exports = EchoModel;
