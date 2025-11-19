import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { useAuthStore } from './authStore'; // Import your auth store

axios.defaults.withCredentials = true;
// Use the same base URL pattern
const API_URL = 'http://localhost:5555/admin';

const useAdminStore = create(
  persist(
    (set, get) => ({
      // State
      pendingTherapists: [],
      reports: [],
      filteredReports: [],
      admin: null,
      isAuthenticated: false,
      dashboardStats: {
        pendingReports: 0,
        pendingTherapists: 0,
        totalUsers: 0,
        totalTherapists: 0,
        recentReports: 0
      },
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0
      },
      isLoading: false,
      error: null,
      
      // Reset error
      clearError: () => set({ error: null }),
      
      // Helper method for authenticated requests using cookies
      makeAuthRequest: async (method, endpoint, data = null) => {
        // Use the endpoint path directly since cookies will handle auth
        const adminEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${API_URL}${adminEndpoint}`;
        
        try {
          let response;
          if (method.toLowerCase() === 'get') {
            response = await axios.get(url);
          } else if (method.toLowerCase() === 'post') {
            response = await axios.post(url, data);
          } else if (method.toLowerCase() === 'put') {
            response = await axios.put(url, data);
          } else if (method.toLowerCase() === 'delete') {
            response = await axios.delete(url, { data });
          }
          return response.data;
        } catch (error) {
          // Handle 401 errors consistently
          if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            throw new Error('Session expired. Please login again.');
          }
          throw error;
        }
      },
      
      // Therapist verification actions
      fetchPendingTherapists: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Simply use axios with withCredentials (cookie auth)
          const response = await axios.get(`${API_URL}/therapists/pending`);
          
          set({ 
            pendingTherapists: response.data.therapists || [],
            isLoading: false
          });
          
          return { success: true, data: response.data };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch pending therapists';
          
          // If cookie expired or invalid, logout
          if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            set({ isLoading: false, error: 'Session expired. Please login again.' });
            return { success: false, message: 'Session expired. Please login again.' };
          }
          
          set({ error: errorMessage, isLoading: false });
          return { success: false, message: errorMessage };
        }
      },
      
      verifyTherapist: async (therapistId, isApproved) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await axios.put(
            `${API_URL}/therapists/verify`, 
            { therapistId, isLicenseVerified:isApproved}
          );
          
          // Remove the approved/rejected therapist from the list
          const updatedTherapists = get().pendingTherapists.filter(
            therapist => therapist._id !== therapistId
          );
          
          set({ 
            pendingTherapists: updatedTherapists,
            isLoading: false
          });
          
          return { success: true, data: response.data };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to verify therapist';
          
          if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            set({ isLoading: false, error: 'Session expired. Please login again.' });
            return { success: false, message: 'Session expired. Please login again.' };
          }
          
          set({ error: errorMessage, isLoading: false });
          return { success: false, message: errorMessage };
        }
      },
      
      // Report handling actions
      fetchAllReports: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await axios.get(`${API_URL}/reports`);
          
          set({ 
            reports: response.data.reports || [],
            isLoading: false
          });
          
          return { success: true, data: response.data };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch reports';
          
          if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            set({ isLoading: false, error: 'Session expired. Please login again.' });
            return { success: false, message: 'Session expired. Please login again.' };
          }
          
          set({ error: errorMessage, isLoading: false });
          return { success: false, message: errorMessage };
        }
      },
      
      fetchFilteredReports: async (filters = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          // Extract filters and pagination
          const { status, reason, page = 1, limit = 10 } = filters;
          
          // Build query string
          const queryParams = new URLSearchParams();
          if (status) queryParams.append('status', status);
          if (reason) queryParams.append('reason', reason);
          queryParams.append('page', page);
          queryParams.append('limit', limit);
          
          const response = await axios.get(
            `${API_URL}/reports/filter?${queryParams.toString()}`
          );
          
          set({ 
            filteredReports: response.data.reports || [],
            pagination: response.data.pagination || {
              total: 0,
              page: 1,
              limit: 10,
              pages: 0
            },
            isLoading: false
          });
          
          return { success: true, data: response.data };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch filtered reports';
          
          if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            set({ isLoading: false, error: 'Session expired. Please login again.' });
            return { success: false, message: 'Session expired. Please login again.' };
          }
          
          set({ error: errorMessage, isLoading: false });
          return { success: false, message: errorMessage };
        }
      },
      
      handleReport: async (reportId, action, notes) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await axios.post(
            `${API_URL}/reports/handle`,
            { reportId, action, notes }
          );
          
          // Update the reports list with the updated report
          const updatedReport = response.data.report;
          
          // Update both reports lists with the new status
          const updateReportsWithNewStatus = (reportsList) => {
            return reportsList.map(report => 
              report._id === reportId
                ? { ...report, status: action, resolutionNotes: notes }
                : report
            );
          };
          
          set({
            reports: updateReportsWithNewStatus(get().reports),
            filteredReports: updateReportsWithNewStatus(get().filteredReports),
            isLoading: false
          });
          
          return { success: true, data: response.data };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to handle report';
          
          if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            set({ isLoading: false, error: 'Session expired. Please login again.' });
            return { success: false, message: 'Session expired. Please login again.' };
          }
          
          set({ error: errorMessage, isLoading: false });
          return { success: false, message: errorMessage };
        }
      },
      
      // Dashboard stats
      fetchDashboardStats: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await axios.get(`${API_URL}/dashboard/stats`);
          
          set({ 
            dashboardStats: response.data.stats || {
              pendingReports: 0,
              pendingTherapists: 0,
              totalUsers: 0,
              totalTherapists: 0,
              recentReports: 0
            },
            isLoading: false
          });
          
          return { success: true, data: response.data };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch dashboard stats';
          
          if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            set({ isLoading: false, error: 'Session expired. Please login again.' });
            return { success: false, message: 'Session expired. Please login again.' };
          }
          
          set({ error: errorMessage, isLoading: false });
          return { success: false, message: errorMessage };
        }
      },
      
      // Admin authentication functions
      loginAdmin: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await axios.post(`http://localhost:5555/api/auth/admin/login`, {
            email,
            password
          });
          
          // Match the controller response structure
          const { token, admin } = response.data;
          
          // Set auth header for future requests
          if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }
          
          set({ 
            admin: admin, // Store only the admin data provided by controller
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          return { success: true, data: response.data };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ 
            isLoading: false, 
            error: errorMessage,
            admin: null,
            isAuthenticated: false
          });
          
          return { success: false, message: errorMessage };
        }
      },
      
      logout: () => {
        // Clear auth header
        delete axios.defaults.headers.common['Authorization'];
        
        set({ 
          admin: null,
          isAuthenticated: false,
          error: null
        });
        
        return { success: true };
      }
    }),
    {
      name: 'admin-store', // Name for localStorage
      partialize: (state) => ({
        // Only persist these fields
        dashboardStats: state.dashboardStats,
        pagination: state.pagination
      })
    }
  )
);

export default useAdminStore;