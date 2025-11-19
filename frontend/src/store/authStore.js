import { create } from "zustand";
import axios from "axios";


const API_URL = "http://localhost:5555/api/auth";

axios.defaults.withCredentials = true;
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isCheckingAuth: false,
  message: null,

  signup: async (email, password, username, fullname, role) => {
    set({ error: null, isCheckingAuth: true });
    try {
      const response = await axios.post(`${API_URL}/register`, {
        email,
        password,
        fullname,
        username,
        role,
      });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error signing up",
        isCheckingAuth: false,
      });
      throw error; // Rethrow to handle in the UI if needed
    }
  },


login: async (email, password) => {
  set({ error: null});
  try{
    const response = await axios.post(`${API_URL}/login`, {email, password});
    set({
      isAuthenticated: true,
      user: response.data.user,
      error:null,
    });
  } catch (error){
    set({error: error.response?.data?.message || "Error logging in"});
    throw error;
  }
},

logout:async () => {
  set({error: null});
  try{
    await axios.post(`${API_URL}/logout`);
    set({user:null, isAuthenticated:false, error: null});
  } catch (error) {
    set({error: "Error logging out"});
    throw error;
  }
},


verifyEmail: async (code) => {
  set({error:null});
  try{
    const response = await axios.post(`${API_URL}/verify-email`, {code});
    set({ user: response.data.user, isAuthenticated: true});
    return response.data;
  }catch(error){
    set({error: error.response.data.message || "Error verifying email"});
    throw error;
  }
},


checkAuth: async() => {
  set({ isCheckingAuth: true, error: null});
  try{
    const response = await axios.get(`${API_URL}/check-auth`);
    set({user: response.data.user, isAuthenticated: true, isCheckingAuth: false});
  } catch (error) {
    set({ error: null, isCheckingAuth: false, isAuthenticated: false});
    throw error;
  }
},

forgotPassword: async (email) => {
  set({error: null});
  try{
    const response = await axios.post(`${API_URL}/forgot-password`, {email});
    set({ message: response.data.message});
  } catch (error) {
    set({ error: error.response.data.message || "Error sending reset password email"});
    throw error;
  }
},

resetPassword: async (token, password) => {
  set({ error: null});
  try{
    const response = await axios.post(`${API_URL}/reset-password/${token}`, {password});
    set({ message: response.data.message});
  } catch (error) {
    set({ error: error.response.data.message || "Error resetting password"});
    throw error;
  }
},



}));