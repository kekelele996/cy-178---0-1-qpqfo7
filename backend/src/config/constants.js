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
    ECHO_WALL: '/api/echo-wall'
  },

  LETTER_STATUS: {
    PENDING: 'pending',
    DELIVERED: 'delivered',
    SKIPPED: 'skipped',
    REPLIED: 'replied'
  },

  ECHO_STATUS: {
    OPEN: 'open',
    ACCEPTED: 'accepted',
    EXPIRED: 'expired'
  },

  ECHO_CLOSED_REASON: {
    ACCEPTED: 'accepted',
    EXPIRED: 'expired'
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
    ECHO_NOT_FOUND: '求助信不存在',
    ECHO_CLOSED: '这封求助信已关闭',
    ECHO_DEADLINE_REQUIRED: '请选择回复截止时间',
    ECHO_DEADLINE_PAST: '回复截止时间必须晚于当前时间',
    CANNOT_REPLY_OWN_ECHO: '不能回复自己的求助',
    ECHO_ALREADY_REPLIED: '你已经回复过这封求助信',
    NOT_YOUR_ECHO_REPLY: '这不是你的回音',
    ECHO_REPLY_NOT_FOUND: '回音不存在',
    ECHO_CREATED: '求助信已贴上回音墙',
    ECHO_REPLY_ACCEPTED: '已采纳这条回音',
    ECHO_REPLY_SAVED: '回音已提交',
    ECHO_REPLY_UPDATED: '回音已更新',
    ECHO_REPLY_CANNOT_EDIT: '关闭后的回音不能修改'
  }
};
