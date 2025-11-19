import { create } from 'zustand';
import axios from 'axios';

axios.defaults.withCredentials = true;
const useProfileStore = create((set, get) => ({
  // State
  profile: null,
  isLoading: false,
  error: null,
  avatarUrl: null,
  
  // Actions
  
  /**
   * Fetch user profile data
   */
  fetchProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get('http://localhost:5555/setting/profile');
      
      if (response.data.success) {
        set({ 
          profile: response.data.data,
          avatarUrl: response.data.data.avatar,
          isLoading: false 
        });
        return response.data.data;
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch profile', 
        isLoading: false 
      });
      console.error('Error fetching profile:', error);
    }
  },
  
  /**
   * Update user profile information
   * @param {Object} profileData - Object containing profile fields to update
   */
  updateProfile: async (profileData) => {
    try {
      set({ isLoading: true, error: null });
      
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5555/setting/update', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        set({ 
          profile: { ...get().profile, ...response.data.data },
          isLoading: false 
        });
        return response.data;
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update profile', 
        isLoading: false 
      });
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  /**
   * Change user password
   * @param {Object} passwordData - Object containing current and new password
   */
  changePassword: async (passwordData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.put('http://localhost:5555/setting/change-password', passwordData);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to change password', 
        isLoading: false 
      });
      console.error('Error changing password:', error);
      throw error;
    }
  },
  
  /**
   * Upload user avatar
   * @param {File} avatarFile - The avatar image file to upload
   */
  uploadAvatar: async (avatarFile) => {
    try {
      set({ isLoading: true, error: null });
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await axios.post('http://localhost:5555/setting/upload-avatar', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        set({ 
          avatarUrl: response.data.data.avatar,
          profile: { ...get().profile, avatar: response.data.data.avatar },
          isLoading: false 
        });
        return response.data;
      }
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to upload avatar', 
        isLoading: false 
      });
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },
  
  /**
   * Reset error state
   */
  clearError: () => set({ error: null }),
  
  /**
   * Reset profile state
   */
  resetProfile: () => set({ 
    profile: null, 
    avatarUrl: null, 
    isLoading: false, 
    error: null 
  })
}));

export default useProfileStore;