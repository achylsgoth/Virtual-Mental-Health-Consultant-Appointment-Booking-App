// src/stores/useJournalStore.js
import { create } from 'zustand';
import axios from 'axios';


axios.defaults.withCredentials = true;

const useJournalStore = create((set) => ({
  // State
  journals: [],
  currentJournal: null,
  isLoading: false,
  error: null,
  
  // Reset state
  resetState: () => {
    set({
      journals: [],
      currentJournal: null,
      isLoading: false,
      error: null
    });
  },
  
  // Set loading state
  setLoading: (isLoading) => set({ isLoading }),
  
  // Set error state
  setError: (error) => set({ error }),
  
  // Fetch all journals
  fetchJournals: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`http://localhost:5555/journals/get`);
      set({ journals: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch journals', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Fetch a specific journal by ID
  fetchJournalById: async (journalId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`http://localhost:5555/journals/${journalId}`);
      set({ currentJournal: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch journal', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Fetch journals by date range
  fetchJournalsByDateRange: async (startDate, endDate) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(
        `http://localhost:5555/journals/date-range?startDate=${startDate}&endDate=${endDate}`
      );
      set({ journals: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch journals by date range', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Create a new journal
  createJournal: async (journalData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(`http://localhost:5555/journals/create`, journalData);
      
      // Add the new journal to the journals array
      set(state => ({ 
        journals: [...state.journals, response.data],
        currentJournal: response.data,
        isLoading: false 
      }));
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create journal', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Update a journal
  updateJournal: async (journalId, journalData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.put(`http://localhost:5555/journals/${journalId}`, journalData);
      
      // Update the journal in the journals array
      set(state => ({
        journals: state.journals.map(journal => 
          journal._id === journalId ? response.data : journal
        ),
        currentJournal: response.data,
        isLoading: false
      }));
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update journal', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Delete a journal
  deleteJournal: async (journalId) => {
    try {
      set({ isLoading: true, error: null });
      await axios.delete(`http://localhost:5555/journals/${journalId}`);
      
      // Remove the journal from the journals array
      set(state => ({
        journals: state.journals.filter(journal => journal._id !== journalId),
        currentJournal: state.currentJournal?._id === journalId ? null : state.currentJournal,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete journal', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  // Clear the current journal
  clearCurrentJournal: () => set({ currentJournal: null }),
  
  // Set the current journal (without API call)
  setCurrentJournal: (journal) => set({ currentJournal: journal }),
  
  // Clear any error
  clearError: () => set({ error: null })
}));

export default useJournalStore;