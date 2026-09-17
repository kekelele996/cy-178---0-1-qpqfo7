// Global string constants and endpoints — single source of truth

export const PORTS = {
  FRONTEND: 8178,
  BACKEND: 9178,
  DATABASE: 10178
};

export const API_BASE = '';

export const ENDPOINTS = {
  REGISTER: `${API_BASE}/api/auth/register`,
  LOGIN: `${API_BASE}/api/auth/login`,
  ME: `${API_BASE}/api/auth/me`,
  SEND_LETTER: `${API_BASE}/api/letters`,
  REPLY_LETTER: (id) => `${API_BASE}/api/letters/${id}/reply`,
  SKIP_LETTER: (id) => `${API_BASE}/api/letters/${id}/skip`,
  FAVORITE_LETTER: (id) => `${API_BASE}/api/letters/${id}/favorite`,
  THREAD: (id) => `${API_BASE}/api/letters/${id}/thread`,
  INBOX: `${API_BASE}/api/inbox`,
  ECHO_LIST: `${API_BASE}/api/echo`,
  ECHO_DETAIL: (id) => `${API_BASE}/api/echo/${id}`,
  ECHO_REPLY: (id) => `${API_BASE}/api/echo/${id}/replies`,
  ECHO_ACCEPT: (id, replyId) => `${API_BASE}/api/echo/${id}/accept/${replyId}`
};

export const STORAGE_KEYS = {
  TOKEN: 'lp_token',
  PEN_NAME: 'lp_pen_name'
};

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  HOME: '/',
  COMPOSE: '/compose',
  INBOX: '/inbox',
  THREAD: '/thread/:id',
  ECHO: '/echo',
  ECHO_NEW: '/echo/new',
  ECHO_DETAIL: '/echo/:id'
};

export const LABELS = {
  APP_TITLE: '信件驿站',
  APP_SUBTITLE: '写给陌生人的一封信',
  LOGIN_HINT: '用你的笔名继续未读完的信',
  REGISTER_HINT: '起一个笔名，匿名穿梭于驿站',
  PEN_NAME: '笔名',
  PASSWORD: '密码',
  LOGIN: '登录',
  REGISTER: '注册',
  SWITCH_TO_LOGIN: '已有笔名？去登录',
  SWITCH_TO_REGISTER: '没有笔名？去注册',
  LOGOUT: '退出',
  COMPOSE: '投一封信',
  MY_INBOX: '我的信箱',
  SENT: '发出的',
  RECEIVED: '收到的',
  CONVERSATIONS: '对话中',
  FAVORITE: '收藏',
  UNFAVORITE: '取消收藏',
  REPLY: '回复',
  SKIP: '跳过',
  SEND: '投入驿站',
  CONTENT_PLACEHOLDER: '写下此刻想对陌生人说的话……',
  EMPTY_SENT: '还没有寄出的信',
  EMPTY_RECEIVED: '信箱空空，等一封信',
  EMPTY_CONVERSATIONS: '没有在持续的对话',
  BACK: '返回',
  REPLY_PLACEHOLDER: '回信给这位陌生人……',
  SUBMIT_REPLY: '寄出回复',
  SENT_FROM_ME: '我寄出',
  SENT_FROM_STRANGER: '陌生人',
  ECHO_WALL: '回音墙',
  ECHO_COMPOSE: '发布求助',
  ECHO_WALL_HINT: '把难题匿名贴上墙，等陌生人的回音。回音彼此不可见，发起人最多采纳一条。',
  ECHO_COMPOSE_HINT: '每个笔名最多回应一次，回音之间互相不可见；你只能采纳一条，采纳或到期后求助自动关闭。',
  ECHO_CONTENT_PLACEHOLDER: '写下你想求助的事……',
  ECHO_DEADLINE: '回复截止时间',
  ECHO_SUBMIT: '贴上回音墙',
  ECHO_EMPTY: '墙上还没有求助，来贴第一张吧',
  ECHO_REPLY_PLACEHOLDER: '写下你的回音，只有发起人能看到……',
  ECHO_SUBMIT_REPLY: '寄出回音',
  ECHO_ACCEPT: '采纳这条回音',
  ECHO_REPLIES_TITLE: '回音',
  ECHO_PRIVATE_HINT: '回音内容仅发起人和回音者本人可见',
  ECHO_CLOSED_HINT: '这封求助已关闭，不再接收新的回音',
  ECHO_ALREADY_REPLIED: '你已回应过这封求助，等待发起人查阅',
  ECHO_NO_REPLIES: '还没有回音，再等等吧',
  ECHO_MINE: '我发起的',
  ECHO_REPLIED_BY_ME: '我已回应',
  ECHO_REPLY_COUNT: '条回音',
  ECHO_DEADLINE_PREFIX: '截止',
  ECHO_CLOSED_AT_PREFIX: '关闭于',
  ECHO_ANONYMOUS: '匿名求助'
};

export const STATUS_TEXT = {
  pending: '待处理',
  delivered: '已送达',
  skipped: '已跳过',
  replied: '已回复'
};

export const ECHO_STATUS_TEXT = {
  open: '开放中',
  closed: '已关闭'
};

export const ECHO_REPLY_STATUS_TEXT = {
  pending: '待采纳',
  accepted: '已采纳',
  closed: '已关闭'
};
