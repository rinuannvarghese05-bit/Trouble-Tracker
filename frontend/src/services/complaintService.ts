import axios from 'axios';

const API_URL = 'http://localhost:5000/api/complaints';

// 1. Create an Axios instance to automatically attach the JWT token
const api = axios.create({
  baseURL: API_URL,
});

// 2. Add a request interceptor to attach the Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Assuming the JWT is stored here
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const ComplaintService = {
  // Get all complaints (admin will see all, user will see their own, backend decides)
  getAll: async () => {
    const res = await api.get('/');
    return res.data;
  },

  // Submit a complaint - 🚀 UPDATED TO HANDLE 429 & 409 ERRORS 🚀
  submitComplaint: async (complaint: any) => {
    try {
      const res = await api.post('/', complaint);
      return res.data;
    } catch (error) {
      // Check if it's an Axios error and has a response object
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const message = error.response.data.message;

        if (status === 429) {
          // Daily limit error
          throw new Error(message || 'You have reached your daily complaint limit.');
        } 
        
        if (status === 409) {
          // Duplicate complaint error
          throw new Error(message || 'A very similar complaint was recently submitted.');
        }

        // Re-throw the backend's message for other client errors (e.g., 400 Bad Request)
        if (message) {
          throw new Error(message);
        }
      }
      // Re-throw a generic error if it's not a handled Axios error
      throw new Error('Failed to submit complaint due to an unknown error.');
    }
  },

  // Update complaint status (admin only) - changed from PATCH to PUT to match backend
  updateStatus: async (id: string, status: string) => {
    const res = await api.put(`/${id}/status`, { status });
    return res.data;
  },

  // Inside complaintService.ts
  assign: async (id: string, assignee: string) => {
    const res = await api.put(`/${id}/assign`, { assignee }); // Must be 'assignee'
    return res.data;
  },

  // Delete complaint (admin only)
  delete: async (id: string) => {
    await api.delete(`/${id}`);
    return true;
  },

  // Vote for a complaint
  voteComplaint: async (id: string, userId: string) => {
    const res = await api.patch(`/${id}/vote`, { userId });
    return res.data;
  },
};

export default ComplaintService;

// Named exports for convenience
export const { submitComplaint, voteComplaint } = ComplaintService;