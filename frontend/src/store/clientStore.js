import { create } from 'zustand';
import axios from 'axios';
axios.defaults.withCredentials = true;
// Create a Zustand store for client sessions
const useClientSessionStore = create((set) => ({
    client:null,
    sessions: [], // Array to store client sessions
    loading: false, // Loading state
    error: null, // Error state

     fetchAuthenticatedClient: async () => {
            set({loading: true , error: null});
              try{
                const response = await axios.get(`http://localhost:5555/api/auth/check-auth`);
                set({client: response.data.user});
              } catch (error) {
                set({ error: 'Failed to fetch client data.'});
                throw error;
              } finally{
                set({ loading: false});
              }
        },
        fetchSessions: async () => {
          set({loading: true, error:null});
          try {
              // First get the sessions
              const response = await axios.get(`http://localhost:5555/session/clientSession`);
                 const sessions = response.data.sessions || []; 
              
              // For each session, fetch the decrypted notes
              const sessionsWithDecryptedNotes = await Promise.all(
                  sessions.map(async (session) => {
                      try {
                          const notesResponse = await axios.get(`http://localhost:5555/session/${session._id}/notes`);
                          return {
                              ...session,
                              notes: notesResponse.data.notes // This contains already decrypted notes
                          };
                      } catch (err) {
                          console.error(`Failed to fetch notes for session ${session._id}:`, err);
                          return session; // Return the session without decrypted notes if there was an error
                      }
                  })
              );
              
              set({sessions: sessionsWithDecryptedNotes, loading:false});
          } catch(err) {
              set({error: err.message, loading:false});
          }
      },
  

        cancelSession: async (sessionId, reason) => {
          set({loading:true, error:null});
          try{
            const response = await axios.post(`http://localhost:5555/session/cancel/${sessionId}`,{
              cancelledBy:"client",
              reason
            });
            set((state) => ({
              sessions: state.sessions.map((session)=> 
                session._id === sessionId? {...session, status:"cancelled", cancellation:{reason, cancelledBy:"client", cancelledAt: new Date()}}: session),
            }));
            return response.data;
          }catch(err){
            set({error: err.response?.data?.message || "Failed to cancel session", loading:false});
            throw err;
          }
        }

    
}));

export default useClientSessionStore;