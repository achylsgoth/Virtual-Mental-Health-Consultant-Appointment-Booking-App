import {create} from 'zustand';
import axios from 'axios';

axios.defaults.withCredentials = true;

const useMoodStore = create((set) => ({
    moodTracker: [],
    loading: false,
    error: null,

    fetchMoods: async() => {
        set({loading: true, error: null});
        try{
            const response = await axios.get('http://localhost:5555/mood/get');
            set({moodTracker: response.data.moodTracker, loading: false});
        } catch(error){
            set({error: error.response?.data?.message || 'failed to fetch moods', loading: false});
        }
    },

    addMood: async (mood, description) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post('http://localhost:5555/mood/add', { mood, description });
            set((state) => ({ 
                moodTracker: [...state.moodTracker, { mood, description, timestamp: new Date(), _id: response.data._id }],
                loading: false
            }));
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to add mood', loading: false });
        }
    },

    deleteMood: async (moodId) => {
        set({ loading: true, error: null });
        try {
            await axios.delete(`http://localhost:5555/mood/${moodId}`);
            set((state) => ({
                moodTracker: state.moodTracker.filter(entry => entry._id !== moodId),
                loading: false
            }));
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to delete mood', loading: false });
        }
    }
}));

export default useMoodStore;