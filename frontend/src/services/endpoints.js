// Imports the configured Axios client.
import api from './api';

// Groups authentication API calls.
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  register: (data) => api.post('/auth/register', data),
  changePassword: (data) => api.put('/auth/change-password', data)
};

// Groups fruit catalogue API calls.
export const fruitsAPI = {
  list: (params) => api.get('/fruits', { params }),
  get: (id) => api.get(`/fruits/${id}`),
  create: (data) => api.post('/fruits', data),
  update: (id, data) => api.put(`/fruits/${id}`, data),
  remove: (id) => api.delete(`/fruits/${id}`)
};

// Groups box-size API calls.
export const boxSizesAPI = {
  list: () => api.get('/box-sizes'),
  create: (data) => api.post('/box-sizes', data),
  update: (id, data) => api.put(`/box-sizes/${id}`, data),
  remove: (id) => api.delete(`/box-sizes/${id}`)
};

// Groups supplier API calls.
export const suppliersAPI = {
  list: (params) => api.get('/suppliers', { params }),
  get: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  remove: (id) => api.delete(`/suppliers/${id}`)
};

// Groups street-vendor API calls.
export const vendorsAPI = {
  list: (params) => api.get('/vendors', { params }),
  get: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  remove: (id) => api.delete(`/vendors/${id}`)
};

// Groups stock and purchase API calls.
export const stockAPI = {
  list: (params) => api.get('/stock', { params }),
  purchases: () => api.get('/stock/purchases'),
  addStock: (data) => api.post('/stock', data),
  updateProduct: (id, data) => api.put(`/stock/${id}`, data)
};

// Groups order and order-status API calls.
export const ordersAPI = {
  list: (params) => api.get('/orders', { params }),
<<<<<<< HEAD
  fruitQuantities: () => api.get('/orders/fruit-quantities'),
=======
>>>>>>> 9eb0d96ef5a0b1fe3d8fd7867d536603b82fa08d
  get: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  remove: (id) => api.delete(`/orders/${id}`)
};

// Groups administrator report API calls.
export const reportsAPI = {
  dashboard: () => api.get('/reports/dashboard'),
  salesByBoxSize: () => api.get('/reports/sales-by-box-size'),
  salesByVendor: () => api.get('/reports/sales-by-vendor'),
  purchasesByProvince: () => api.get('/reports/purchases-by-province'),
  pendingOrders: () => api.get('/reports/pending-orders'),
  completedOrders: () => api.get('/reports/completed-orders'),
  totalSalesByDate: () => api.get('/reports/total-sales-by-date'),
  topSellingFruits: () => api.get('/reports/top-selling-fruits')
};