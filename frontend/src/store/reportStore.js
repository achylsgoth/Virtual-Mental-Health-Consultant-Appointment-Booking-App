import { create } from 'zustand';
import axios from 'axios';

axios.defaults.withCredentials = true;
const useReportStore = create((set, get) => ({
  // State
  reports: [],
  userReports: [],
  postReports: [],
  reportStats: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  },
  filters: {
    status: '',
    reason: '',
  },

  // Actions
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  
  setPagination: (pagination) => set({ 
    pagination: { ...get().pagination, ...pagination } 
  }),

  // Create a new report
  createReport: async (postId, reason, description) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('http://localhost:5555/report', {
        postId,
        reason,
        description
      });
      
      set(state => ({ 
        userReports: [response.data.report, ...state.userReports],
        loading: false 
      }));
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message,
        loading: false 
      });
      throw error;
    }
  },

  // Get all reports (with optional filtering and pagination)
  getAllReports: async () => {
    const { pagination, filters } = get();
    set({ loading: true, error: null });
    
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.reason && { reason: filters.reason }),
      });
      
      const response = await axios.get(`/reports?${queryParams}`);
      
      set({ 
        reports: response.data.reports,
        pagination: response.data.pagination,
        loading: false 
      });
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message,
        loading: false 
      });
      throw error;
    }
  },

  // Get reports statistics
  getReportStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/reports/stats');
      set({ reportStats: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message,
        loading: false 
      });
      throw error;
    }
  },

  // Get reports for a specific post
  getReportsByPost: async (postId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/reports/post/${postId}`);
      set({ postReports: response.data.reports, loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message,
        loading: false 
      });
      throw error;
    }
  },

  // Get current user's reports
  getUserReports: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/reports/my-reports');
      set({ userReports: response.data.reports, loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message,
        loading: false 
      });
      throw error;
    }
  },

  // Update report status
  updateReportStatus: async (reportId, status, resolutionNotes) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.patch(`/reports/${reportId}`, {
        status,
        resolutionNotes
      });
      
      // Update reports in all lists
      set(state => ({
        reports: state.reports.map(report => 
          report._id === reportId ? response.data.report : report
        ),
        userReports: state.userReports.map(report => 
          report._id === reportId ? response.data.report : report
        ),
        postReports: state.postReports.map(report => 
          report._id === reportId ? response.data.report : report
        ),
        loading: false
      }));
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message,
        loading: false 
      });
      throw error;
    }
  },

  // Clear store data
  clearReports: () => set({ 
    reports: [],
    userReports: [],
    postReports: [], 
    error: null 
  }),
  
  // Reset pagination
  resetPagination: () => set({
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 0,
    }
  }),
  
  // Reset filters
  resetFilters: () => set({
    filters: {
      status: '',
      reason: '',
    }
  }),

  // Reset errors
  clearError: () => set({ error: null })
}));

export default useReportStore;