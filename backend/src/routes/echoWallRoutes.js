const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const EchoWallService = require('../services/echoWallService');
const { MESSAGES } = require('../config/constants');

const router = Router();
router.use(requireAuth);

function errorStatus(err) {
  if (err.code === 'NOT_FOUND') return 404;
  if (err.code === 'FORBIDDEN') return 403;
  if (err.code === 'VALIDATION') return 400;
  if (err.code === 'CONFLICT' || err.code === 'CLOSED') return 409;
  return 500;
}

router.post('/requests', (req, res) => {
  try {
    const { content, deadlineAt } = req.body || {};
    if (!content || !content.trim()) {
      return res.status(400).json({ error: '求助内容不能为空' });
    }
    const request = EchoWallService.createRequest({
      userId: req.user.id,
      content: content.trim(),
      deadlineAt
    });
    res.status(201).json({ message: MESSAGES.ECHO_CREATED, request });
  } catch (err) {
    res.status(errorStatus(err)).json({ error: err.message });
  }
});

router.get('/requests', (req, res) => {
  try {
    res.json({ requests: EchoWallService.listRequests(req.user.id) });
  } catch (err) {
    res.status(errorStatus(err)).json({ error: err.message });
  }
});

router.get('/requests/:id', (req, res) => {
  try {
    const request = EchoWallService.getRequest({
      userId: req.user.id,
      requestId: Number(req.params.id)
    });
    res.json({ request });
  } catch (err) {
    res.status(errorStatus(err)).json({ error: err.message });
  }
});

router.post('/requests/:id/replies', (req, res) => {
  try {
    const { content } = req.body || {};
    if (!content || !content.trim()) {
      return res.status(400).json({ error: '回音内容不能为空' });
    }
    const reply = EchoWallService.createReply({
      userId: req.user.id,
      requestId: Number(req.params.id),
      content: content.trim()
    });
    res.status(201).json({ message: MESSAGES.ECHO_REPLY_SAVED, id: reply.id });
  } catch (err) {
    res.status(errorStatus(err)).json({ error: err.message });
  }
});

router.patch('/replies/:id', (req, res) => {
  try {
    const { content } = req.body || {};
    if (!content || !content.trim()) {
      return res.status(400).json({ error: '回音内容不能为空' });
    }
    const reply = EchoWallService.updateReply({
      userId: req.user.id,
      replyId: Number(req.params.id),
      content: content.trim()
    });
    res.json({ message: MESSAGES.ECHO_REPLY_UPDATED, id: reply.id });
  } catch (err) {
    res.status(errorStatus(err)).json({ error: err.message });
  }
});

router.post('/replies/:id/adopt', (req, res) => {
  try {
    EchoWallService.adoptReply({
      userId: req.user.id,
      replyId: Number(req.params.id)
    });
    res.json({ message: MESSAGES.ECHO_REPLY_ACCEPTED });
  } catch (err) {
    res.status(errorStatus(err)).json({ error: err.message });
  }
});

module.exports = router;
