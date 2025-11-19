import { create } from 'zustand';
import axios from 'axios';

axios.defaults.withCredentials = true;

const useForumStore = create((set) => ({
  posts: [],
  selectedPost: null,
  loading: false,
  error: null,

  fetchPosts: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('http://localhost:5555/forum', { params: filters });
      set({ posts: response.data.posts, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch posts', loading: false });
    }
  },

  fetchPostById: async (postId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`http://localhost:5555/forum/${postId}`);
      set({ selectedPost: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch post', loading: false });
    }
  },

  createPost: async (postData) => {
    try {
      const response = await axios.post('http://localhost:5555/forum/create', postData);
      set((state) => ({ posts: [response.data, ...state.posts] }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create post' });
    }
  },

  updatePost: async (postId, postData) => {
    try {
      const response = await axios.put(`http://localhost:5555/forum/${postId}`, postData);
      set((state) => ({
        posts: state.posts.map((post) => (post._id === postId ? response.data : post)),
        selectedPost: response.data,
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update post' });
    }
  },

  deletePost: async (postId) => {
    try {
      await axios.delete(`http://localhost:5555/forum/${postId}`);
      set((state) => ({ posts: state.posts.filter((post) => post._id !== postId) }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete post' });
    }
  },

  addComment: async (postId, commentData) => {
    try {
      const response = await axios.post(`http://localhost:5555/forum/${postId}/comments`, commentData);
      set((state) => ({
        selectedPost: {
          ...state.selectedPost,
          comments: response.data,
        },
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to add comment' });
    }
  },

  likePost: async (postId) => {
    try {
      const response = await axios.post(`http://localhost:5555/forum/${postId}/like`);
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId ? { ...post, likes: response.data.likes } : post
        ),
        selectedPost:
          state.selectedPost?._id === postId
            ? { ...state.selectedPost, likes: response.data.likes }
            : state.selectedPost,
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to like post' });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useForumStore;
