import { api } from './http.js';
import { ENDPOINTS } from '../config/constants.js';

export const EchoWallApi = {
  list() {
    return api.request(ENDPOINTS.ECHO_REQUESTS);
  },

  create({ content, deadlineAt }) {
    return api.request(ENDPOINTS.ECHO_REQUESTS, {
      method: 'POST',
      body: JSON.stringify({ content, deadlineAt })
    });
  },

  get(id) {
    return api.request(ENDPOINTS.ECHO_REQUEST(id));
  },

  reply({ id, content }) {
    return api.request(ENDPOINTS.ECHO_REPLIES(id), {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  },

  updateReply({ id, content }) {
    return api.request(ENDPOINTS.ECHO_REPLY(id), {
      method: 'PATCH',
      body: JSON.stringify({ content })
    });
  },

  adopt(id) {
    return api.request(ENDPOINTS.ECHO_ADOPT_REPLY(id), { method: 'POST' });
  }
};
