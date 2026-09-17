const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const EchoService = require('../services/echoService');
const { ECHO_LIMITS, MESSAGES } = require('../config/constants');

const router = Router();
router.use(requireAuth);

function statusOf(err) {
  switch (err.code) {
    case 'NOT_FOUND':
      return 404;
    case 'FORBIDDEN':
      return 403;
    case 'VALIDATION':
      return 400;
    case 'CLOSED':
    case 'DUPLICATE':
    case 'CONFLICT':
      return 409;
    default:
      return 500;
  }
}

router.post('/', (req, res) => {
  try {
    const { content, deadlineAt } = req.body || {};
    if (!content || !content.trim()) {
      return res.status(400).json({ error: '求助内容不能为空' });
    }
    if (content.trim().length > ECHO_LIMITS.MAX_CONTENT) {
      return res.status(400).json({ error: MESSAGES.ECHO_CONTENT_TOO_LONG });
    }
    const request = EchoService.createRequest({
      ownerId: req.user.id,
      content: content.trim(),
      deadlineAt: Number(deadlineAt)
    });
    res.json({ message: MESSAGES.ECHO_SENT, id: request.id });
  } catch (err) {
    res.status(statusOf(err)).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  res.json({ items: EchoService.listWall(req.user.id) });
});

router.get('/:id', (req, res) => {
  try {
    const detail = EchoService.getDetail({
      userId: req.user.id,
      requestId: Number(req.params.id)
    });
    res.json(detail);
  } catch (err) {
    res.status(statusOf(err)).json({ error: err.message });
  }
});

router.post('/:id/replies', (req, res) => {
  try {
    const { content } = req.body || {};
    if (!content || !content.trim()) {
      return res.status(400).json({ error: '回音内容不能为空' });
    }
    if (content.trim().length > ECHO_LIMITS.MAX_CONTENT) {
      return res.status(400).json({ error: MESSAGES.ECHO_CONTENT_TOO_LONG });
    }
    const reply = EchoService.reply({
      userId: req.user.id,
      requestId: Number(req.params.id),
      content: content.trim()
    });
    res.json({ message: MESSAGES.ECHO_REPLIED, id: reply.id });
  } catch (err) {
    res.status(statusOf(err)).json({ error: err.message });
  }
});

router.post('/:id/accept/:replyId', (req, res) => {
  try {
    EchoService.accept({
      userId: req.user.id,
      requestId: Number(req.params.id),
      replyId: Number(req.params.replyId)
    });
    res.json({ message: MESSAGES.ECHO_ACCEPTED });
  } catch (err) {
    res.status(statusOf(err)).json({ error: err.message });
  }
});

module.exports = router;
