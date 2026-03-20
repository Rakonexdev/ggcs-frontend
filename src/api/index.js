import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Helper to read cookies
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

// Add auth token and CSRF token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ggcs_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const xsrfToken = getCookie('XSRF-TOKEN');
  if (xsrfToken) {
    config.headers['X-XSRF-TOKEN'] = xsrfToken;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ggcs_token');
      localStorage.removeItem('ggcs_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  csrfCookie: () => api.get('/sanctum/csrf-cookie', { baseURL: 'http://localhost:8000' }),
  login: async (data) => {
    await authApi.csrfCookie();
    return api.post('/login', data);
  },
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),
};

// Users
export const usersApi = {
  list: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  show: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  toggleStatus: (id) => api.patch(`/users/${id}/status`),
};

// Roles
export const rolesApi = {
  list: () => api.get('/roles'),
  permissions: () => api.get('/permissions'),
  updatePermissions: (id, data) => api.put(`/roles/${id}/permissions`, data),
  getMenus: () => api.get('/settings/menus'),
  updateMenus: (data) => api.put('/settings/menus', data),
};

// Companies
export const companiesApi = {
  list: (params) => api.get('/companies', { params }),
  create: (data) => api.post('/companies', data),
  show: (id) => api.get(`/companies/${id}`),
};

// Persons
export const personsApi = {
  list: (params) => api.get('/persons', { params }),
  create: (data) => api.post('/persons', data),
  show: (id) => api.get(`/persons/${id}`),
  update: (id, data) => api.put(`/persons/${id}`, data),
};

// Projects
export const projectsApi = {
  list: (params) => api.get('/projects', { params }),
  create: (data) => api.post('/projects', data),
  show: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.put(`/projects/${id}`, data),
  updateStatus: (id, data) => api.patch(`/projects/${id}/status`, data),
  addProfession: (id, data) => api.post(`/projects/${id}/professions`, data),
  updateProfession: (id, profId, data) => api.put(`/projects/${id}/professions/${profId}`, data),
  deleteProfession: (id, profId) => api.delete(`/projects/${id}/professions/${profId}`),
};

// Timesheets
export const timesheetsApi = {
  list: (params) => api.get('/timesheets', { params }),
  create: (data) => api.post('/timesheets', data),
  show: (id) => api.get(`/timesheets/${id}`),
  update: (id, data) => api.put(`/timesheets/${id}`, data),
  delete: (id) => api.delete(`/timesheets/${id}`),
};

// Invoices
export const invoicesApi = {
  list: (params) => api.get('/invoices', { params }),
  create: (data) => api.post('/invoices', data),
  show: (id) => api.get(`/invoices/${id}`),
};

// Collections
export const collectionsApi = {
  list: (params) => api.get('/collections', { params }),
  create: (data) => api.post('/collections', data),
  show: (id) => api.get(`/collections/${id}`),
  verify: (id) => api.patch(`/collections/${id}/verify`),
};

// Expense Categories
export const expenseCategoriesApi = {
  list: () => api.get('/expense-categories'),
  create: (data) => api.post('/expense-categories', data),
  update: (id, data) => api.put(`/expense-categories/${id}`, data),
};

// Expenses
export const expensesApi = {
  list: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  show: (id) => api.get(`/expenses/${id}`),
};

// Reports
export const reportsApi = {
  dashboardStats: () => api.get('/reports/dashboard-stats'),
  outstandingInvoices: (params) => api.get('/reports/outstanding-invoices', { params }),
  collectionsSummary: (params) => api.get('/reports/collections-summary', { params }),
  collectionsFeed: (params) => api.get('/reports/collections-feed', { params }),
  expensesByCategory: (params) => api.get('/reports/expenses-by-category', { params }),
  auditLogs: (params) => api.get('/audit-logs', { params }),
};

// Uploads
export const uploadsApi = {
  idPhoto: (file) => {
    const fd = new FormData(); fd.append('file', file);
    return api.post('/uploads/id-photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  lpo: (file) => {
    const fd = new FormData(); fd.append('file', file);
    return api.post('/uploads/lpo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  invoiceCopy: (file) => {
    const fd = new FormData(); fd.append('file', file);
    return api.post('/uploads/invoice-copy', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  expenseDocument: (file) => {
    const fd = new FormData(); fd.append('file', file);
    return api.post('/uploads/expense-document', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export default api;
