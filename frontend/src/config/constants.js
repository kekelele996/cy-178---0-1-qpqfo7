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
  ECHO_REQUESTS: `${API_BASE}/api/echo-wall/requests`,
  ECHO_REQUEST: (id) => `${API_BASE}/api/echo-wall/requests/${id}`,
  ECHO_REPLIES: (id) => `${API_BASE}/api/echo-wall/requests/${id}/replies`,
  ECHO_REPLY: (id) => `${API_BASE}/api/echo-wall/replies/${id}`,
  ECHO_ADOPT_REPLY: (id) => `${API_BASE}/api/echo-wall/replies/${id}/adopt`
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
  ECHO_WALL: '/echo-wall',
  ECHO_COMPOSE: '/echo-wall/new',
  ECHO_REQUEST: '/echo-wall/:id',
  THREAD: '/thread/:id'
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
  ECHO_WALL: '求助回音墙',
  ECHO_COMPOSE: '发布求助',
  ECHO_DEADLINE: '回复截止时间',
  ECHO_CONTENT_PLACEHOLDER: '写下你的困惑。回音彼此独立，只有你能看到全部答案。',
  ECHO_OPEN: '开放中',
  ECHO_CLOSED: '已关闭',
  ECHO_ACCEPTED: '已采纳',
  ECHO_EXPIRED: '已截止',
  ECHO_REPLY_COUNT: (count) => `${count} 条回音`,
  ECHO_NO_REPLY: '还没有回音',
  ECHO_VIEW: '查看回音墙',
  ECHO_SEND_REPLY: '写下回音',
  ECHO_SUBMIT_REPLY: '提交回音',
  ECHO_SAVE_REPLY: '保存修改',
  ECHO_ADOPT: '采纳',
  ECHO_ADOPTED: '已采纳',
  ECHO_CANNOT_REPLY_OWN: '这是你发起的求助，等待其他人的回音。',
  ECHO_ALREADY_REPLIED: '你已提交过一条回音，可在关闭前修改。',
  ECHO_CLOSED_HINT: '这封求助已经关闭，回音不能再修改。',
  ECHO_NON_PARTICIPANT_HINT: '回音只对发起人和回复者本人可见。',
  ECHO_EMPTY: '回音墙还没有求助信',
  ECHO_DEADLINE_HINT: '截止前，每位笔名最多回复一次；逾期会自动关闭。'
};

export const STATUS_TEXT = {
  pending: '待处理',
  delivered: '已送达',
  skipped: '已跳过',
  replied: '已回复'
};

export const ECHO_STATE_TEXT = {
  open: '开放中',
  accepted: '已采纳关闭',
  expired: '已截止关闭'
};
