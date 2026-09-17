// Global constants configuration — keep all string literals in one place
module.exports = {
  PORTS: {
    FRONTEND: Number(process.env.FRONTEND_PORT) || 8178,
    BACKEND: Number(process.env.PORT || process.env.BACKEND_PORT) || 9178,
    DATABASE: Number(process.env.DB_PORT) || 10178
  },

  DB: {
    FILE: process.env.SQLITE_PATH || 'data/letter_pigeon.db'
  },

  JWT: {
    SECRET: process.env.JWT_SECRET || 'letter-pigeon-dev-secret-change-me',
    EXPIRY: '7d'
  },

  ROUTES: {
    AUTH: '/api/auth',
    LETTERS: '/api/letters',
    INBOX: '/api/inbox',
    ECHO: '/api/echo'
  },

  LETTER_STATUS: {
    PENDING: 'pending',
    DELIVERED: 'delivered',
    SKIPPED: 'skipped',
    REPLIED: 'replied'
  },

  ROLES: {
    SENDER: 'sender',
    RECEIVER: 'receiver'
  },

  CATEGORIES: {
    SENT: 'sent',
    RECEIVED: 'received',
    CONVERSATIONS: 'conversations'
  },

  ECHO_STATUS: {
    OPEN: 'open',
    CLOSED: 'closed'
  },

  ECHO_REPLY_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    CLOSED: 'closed'
  },

  ECHO_LIMITS: {
    MAX_CONTENT: 2000,
    MIN_LEAD_MS: 60 * 1000,
    MAX_LEAD_MS: 30 * 24 * 60 * 60 * 1000
  },

  MESSAGES: {
    USERNAME_TAKEN: '该笔名已被占用',
    REGISTER_OK: '注册成功',
    LOGIN_FAIL: '笔名或密码错误',
    UNAUTHORIZED: '请先登录',
    NO_OTHER_USERS: '驿站暂时还没有其他旅人，再等等吧',
    LETTER_NOT_FOUND: '信件不存在',
    NOT_YOUR_LETTER: '这不是你的信件',
    LETTER_SENT: '信件已投入驿站',
    FAVORITED: '已收藏',
    UNFAVORITED: '已取消收藏',
    SKIPPED: '已跳过这封信',
    REPLIED: '回复已送达',
    ECHO_NOT_FOUND: '求助不存在',
    ECHO_CLOSED: '这封求助已经关闭了',
    ECHO_OWN_REQUEST: '不能回应自己的求助',
    ECHO_DUPLICATE: '每个笔名对同一求助只能回应一次',
    ECHO_REPLY_NOT_FOUND: '回音不存在',
    NOT_YOUR_ECHO: '这不是你的求助',
    ECHO_ACCEPT_CONFLICT: '这封求助已经采纳过回音了',
    ECHO_DEADLINE_INVALID: '截止时间需在未来 1 分钟到 30 天之间',
    ECHO_CONTENT_TOO_LONG: '内容太长了，2000 字以内',
    ECHO_SENT: '求助已贴上回音墙',
    ECHO_REPLIED: '回音已送达',
    ECHO_ACCEPTED: '已采纳这条回音，其余回音已关闭'
  }
};
