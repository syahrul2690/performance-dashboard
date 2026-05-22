import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

let refreshing: Promise<void> | null = null;
const queue: Array<() => void> = [];

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!refreshing) {
        refreshing = api
          .post('/auth/refresh')
          .then(() => { queue.forEach((r) => r()); queue.length = 0; })
          .catch(() => {
            queue.forEach((r) => r());
            queue.length = 0;
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          })
          .finally(() => { refreshing = null; });
      }
      await new Promise<void>((res) => queue.push(res));
      return api(original);
    }
    return Promise.reject(err);
  },
);

export const auth = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const meta = {
  period: () => api.get('/meta/period').then((r) => r.data),
  periods: () => api.get('/meta/periods').then((r) => r.data),
  roleVariants: () => api.get('/meta/role-variants').then((r) => r.data),
};

export const executive = {
  summary: (periodId?: string) =>
    api.get('/executive/summary', { params: { periodId } }).then((r) => r.data),
};

export const financial = {
  get: (periodId?: string) =>
    api.get('/financial', { params: { periodId } }).then((r) => r.data),
};

export const operational = {
  get: (periodId?: string) =>
    api.get('/operational', { params: { periodId } }).then((r) => r.data),
};

export const strategic = {
  get: (periodId?: string) =>
    api.get('/strategic', { params: { periodId } }).then((r) => r.data),
};

export const humanCapital = {
  get: (periodId?: string) =>
    api.get('/human-capital', { params: { periodId } }).then((r) => r.data),
};

export const risk = {
  get: (periodId?: string) =>
    api.get('/risk', { params: { periodId } }).then((r) => r.data),
};

export const prosesBisnis = {
  get: (periodId?: string) =>
    api.get('/proses-bisnis', { params: { periodId } }).then((r) => r.data),
};

export const organisasi = {
  get: (periodId?: string) =>
    api.get('/organisasi', { params: { periodId } }).then((r) => r.data),
};

export const gcgEsg = {
  get: (periodId?: string) =>
    api.get('/gcg-esg', { params: { periodId } }).then((r) => r.data),
};

export const peta = {
  get: (periodId?: string) =>
    api.get('/peta', { params: { periodId } }).then((r) => r.data),
};

export const approvals = {
  reports: (periodId?: string) =>
    api.get('/approvals/reports', { params: { periodId } }).then((r) => r.data),
  advance: (id: string, note?: string) =>
    api.post(`/approvals/reports/${id}/advance`, { note }).then((r) => r.data),
  return: (id: string, note: string) =>
    api.post(`/approvals/reports/${id}/return`, { note }).then((r) => r.data),
};

export const workflowKm = {
  usulan: () => api.get('/workflow-km/usulan').then((r) => r.data),
  realisasi: () => api.get('/workflow-km/realisasi').then((r) => r.data),
  review: (docId: string, action: 'approve' | 'return', note?: string) =>
    api.post(`/workflow-km/${docId}/review`, { action, note }).then((r) => r.data),
};

export const inputRealisasi = {
  history: (unitCode?: string, periodId?: string) =>
    api.get('/input-realisasi/history', { params: { unitCode, periodId } }).then((r) => r.data),
  submit: (unitCode: string, values: Record<string, unknown>) =>
    api.put('/input-realisasi/submit', { unitCode, values }).then((r) => r.data),
};

export const notifications = {
  list: () => api.get('/notifications').then((r) => r.data),
  markRead: (id: string) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

export const audit = {
  logs: (page = 1, limit = 20) =>
    api.get('/audit', { params: { page, limit } }).then((r) => r.data),
};

export const kpi = {
  deepDive: (id: string) => api.get(`/kpi/deepdive/${id}`).then((r) => r.data),
};

export default api;
