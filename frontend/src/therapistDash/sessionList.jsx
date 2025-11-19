import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Snackbar,
  Avatar,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  DeleteOutline,
  EditOutlined,
  AccessTimeOutlined,
  NoteOutlined,
  CloseOutlined,
  CheckCircleOutline,
  HistoryOutlined,
  PersonOutlined,
  ShareOutlined,
  LockOutlined,
  AddCircleOutline
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import useTherapistStore from '../store/therapistStore';
import Layout from '../therapistDash/layout';

const drawerWidth = 240;

// Custom TabPanel component for the session details dialog
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`session-tabpanel-${index}`}
      aria-labelledby={`session-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function SessionsManagement() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [selectedTab, setSelectedTab] = useState('Sessions');
  
  // Get the required functions and state from the therapist store
  const { 
    therapist, 
    sessions = [], 
    loading: storeLoading,
    error: storeError,
    fetchSessions, 
    updatePrivateNotes, 
    deletePrivateNote,
    updateSharedNotes,
    addSharedNote,         // New function needed in your store
    deleteSharedNote,      // New function needed in your store
    markSessionComplete, 
    deleteSession,
    fetchClientSessionHistory
  } = useTherapistStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Session states
  const [selectedSession, setSelectedSession] = useState(null);
  const [openSessionDetailsDialog, setOpenSessionDetailsDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [newPrivateNote, setNewPrivateNote] = useState('');
  
  // New state for shared notes - similar to private notes
  const [newSharedNote, setNewSharedNote] = useState('');
  const [sharedNoteToDelete, setSharedNoteToDelete] = useState(null);
  const [openDeleteSharedNoteDialog, setOpenDeleteSharedNoteDialog] = useState(false);
  
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  
  // Other states for enhanced functionality
  const [detailsTabValue, setDetailsTabValue] = useState(0);
  const [pastSessions, setPastSessions] = useState([]);
  const [loadingPastSessions, setLoadingPastSessions] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [openDeleteNoteDialog, setOpenDeleteNoteDialog] = useState(false);

  // Fetch sessions on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchSessions();
        setLoading(false);
        // If sessionId is provided in URL, open the session details dialog for that session
        if (sessionId) {
          const session = sessions.find(s => s._id === sessionId);
          if (session) {
            await handleViewSessionDetails(session);
          }
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId, fetchSessions]);

  // Handle viewing session details and fetching past sessions
  const handleViewSessionDetails = async (session) => {
    setSelectedSession(session);
    // Reset the new note inputs
    setNewPrivateNote('');
    setNewSharedNote('');
    setDetailsTabValue(0); // Reset to first tab
    navigate(`/sessionList/${session._id}`, { replace: true });
    setOpenSessionDetailsDialog(true);
    
    // Fetch past sessions for this client
    try {
      setLoadingPastSessions(true);
      // Using fetchClientSessionHistory instead of fetchClientSessions
      const clientSessions = await fetchClientSessionHistory(session.clientId._id);
      
      // Filter out current session and sort by date (most recent first)
      const filteredSessions = clientSessions
        .filter(s => s._id !== session._id)
        .sort((a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime));
      
      setPastSessions(filteredSessions);
      setLoadingPastSessions(false);
    } catch (err) {
      console.error("Error fetching past sessions:", err);
      setLoadingPastSessions(false);
    }
  };

  const handleCloseSessionDetails = () => {
    navigate('/sessionList', { replace: true });
    setOpenSessionDetailsDialog(false);
  };

  const handleAddPrivateNote = async () => {
    if (!newPrivateNote.trim()) return;
    
    try {
      await updatePrivateNotes(selectedSession._id, newPrivateNote);
      // Refresh sessions to get the updated notes
      await fetchSessions();
      // Update the selected session with the latest data
      const updatedSession = sessions.find(s => s._id === selectedSession._id);
      if (updatedSession) {
        setSelectedSession(updatedSession);
      }
      setNewPrivateNote(''); // Clear the input field
      setAlertMessage('Private note added successfully');
      setAlertSeverity('success');
      setAlertOpen(true);
    } catch (err) {
      setAlertMessage('Failed to add private note');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  // New function for adding shared notes
  const handleAddSharedNote = async () => {
    if (!newSharedNote.trim()) return;
    
    try {
      await updateSharedNotes(selectedSession._id, newSharedNote);
      // Refresh sessions to get the updated notes
      await fetchSessions();
      // Update the selected session with the latest data
      const updatedSession = sessions.find(s => s._id === selectedSession._id);
      if (updatedSession) {
        setSelectedSession(updatedSession);
      }
      setNewSharedNote(''); // Clear the input field
      setAlertMessage('Shared note added successfully');
      setAlertSeverity('success');
      setAlertOpen(true);
    } catch (err) {
      setAlertMessage('Failed to add shared note');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const handleDeletePrivateNote = (noteId) => {
    setNoteToDelete(noteId);
    setOpenDeleteNoteDialog(true);
  };

  // New function for deleting shared notes
  const handleDeleteSharedNote = (noteId) => {
    setSharedNoteToDelete(noteId);
    setOpenDeleteSharedNoteDialog(true);
  };

  const confirmDeleteNote = async () => {
    try {
      await deletePrivateNote(selectedSession._id, noteToDelete);
      // Refresh sessions to get the updated notes
      await fetchSessions();
      // Update the selected session with the latest data
      const updatedSession = sessions.find(s => s._id === selectedSession._id);
      if (updatedSession) {
        setSelectedSession(updatedSession);
      }
      setAlertMessage('Note deleted successfully');
      setAlertSeverity('success');
      setAlertOpen(true);
    } catch (err) {
      setAlertMessage('Failed to delete note');
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
      setOpenDeleteNoteDialog(false);
      setNoteToDelete(null);
    }
  };

  // New function for confirming deletion of shared notes
  const confirmDeleteSharedNote = async () => {
    try {
      await deleteSharedNote(selectedSession._id, sharedNoteToDelete);
      // Refresh sessions to get the updated notes
      await fetchSessions();
      // Update the selected session with the latest data
      const updatedSession = sessions.find(s => s._id === selectedSession._id);
      if (updatedSession) {
        setSelectedSession(updatedSession);
      }
      setAlertMessage('Shared note deleted successfully');
      setAlertSeverity('success');
      setAlertOpen(true);
    } catch (err) {
      setAlertMessage('Failed to delete shared note');
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
      setOpenDeleteSharedNoteDialog(false);
      setSharedNoteToDelete(null);
    }
  };

  // Handle changing tabs in session details dialog
  const handleChangeDetailsTab = (event, newValue) => {
    setDetailsTabValue(newValue);
  };

  // Handle deleting a session
  const handleDelete = (session) => {
    setSelectedSession(session);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async() => {
    try {
      const result = await deleteSession(selectedSession._id);
      if (result.success) {
        await fetchSessions();
        setAlertMessage('Session deleted successfully');
        setAlertSeverity('success');
        setAlertOpen(true);
        setOpenSessionDetailsDialog(false);
      } else {
        setAlertMessage(result.message || 'Failed to delete session');
        setAlertSeverity('error');
        setAlertOpen(true);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      setAlertMessage('An error occurred while deleting the session');
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  // Handle marking session as complete
  const handleCompleteSession = (session) => {
    setSelectedSession(session);
    navigate(`/sessionList/${session._id}`, { replace: true });
    setOpenCompleteDialog(true);
  };

  const confirmComplete = async () => {
    try {
      const result = await markSessionComplete(selectedSession._id);
      if (result && result.success !== false) {
        setAlertMessage('Session marked as completed');
        setAlertSeverity('success');
        setAlertOpen(true);
        navigate('/sessionList', { replace: true });
        setOpenCompleteDialog(false);
        setOpenSessionDetailsDialog(false);
        await fetchSessions();
      } else {
        setAlertMessage(result?.message || 'Failed to mark session as completed');
        setAlertSeverity('error');
        setAlertOpen(true);
      }
    } catch (err) {
      setAlertMessage('Failed to mark session as completed');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  // Format the date for a note
  const formatNoteDate = (dateString) => {
    return dayjs(dateString).format('MMM D, YYYY [at] h:mm A');
  };

  // Use the store's loading and error state if available
  const isLoading = loading || storeLoading;
  const errorMessage = error || storeError;

  return (
    <Layout
      drawerWidth={drawerWidth}
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      user={therapist}
    >
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Sessions Management
        </Typography>
        <Button
          variant="contained"
          disableElevation
          sx={{
            bgcolor: 'black',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.8)',
            }
          }}
          onClick={() => navigate('/schedule-session')} // Assuming you have a route for scheduling
        >
          Schedule New Session
        </Button>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Typography variant="h6">Your Sessions</Typography>
        </Box>
        <Divider />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : errorMessage ? (
          <Box sx={{ p: 3 }}>
            <Typography color="error">No Sessions Found</Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
            {!sessions || sessions.length === 0? (
              <ListItem>
                <ListItemText primary="No sessions found" />
              </ListItem>
            ) : 
              (sessions.map((session, index) => (
                <React.Fragment key={session._id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      py: 2,
                      bgcolor: session.status === 'completed' ? '#f9f9f9' : 'white',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: '#f0f7ff',
                      }
                    }}
                    onClick={() => handleViewSessionDetails(session)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: session.status === 'completed' ? '#9e9e9e' : '#1976d2' }}>
                        {session.clientId.fullname.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="medium">
                          {session.clientId.fullname}
                          {session.status === 'completed' && (
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{ ml: 1, px: 1, py: 0.5, bgcolor: '#e0e0e0', borderRadius: 1 }}
                            >
                              Completed
                            </Typography>
                          )}

                          {session.status === 'cancelled' && (
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{ ml: 1, px: 1, py: 0.5, bgcolor: 'red', borderRadius: 1 }}
                            >
                              Cancelled
                            </Typography>
                          )}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {session.therapy}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <AccessTimeOutlined sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {dayjs(session.scheduledTime).format('YYYY-MM-DD h:mm A')}
                            </Typography>
                          </Box>
                          {session.status === 'cancelled' && (
                            <>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Typography variant="body2" color="error" sx={{ fontWeight: 'medium' }}>
                                  Cancelled by: {session.cancellation.cancelledBy === 'client' ? 'Client' : 'Therapist'}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                ({dayjs(session.cancellation.cancelledAt).format('MMM D, YYYY')})
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Reason: {session.cancellation.reason || 'No reason provided'}
                                </Typography>
                              </Box>
                            </>
                          )}
                          {((session.notes?.privateNotes && session.notes.privateNotes.length > 0) || 
                            (session.notes?.sharedNotes && session.notes.sharedNotes.length > 0)) && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <NoteOutlined sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '500px' }}>
                                Notes available
                              </Typography>
                            </Box>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction onClick={(e) => e.stopPropagation()}>
                      {session.status === 'scheduled' && (
                        <IconButton
                          edge="end"
                          aria-label="mark-completed"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteSession(session);
                          }}
                          sx={{ mr: 1, color: 'green' }}
                          title="Mark as completed"
                        >
                          <CheckCircleOutline />
                        </IconButton>
                      )}
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(session);
                        }}
                      >
                        <DeleteOutline />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < sessions.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))
            )}
          </List>
        )}
      </Paper>

      {/* Enhanced Session Details Dialog */}
      <Dialog 
        open={openSessionDetailsDialog} 
        onClose={handleCloseSessionDetails} 
        fullWidth 
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Session Details</Typography>
            <IconButton aria-label="close" onClick={handleCloseSessionDetails}>
              <CloseOutlined />
            </IconButton>
          </Box>
        </DialogTitle>
        
        {selectedSession && (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={detailsTabValue} 
                onChange={handleChangeDetailsTab}
                sx={{ px: 2 }}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab icon={<PersonOutlined />} iconPosition="start" label="Client & Session Info" />
                <Tab icon={<ShareOutlined />} iconPosition="start" label="Shared Notes" />
                <Tab icon={<LockOutlined />} iconPosition="start" label="Private Notes" />
                <Tab icon={<HistoryOutlined />} iconPosition="start" label="Past Sessions" />
              </Tabs>
            </Box>
            
            <DialogContent dividers>
              {/* Client & Session Info Tab */}
              <TabPanel value={detailsTabValue} index={0}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Client Information</Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Avatar 
                        sx={{ width: 64, height: 64, bgcolor: '#1976d2' }}
                      >
                        {selectedSession.clientId.fullname.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{selectedSession.clientId.fullname}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedSession.clientId.email}
                        </Typography>
                        {/* You would need to add these fields to your client model */}
                        {selectedSession.clientId.phone && (
                          <Typography variant="body2" color="text.secondary">
                            {selectedSession.clientId.phone}
                          </Typography>
                        )}
                        {selectedSession.clientId.dateOfBirth && (
                          <Typography variant="body2" color="text.secondary">
                            DOB: {dayjs(selectedSession.clientId.dateOfBirth).format('MMMM D, YYYY')}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Current Session</Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Therapy Type</Typography>
                        <Typography variant="body1">{selectedSession.therapy}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: selectedSession.status === 'completed' ? 'success.main' : 
                                  selectedSession.status === 'cancelled' ? 'error.main' : 
                                  'info.main'
                          }}
                        >
                          {selectedSession.status.charAt(0).toUpperCase() + selectedSession.status.slice(1)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Date & Time</Typography>
                        <Typography variant="body1">
                          {dayjs(selectedSession.scheduledTime).format('MMMM D, YYYY h:mm A')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Duration</Typography>
                        <Typography variant="body1">{selectedSession.duration} minutes</Typography>
                      </Box>
                      {selectedSession.meetingLink && (
                        <Box sx={{ gridColumn: 'span 2' }}>
                          <Typography variant="body2" color="text.secondary">Meeting Link</Typography>
                          <Typography 
                            variant="body1" 
                            component="a" 
                            href={selectedSession.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            sx={{ color: 'primary.main', textDecoration: 'none' }}
                          >
                            {selectedSession.meetingLink}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Box>

                {selectedSession.status === 'scheduled' && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      disableElevation
                      onClick={() => handleCompleteSession(selectedSession)}
                      startIcon={<CheckCircleOutline />}
                    >
                      Mark as Completed
                    </Button>
                  </Box>
                )}
              </TabPanel>
              
              {/* Shared Notes Tab - Updated for multiple notes */}
              <TabPanel value={detailsTabValue} index={1}>
                <Typography variant="subtitle1" color="text.secondary" paragraph>
                  These notes will be visible to both you and the client. Use this space for session summaries,
                  homework assignments, or any information you want to share with your client.
                </Typography>
                
                {/* Add new shared note */}
                <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Add New Shared Note
                  </Typography>
                  <TextField
                    label="New Shared Note"
                    multiline
                    rows={4}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    value={newSharedNote}
                    onChange={(e) => setNewSharedNote(e.target.value)}
                    placeholder="Add a new shared note that will be visible to your client..."
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      onClick={handleAddSharedNote}
                      variant="contained"
                      disableElevation
                      startIcon={<AddCircleOutline />}
                      disabled={!newSharedNote.trim()}
                      sx={{
                        bgcolor: 'black',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.8)',
                        }
                      }}
                    >
                      Add Shared Note
                    </Button>
                  </Box>
                </Paper>

                {/* Display existing shared notes */}
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Previous Shared Notes
                </Typography>
                
                {(!selectedSession.notes?.sharedNotes || selectedSession.notes.sharedNotes.length === 0) ? (
                  <Typography color="text.secondary">No shared notes yet.</Typography>
                ) : (
                  <List>
                    {/* Check if sharedNotes is an array */}
                    {Array.isArray(selectedSession.notes.sharedNotes) ? (
                      // If it's an array, map through it
                      selectedSession.notes.sharedNotes.map((note, index) => (
                        <Card key={note._id || index} sx={{ mb: 2, borderRadius: 2 }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography variant="body2" color="text.secondary">
                                {formatNoteDate(note.createdAt)}
                              </Typography>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteSharedNote(note._id)}
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteOutline fontSize="small" />
                              </IconButton>
                            </Box>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                              {note.content}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      // If it's a string (legacy format), display as a single note
                      <Card sx={{ mb: 2, borderRadius: 2 }}>
                        <CardContent>
                          <Typography variant="body1">
                            {selectedSession.notes.sharedNotes}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Legacy note format - please add a new note to convert to the new system
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    )}
                  </List>
                )}
              </TabPanel>
              
              {/* Private Notes Tab */}
              <TabPanel value={detailsTabValue} index={2}>
                <Typography variant="subtitle1" color="text.secondary" paragraph>
                  These notes are private and only visible to you. Use this space for your professional observations,
                  treatment plans, or any confidential information.
                </Typography>
                
                {/* Add new private note */}
                <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Add New Note
                  </Typography>
                  <TextField
                    label="New Private Note"
                    multiline
                    rows={4}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    value={newPrivateNote}
                    onChange={(e) => setNewPrivateNote(e.target.value)}
                    placeholder="Add a new private note about this session..."
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      onClick={handleAddPrivateNote}
                      variant="contained"
                      disableElevation
                      startIcon={<AddCircleOutline />}
                      disabled={!newPrivateNote.trim()}
                      sx={{
                        bgcolor: 'black',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.8)',
                        }
                      }}
                    >
                      Add Note
                    </Button>
                  </Box>
                </Paper>

                {/* Display existing private notes */}
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Previous Notes
                </Typography>
                
                {(!selectedSession.notes?.privateNotes || selectedSession.notes.privateNotes.length === 0) ? (
                  <Typography color="text.secondary">No private notes yet.</Typography>
                ) : (
                  <List>
                    {selectedSession.notes.privateNotes.map((note, index) => (
                      <Card key={note._id || index} sx={{ mb: 2, borderRadius: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="body2" color="text.secondary">
                              {formatNoteDate(note.createdAt)}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeletePrivateNote(note._id)}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </Box>
                          <Typography variant="body1" sx={{ mt: 1 }}>
                            {note.content}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </List>
                )}
              </TabPanel>
              
              {/* Past Sessions Tab */}
              <TabPanel value={detailsTabValue} index={3}>
                <Typography variant="h6" gutterBottom>
                  Past Sessions with {selectedSession.clientId.fullname}
                </Typography>
                
                {loadingPastSessions ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : pastSessions.length === 0 ? (
                  <Typography color="text.secondary">
                    No past sessions found for this client.
                  </Typography>
                ) : (
                  <List sx={{ width: '100%' }}>
                    {pastSessions.map((session) => (
                      <Card key={session._id} sx={{ mb: 2, borderRadius: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {dayjs(session.scheduledTime).format('MMMM D, YYYY')}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: session.status === 'completed' ? '#e8f5e9' : 
                                         session.status === 'cancelled' ? '#ffebee' : '#e3f2fd',
                                color: session.status === 'completed' ? 'success.dark' : 
                                       session.status === 'cancelled' ? 'error.dark' : 'info.dark',
                              }}
                            >
                              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AccessTimeOutlined sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {dayjs(session.scheduledTime).format('h:mm A')} - {session.duration} minutes
                            </Typography>
                          </Box>
                          
                          {session.therapy && (
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Therapy: {session.therapy}
                            </Typography>
                          )}
                          
                          {session.notes?.privateNotes && session.notes.privateNotes.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
                                <LockOutlined sx={{ fontSize: 16, mr: 0.5 }} />
                                Private Notes
                              </Typography>
                              {session.notes.privateNotes.map((note, i) => (
                                <Box key={note._id || i} sx={{ mt: 1, mb: 2 }}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {formatNoteDate(note.createdAt)}
                                  </Typography>
                                  <Typography variant="body2" paragraph>
                                    {note.content}
                                  </Typography>
                                  {i < session.notes.privateNotes.length - 1 && <Divider sx={{ my: 1 }} />}
                                </Box>
                              ))}
                  
                            </Box>
                          )}
                          
                          {session.notes?.sharedNotes && session.notes.sharedNotes.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
                                <ShareOutlined sx={{ fontSize: 16, mr: 0.5 }} />
                                Shared Notes
                              </Typography>
                              {Array.isArray(session.notes.sharedNotes) ? (
                                session.notes.sharedNotes.map((note, i) => (
                                  <Box key={note._id || i} sx={{ mt: 1, mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      {formatNoteDate(note.createdAt)}
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                      {note.content}
                                    </Typography>
                                    {i < session.notes.sharedNotes.length - 1 && <Divider sx={{ my: 1 }} />}
                                  </Box>
                                ))
                              ) : (
                                <Typography variant="body2" paragraph sx={{ mt: 1 }}>
                                  {typeof session.notes.sharedNotes === 'string' ? session.notes.sharedNotes : 'No shared notes available'}
                                </Typography>
                              )}
                            </Box>
                          )}

                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleViewSessionDetails(session)}
                            >
                              View Details
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </List>
                )}
              </TabPanel>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<DeleteOutline />}
                onClick={() => handleDelete(selectedSession)}
              >
                Delete Session
              </Button>
              <Button 
                onClick={handleCloseSessionDetails}
                variant="contained"
                disableElevation
                sx={{
                  bgcolor: 'black',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.8)',
                  }
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Session Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Session</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this session? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disableElevation>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Note Dialog */}
      <Dialog
        open={openDeleteNoteDialog}
        onClose={() => setOpenDeleteNoteDialog(false)}
        aria-labelledby="delete-note-dialog-title"
      >
        <DialogTitle id="delete-note-dialog-title">Delete Note</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this note? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteNoteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDeleteNote} color="error" variant="contained" disableElevation>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complete Session Dialog */}
      <Dialog
        open={openCompleteDialog}
        onClose={() => setOpenCompleteDialog(false)}
        aria-labelledby="complete-dialog-title"
      >
        <DialogTitle id="complete-dialog-title">Complete Session</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark this session as completed?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCompleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmComplete} color="success" variant="contained" disableElevation>
            Mark as Completed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={5000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
}