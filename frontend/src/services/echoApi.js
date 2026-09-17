import { api } from './http.js';
import { ENDPOINTS } from '../config/constants.js';

export const EchoApi = {
  create({ content, deadlineAt }) {
    return api.request(ENDPOINTS.ECHO_LIST, {
      method: 'POST',
      body: JSON.stringify({ content, deadlineAt })
    });
  },
  wall() {
    return api.request(ENDPOINTS.ECHO_LIST);
  },
  detail(id) {
    return api.request(ENDPOINTS.ECHO_DETAIL(id));
  },
  reply({ id, content }) {
    return api.request(ENDPOINTS.ECHO_REPLY(id), {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  },
  accept({ id, replyId }) {
    return api.request(ENDPOINTS.ECHO_ACCEPT(id, replyId), { method: 'POST' });
  }
};
