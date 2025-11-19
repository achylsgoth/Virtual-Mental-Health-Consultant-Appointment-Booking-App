import { create } from 'zustand';
import axios from 'axios';

axios.defaults.withCredentials = true;

const API = 'http://localhost:5555/feedback';
const useFeedbackStore = create((set) => ({
    feedbacks: [],
    loading: false,
    error: null,

    // Fetch feedback for a therapist
    fetchTherapistFeedback: async (therapistId) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`${API}/${therapistId}`);
            set({ feedbacks: response.data, loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to fetch feedback', loading: false });
        }
    },

    // Fetch feedback for a specific session
    fetchSessionFeedback: async (sessionId) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get(`${API}/${sessionId}`);
            set({ feedbacks: [response.data], loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to fetch feedback', loading: false });
        }
    },

    // Submit feedback
    submitFeedback: async (feedbackData) => {
        set({ loading: true, error: null });
        try {
            await axios.post(`http://localhost:5555/feedback/give`, feedbackData);
            set({ loading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to submit feedback', loading: false });
        }
    },

    fetchCurrentTherapistFeedback: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get('http://localhost:5555/feedback/myfeeback', {
                withCredentials: true
            });

            set({ 
                feedbacks: response.data.feedbacks, 
                feedbackStats: response.data.stats,
                loading: false 
            });

            return response.data;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Failed to fetch therapist feedbacks',
                feedbacks: [],
                feedbackStats: {
                    totalFeedbacks: 0,
                    averageRating: 0
                },
                loading: false 
            });
            
            throw error;
        }
    },

}));

export default useFeedbackStore;
