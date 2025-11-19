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
  Rating,
  Link
} from '@mui/material';
import {
  CancelOutlined,
  AccessTimeOutlined,
  NoteOutlined,
  CloseOutlined,
  EventNoteOutlined,
  FeedbackOutlined,
  StarOutline,
  Star,
  VideocamOutlined,
  ContentCopyOutlined,
  CommentOutlined
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import useClientSessionStore from '../store/clientStore';
import useFeedbackStore from '../store/feedbackStore';
import Layout from './layout';

const drawerWidth = 240;

export default function PatientSessionsManagement() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [selectedTab, setSelectedTab] = useState('Sessions');
  const { client, sessions = [], fetchSessions, fetchAuthenticatedClient, cancelSession } = useClientSessionStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Session states
  const [selectedSession, setSelectedSession] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  
  // Feedback states
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');

  // Link copied state
  const [linkCopied, setLinkCopied] = useState(false);

  // Fetch sessions on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchSessions();
        setLoading(false);
        // If sessionId is provided in URL, open the view dialog for that session
        if (sessionId) {
          const session = sessions.find(s => s._id === sessionId);
          if (session) {
            setSelectedSession(session);
            setOpenViewDialog(true);
          }
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId, fetchSessions]); // Removed `sessions` from dependencies

  // Handle viewing session details
  const handleViewSession = (session) => {
    setSelectedSession(session);
    navigate(`/clientsessionList/${session._id}`, { replace: true });
    setOpenViewDialog(true);
  };

  const handleCloseView = () => {
    navigate('/clientsessionList', { replace: true });
    setOpenViewDialog(false);
  };

  // Handle cancelling a session
  const handleCancelSession = (session) => {
    setSelectedSession(session);
    setCancelReason('');
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
  };

  const confirmCancel = async () => {
    try {
      await cancelSession(selectedSession._id, cancelReason);
      setAlertMessage('Session cancelled successfully');
      setAlertSeverity('success');
      setAlertOpen(true);
      setOpenCancelDialog(false);
    } catch (err) {
      setAlertMessage('Failed to cancel session');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  // Handle feedback
  const handleOpenFeedback = (session) => {
    setSelectedSession(session);
    // Pre-fill with existing feedback if available
    if (session.feedback) {
      setFeedbackRating(session.feedback.rating);
      setFeedbackComment(session.feedback.comment || '');
    } else {
      setFeedbackRating(0);
      setFeedbackComment('');
    }
    setOpenFeedbackDialog(true);
  };

  const handleCloseFeedback = () => {
    setOpenFeedbackDialog(false);
  };

  const submitSessionFeedback = async () => {
    try {
      await useFeedbackStore.getState().submitFeedback( {
        sessionId: selectedSession._id,
        rating: feedbackRating,
        comment: feedbackComment
      });
      setAlertMessage('Feedback submitted successfully');
      setAlertSeverity('success');
      setAlertOpen(true);
      setOpenFeedbackDialog(false);
      // Refresh sessions to get updated feedback
      await fetchSessions();
    } catch (err) {
      setAlertMessage('Failed to submit feedback');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  // Check if a session can be cancelled (only if it's more than 24 hours away)
  const canCancelSession = (session) => {
    if (session.status !== 'scheduled') return false;
    const sessionTime = dayjs(session.scheduledTime);
    const now = dayjs();
    return sessionTime.diff(now, 'hour') > 24;
  };

  // Check if a session can receive feedback (only completed sessions)
  const canProvideFeedback = (session) => {
    return session.status === 'completed';
  };

  // Handle copying meeting link
  const copyMeetingLink = (meetingLink) => {
    if (meetingLink) {
      navigator.clipboard.writeText(meetingLink)
        .then(() => {
          setLinkCopied(true);
          setAlertMessage('Meeting link copied to clipboard');
          setAlertSeverity('success');
          setAlertOpen(true);
          setTimeout(() => setLinkCopied(false), 3000);
        })
        .catch(err => {
          setAlertMessage('Failed to copy link');
          setAlertSeverity('error');
          setAlertOpen(true);
        });
    }
  };

  // Check if session should show meeting link (only upcoming and not cancelled)
  const shouldShowMeetingLink = (session) => {
    if (session.status === 'cancelled') return false;
    const sessionTime = dayjs(session.scheduledTime);
    const now = dayjs();
    // Show link if session is today or in the future
    return sessionTime.isAfter(now.subtract(1, 'day'));
  };

  // Check if session has shared notes
const hasSharedNotes = (session) => {
  return Array.isArray(session?.notes?.sharedNotes) && 
         session.notes.sharedNotes.length > 0 &&
         session.notes.sharedNotes.some(note => note.content);
};

  return (
    <Layout
      drawerWidth={drawerWidth}
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      user={client}
    >
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          My Sessions
        </Typography>
        <Button
          variant="contained"
          disableElevation
          onClick={() => navigate('/clientsessionList')}
          sx={{
            bgcolor: 'black',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.8)',
            }
          }}
        >
          Book New Session
        </Button>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Typography variant="h6">Upcoming & Past Sessions</Typography>
        </Box>
        <Divider />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
            {sessions.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No sessions found"
                  secondary="Book a session to start your therapy journey"
                />
              </ListItem>
            ) : (
              sessions.map((session, index) => (
                <React.Fragment key={session._id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      py: 2,
                      bgcolor: session.status === 'completed' ? '#f9f9f9' : 'white',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleViewSession(session)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: session.status === 'completed' ? '#9e9e9e' : '#1976d2' }}>
                        {session.therapistId.fullname.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="medium">
                          Dr. {session.therapistId.fullname}
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
                              sx={{ ml: 1, px: 1, py: 0.5, bgcolor: '#ffcdd2', color: '#c62828', borderRadius: 1 }}
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
                          
                          {/* Meeting Link Display in List View */}
                          {shouldShowMeetingLink(session) && session.meetingLink && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <VideocamOutlined sx={{ fontSize: 16, mr: 0.5, color: '#1976d2' }} />
                              <Typography 
                                variant="body2" 
                                color="primary"
                                sx={{ 
                                  textDecoration: 'underline', 
                                  cursor: 'pointer',
                                  '&:hover': { color: '#1565c0' }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(session.meetingLink, '_blank');
                                }}
                              >
                                Join Meeting
                              </Typography>
                            </Box>
                          )}
                          
                          {session.status === 'cancelled' && (
                            <>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Typography variant="body2" color="error" sx={{ fontWeight: 'medium' }}>
                                  Cancelled by: {session.cancellation.cancelledBy === 'client' ? 'You' : 'Therapist'}
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
                          {session.notes?.patientNotes && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <NoteOutlined sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '500px' }}>
                                {session.notes.patientNotes}
                              </Typography>
                            </Box>
                          )}
                          {/* Added indicator for shared notes */}
                          {hasSharedNotes(session) && (
  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
    <CommentOutlined sx={{ fontSize: 16, mr: 0.5, color: '#1976d2' }} />
    <Typography variant="body2" color="primary" noWrap sx={{ maxWidth: '500px' }}>
      {session.notes.sharedNotes.length} therapist note(s)
    </Typography>
  </Box>
)}
                          {session.feedback && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Rating 
                                size="small" 
                                value={session.feedback.rating} 
                                readOnly 
                                sx={{ mr: 0.5 }}
                                emptyIcon={<StarOutline style={{ fontSize: 16 }} />}
                                icon={<Star style={{ fontSize: 16 }} />}
                              />
                              <Typography variant="body2" color="text.secondary">
                                Your feedback
                              </Typography>
                            </Box>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      {session.status === 'scheduled' && canCancelSession(session) && (
                        <IconButton
                          edge="end"
                          aria-label="cancel-session"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelSession(session);
                          }}
                          sx={{ color: '#d32f2f' }}
                          title="Cancel Session"
                        >
                          <CancelOutlined />
                        </IconButton>
                      )}
                      {canProvideFeedback(session) && (
                        <IconButton
                          edge="end"
                          aria-label="provide-feedback"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenFeedback(session);
                          }}
                          sx={{ color: session.feedback ? '#4caf50' : '#ff9800' }}
                          title={session.feedback ? "Update Feedback" : "Provide Feedback"}
                        >
                          <FeedbackOutlined />
                        </IconButton>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < sessions.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))
            )}
          </List>
        )}
      </Paper>

      {/* View Session Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseView} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Session Details
            <IconButton aria-label="close" onClick={handleCloseView}>
              <CloseOutlined />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSession && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                  {selectedSession.therapistId.fullname.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    Dr. {selectedSession.therapistId.fullname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedSession.therapistId.specialization}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight="medium">
                Session Information
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <EventNoteOutlined sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  {selectedSession.therapy}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <AccessTimeOutlined sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  {dayjs(selectedSession.scheduledTime).format('MMMM D, YYYY [at] h:mm A')}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Duration: {selectedSession.duration || 60} minutes
                </Typography>
              </Box>

              {/* Meeting Link in Detail View */}
              {shouldShowMeetingLink(selectedSession) && selectedSession.meetingLink && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Video Meeting
                  </Typography>
                  
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: '#e3f2fd', 
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <VideocamOutlined sx={{ fontSize: 20, mr: 1, color: '#1976d2' }} />
                      <Typography variant="body2">
                        Join your session using the link below:
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: 'white',
                      borderRadius: 1,
                      p: 1,
                      mt: 1
                    }}>
                      <Link
                        href={selectedSession.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          maxWidth: '80%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {selectedSession.meetingLink}
                      </Link>
                      <IconButton
                        size="small"
                        onClick={() => copyMeetingLink(selectedSession.meetingLink)}
                        title="Copy meeting link"
                      >
                        <ContentCopyOutlined fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      disableElevation
                      startIcon={<VideocamOutlined />}
                      sx={{ mt: 1 }}
                      onClick={() => window.open(selectedSession.meetingLink, '_blank')}
                    >
                      Join Meeting
                    </Button>
                  </Box>
                </>
              )}

              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      ml: 1,
                      px: 1,
                      py: 0.5,
                      bgcolor: selectedSession.status === 'completed' ? '#e0e0e0' :
                              selectedSession.status === 'cancelled' ? '#ffcdd2' : '#e3f2fd',
                      color: selectedSession.status === 'cancelled' ? '#c62828' : 'inherit',
                      borderRadius: 1
                    }}
                  >
                    {selectedSession.status.charAt(0).toUpperCase() + selectedSession.status.slice(1)}
                  </Typography>
                </Typography>
              </Box>

              {selectedSession.status === 'cancelled' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#fff8e1', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Cancelled by: {selectedSession.cancellation.cancelledBy === 'client' ? 'You' : 'Therapist'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cancelled on: {dayjs(selectedSession.cancellation.cancelledAt).format('MMMM D, YYYY')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reason: {selectedSession.cancellation.reason || 'No reason provided'}
                  </Typography>
                </Box>
              )}

              {/* Therapist's shared notes section */}
              {hasSharedNotes(selectedSession) && (
  <>
    <Divider sx={{ my: 2 }} />
    <Typography variant="subtitle1" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
      <CommentOutlined sx={{ fontSize: 20, mr: 1, color: '#1976d2' }} />
      Therapist's Notes
    </Typography>
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {selectedSession.notes.sharedNotes.map((note, index) => (
        <React.Fragment key={index}>
          <ListItem alignItems="flex-start">
            <ListItemText
              primary={note.content}
              secondary={dayjs(note.createdAt).format('MMMM D, YYYY h:mm A')}
              sx={{ whiteSpace: 'pre-wrap' }}
            />
          </ListItem>
          {index < selectedSession.notes.sharedNotes.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  </>
)}

              {/* Client's own notes section */}
              {selectedSession.notes?.patientNotes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight="medium">
                    Your Notes
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                    {selectedSession.notes.patientNotes}
                  </Typography>
                </>
              )}

              {/* Feedback section in details view */}
              {selectedSession.status === 'completed' && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Your Feedback
                    </Typography>
                    <Button 
                      startIcon={<FeedbackOutlined />}
                      variant="outlined" 
                      size="small"
                      onClick={() => {
                        handleCloseView();
                        handleOpenFeedback(selectedSession);
                      }}
                    >
                      {selectedSession.feedback ? "Update Feedback" : "Add Feedback"}
                    </Button>
                  </Box>
                  
                  {selectedSession.feedback ? (
                    <Box sx={{ mt: 2 }}>
                      <Rating 
                        value={selectedSession.feedback.rating} 
                        readOnly 
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedSession.feedback.comment || "No written feedback provided."}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Submitted on: {dayjs(selectedSession.feedback.createdAt).format('MMMM D, YYYY')}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        You haven't provided feedback for this session yet.
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          {selectedSession && selectedSession.status === 'scheduled' && canCancelSession(selectedSession) && (
            <Button
              onClick={() => {
                handleCloseView();
                handleCancelSession(selectedSession);
              }}
              color="error"
            >
              Cancel Session
            </Button>
          )}
          <Button onClick={handleCloseView} variant="contained" disableElevation>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Session Dialog */}
      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Cancel Session
            <IconButton aria-label="close" onClick={handleCloseCancelDialog}>
              <CloseOutlined />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSession && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Are you sure you want to cancel your session with Dr. {selectedSession.therapistId.fullname}?
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                {dayjs(selectedSession.scheduledTime).format('MMMM D, YYYY [at] h:mm A')}
              </Typography>

              <Box sx={{ mt: 2, p: 2, bgcolor: '#fff8e1', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Please note: Cancellations must be made at least 24 hours before the scheduled session.
                </Typography>
              </Box>

              <TextField
                label="Reason for cancellation"
                multiline
                rows={4}
                fullWidth
                margin="normal"
                variant="outlined"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this session..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>Keep Session</Button>
          <Button
            onClick={confirmCancel}
            variant="contained"
            color="error"
            disableElevation
          >
            Cancel Session
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={openFeedbackDialog} onClose={handleCloseFeedback} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {selectedSession?.feedback ? "Update Feedback" : "Session Feedback"}
            <IconButton aria-label="close" onClick={handleCloseFeedback}>
              <CloseOutlined />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSession && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Your session with Dr. {selectedSession.therapistId.fullname}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                {dayjs(selectedSession.scheduledTime).format('MMMM D, YYYY [at] h:mm A')}
                {" • "}{selectedSession.therapy}
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  How would you rate your session?
                </Typography>
                <Rating
                  value={feedbackRating}
                  onChange={(event, newValue) => {
                    setFeedbackRating(newValue);
                  }}
                  size="large"
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Share your experience (optional)"
                  multiline
                  rows={4}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="What went well? What could have been better? Would you recommend this therapist to others?"
                />

                <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Your feedback helps improve our services and assists other clients in finding the right therapist for their needs.
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFeedback}>Cancel</Button>
          <Button
            onClick={submitSessionFeedback}
            variant="contained"
            color="primary"
            disableElevation
            disabled={feedbackRating === 0}
          >
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar open={alertOpen} autoHideDuration={4000} onClose={handleCloseAlert}>
      <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
}