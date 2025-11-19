import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Divider,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel
} from '@mui/material';
import {
  FavoriteBorder,
  Favorite,
  ChatBubbleOutline,
  InsertPhoto,
  Videocam,
  MoreVert,
  Close,
  Send,
  Flag,
  Lightbulb,
  SelfImprovement
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useForumStore from '../store/forumStore';
import { useAuthStore } from '../store/authStore';
import useReportStore from '../store/reportStore';
import NavBar from '../components/homenav';

// Create a mental health-focused theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#5E8B7E', // Calming sage green
      light: '#A7C4BC',
      dark: '#2F5D62',
    },
    secondary: {
      main: '#E2D2F9', // Soft lavender
      light: '#F3EBFF',
      dark: '#BEA8E1',
    },
    success: {
      main: '#93C6B7', // Soft mint
    },
    error: {
      main: '#E98980', // Soft coral
    },
    warning: {
      main: '#F2D096', // Soft gold
    },
    info: {
      main: '#A2D5F2', // Soft blue
    },
    background: {
      default: '#F7F9F9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2F4858',
      secondary: '#5E6E77',
    },
  },
  typography: {
    fontFamily: '"Nunito", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontFamily: '"Montserrat", sans-serif',
    },
    h2: {
      fontWeight: 700,
      fontFamily: '"Montserrat", sans-serif',
    },
    h3: {
      fontWeight: 600,
      fontFamily: '"Montserrat", sans-serif',
    },
    h4: {
      fontWeight: 600,
      fontFamily: '"Montserrat", sans-serif',
    },
    h5: {
      fontWeight: 600,
      fontFamily: '"Montserrat", sans-serif',
    },
    h6: {
      fontWeight: 600,
      fontFamily: '"Montserrat", sans-serif',
    },
    subtitle1: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          textTransform: 'none',
          padding: '8px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(94, 139, 126, 0.2)',
          },
          fontWeight: 600,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#4D7668',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          borderRadius: 20,
          overflow: 'hidden',
          border: 'none',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-3px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            backgroundColor: '#F9FAFB',
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
            },
            '&:hover': {
              backgroundColor: '#F0F5F5',
            },
            '& fieldset': {
              borderColor: '#E2E8E8',
            },
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: '2px solid #FFFFFF',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#5E8B7E',
          '&:hover': {
            backgroundColor: 'rgba(94, 139, 126, 0.1)',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#EDF1F1',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: '"Montserrat", sans-serif',
          fontWeight: 600,
          fontSize: '1.25rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
  },
});

const normalizePost = (post) => ({
  ...post,
  likes: Array.isArray(post.likes) ? post.likes : [],
  comments: Array.isArray(post.comments) ? post.comments : [],
  user: post.user || { name: 'Unknown', role: 'Member' },
  createdAt: post.createdAt || new Date().toISOString()
});

// Inspirational quotes for the feed header
const inspirationalQuotes = [
  "Healing is not linear, but progress is still progress.",
  "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
  "You don't have to see the whole staircase, just take the first step.",
  "Be gentle with yourself, you're doing the best you can.",
  "The greatest glory in living lies not in never falling, but in rising every time we fall.",
  "Every day may not be good, but there's something good in every day.",
  "Your present circumstances don't determine where you can go; they merely determine where you start."
];

const MindShareFeed = () => {
  const {
    posts = [],
    loading: forumLoading,
    error: forumError,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    addComment,
    likePost
  } = useForumStore();

  const { 
    loading: reportLoading, 
    error: reportError,
    createReport
  } = useReportStore();

  const { user } = useAuthStore();
  const [mode, setMode] = useState('light');

  const [newPostContent, setNewPostContent] = useState('');
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentPost, setCurrentPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [optimisticLikes, setOptimisticLikes] = useState({});
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('harmful');
  const [reportDescription, setReportDescription] = useState('');
  const [postToReport, setPostToReport] = useState(null);
  const [reportMenuAnchorEl, setReportMenuAnchorEl] = useState(null);
  const [dailyQuote, setDailyQuote] = useState('');

  // Set a random inspirational quote
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
    setDailyQuote(inspirationalQuotes[randomIndex]);
  }, []);

  // Track loading state for all operations
  const loading = forumLoading || reportLoading;

  const normalizedPosts = posts.map(post => {
    const normalizedPost = normalizePost(post);
    if (optimisticLikes[post._id]) {
      normalizedPost.likes = optimisticLikes[post._id];
    }
    return normalizedPost;
  });

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (forumError) {
      setNotification({
        open: true,
        message: forumError,
        severity: 'error'
      });
    }
  }, [forumError]);

  useEffect(() => {
    if (reportError) {
      setNotification({
        open: true,
        message: reportError,
        severity: 'error'
      });
    }
  }, [reportError]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      await createPost({ 
        content: newPostContent, 
        user: user._id 
      });
      setNewPostContent('');
      setNotification({
        open: true,
        message: 'Your thoughts have been shared with the community.',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'We couldn\'t share your post at this time. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleEditPost = async () => {
    if (!currentPost || !editContent.trim()) return;

    try {
      await updatePost(currentPost._id, { content: editContent });
      setEditDialogOpen(false);
      setNotification({
        open: true,
        message: 'Your post has been updated.',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'We couldn\'t update your post. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleDeletePost = async () => {
    if (!currentPost) return;

    try {
      await deletePost(currentPost._id);
      setDeleteDialogOpen(false);
      setNotification({
        open: true,
        message: 'Your post has been removed.',
        severity: 'info'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'We couldn\'t delete your post. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentContent.trim()) return;

    try {
      await addComment(postId, { 
        content: commentContent, 
        user: user._id
      });
      setCommentContent('');
      setActiveCommentId(null);
      setNotification({
        open: true,
        message: 'Your comment has been added.',
        severity: 'success'
      });
      await fetchPosts();
    } catch (err) {
      setNotification({
        open: true,
        message: 'We couldn\'t add your comment. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const post = normalizedPosts.find(p => p._id === postId);

      if (!post) return;
      
      const userLiked = post.likes.includes(user?._id);
      const updatedLikes = userLiked
        ? post.likes.filter(id => id !== user?._id)
        : [...post.likes, user?._id];
        
      setOptimisticLikes(prev => ({
        ...prev,
        [postId]: updatedLikes
      }));
      
      await likePost(postId);
      await fetchPosts();
      
      setOptimisticLikes(prev => {
        const newState = {...prev};
        delete newState[postId];
        return newState;
      });
    } catch (err) {
      console.log(err);
      setOptimisticLikes(prev => {
        const newState = {...prev};
        delete newState[postId];
        return newState;
      });
      setNotification({
        open: true,
        message: 'We couldn\'t process your reaction. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleMenuOpen = (event, post) => {
    setAnchorEl(event.currentTarget);
    setCurrentPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    setEditContent(currentPost.content);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const isPostLikedByUser = (post) => {
    return post.likes.includes(user?._id);
  };

  const handleReportMenuOpen = (event, post) => {
    setReportMenuAnchorEl(event.currentTarget);
    setPostToReport(post);
  };

  const handleReportMenuClose = () => {
    setReportMenuAnchorEl(null);
  };

  const handleReportDialogOpen = () => {
    setReportDialogOpen(true);
    handleReportMenuClose();
  };

  const handleReportDialogClose = () => {
    setReportDialogOpen(false);
    setReportReason('harmful');
    setReportDescription('');
    setPostToReport(null);
  };

  const handleSubmitReport = async () => {
    if (!postToReport) return;
    
    try {
      await createReport(
        postToReport._id,
        reportReason,
        reportDescription
      );
      
      handleReportDialogClose();
      setNotification({
        open: true,
        message: 'Thank you for helping keep our community safe. Our team will review this report.',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'We couldn\'t submit your report. Please try again.',
        severity: 'error'
      });
    }
  };

  // Function to format date in a friendly way
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      // Yesterday
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      // Within a week
      return date.toLocaleDateString([], { weekday: 'long' }) + 
             ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      // Older
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
      }) + ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        bgcolor: 'background.default',
        minHeight: '100vh',
        pb: 4
      }}>
        {/* Use the NavBar component */}
        <NavBar mode={mode} setMode={setMode} />

        {/* Main Content */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: { xs: 2, sm: 4 },
          maxWidth: 700,
          mx: 'auto',
          mt: 4
        }}>
          {/* Daily Inspiration */}
          <Card sx={{ mb: 4, width: '100%', overflow: 'visible' }}>
            <Box sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, #5E8B7E 0%, #2F5D62 100%)',
              color: 'white',
              position: 'relative',
              borderRadius: '20px 20px 0 0',
            }}>
              <Box sx={{ 
                position: 'absolute', 
                top: -20, 
                left: 30, 
                backgroundColor: '#F2D096', 
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.15)'
              }}>
                <Lightbulb sx={{ color: '#2F4858' }} />
              </Box>
              <Typography variant="h6" sx={{ mb: 1, pt: 1, fontWeight: 700 }}>
                Today's Insight
              </Typography>
              <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 1 }}>
                "{dailyQuote}"
              </Typography>
            </Box>
          </Card>

          {/* Create Post Card */}
          <Card sx={{ mb: 4, width: '100%', overflow: 'visible' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.dark', fontWeight: 600 }}>
                Share Your Thoughts
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Avatar 
                  src={user?.avatar || ''}
                  sx={{ width: 46, height: 46 }}
                />
                <TextField
                  fullWidth
                  placeholder="What's on your mind today?"
                  variant="outlined"
                  multiline
                  rows={3}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    }
                  }}
                />
              </Box>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() || loading}
                  startIcon={<SelfImprovement />}
                  sx={{ px: 4 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Share'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Feed Posts */}
          {loading && normalizedPosts.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              mt: 6,
              p: 4,
              backgroundColor: 'rgba(94, 139, 126, 0.05)',
              borderRadius: 4
            }}>
              <CircularProgress color="primary" size={40} thickness={4} />
              <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                Loading community posts...
              </Typography>
            </Box>
          ) : normalizedPosts.length > 0 ? (
            normalizedPosts.map(post => (
              <Card key={post._id} sx={{ mb: 3, width: '100%' }}>
                <CardHeader
                  avatar={
                    <Avatar 
                      src={post.author?.avatar || ''} 
                      sx={{ width: 48, height: 48 }}
                    />
                  }
                  action={
                    <Box sx={{ display: 'flex' }}>
                      {post.user?._id !== user?._id && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleReportMenuOpen(e, post)}
                          sx={{ mr: 1, color: 'text.secondary' }}
                        >
                          <Flag fontSize="small" />
                        </IconButton>
                      )}
                      {post.author?._id === user?._id && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, post)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <MoreVert />
                        </IconButton>
                      )}
                    </Box>
                  }
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {post.user.fullname}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="primary.main" 
                        sx={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 600, 
                          backgroundColor: 'primary.light',
                          color: 'primary.dark',
                          px: 1,
                          py: 0.2,
                          borderRadius: 10
                        }}
                      >
                        {post.user.role}
                      </Typography>
                    </Box>
                  }
                  subheader={
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      {formatDate(post.createdAt)}
                    </Typography>
                  }
                  sx={{ pb: 0 }}
                />
                <CardContent sx={{ py: 2 }}>
                  <Typography 
                    variant="body1" 
                    paragraph 
                    sx={{ 
                      whiteSpace: 'pre-line',
                      color: 'text.primary',
                      fontSize: '0.95rem',
                      lineHeight: 1.7
                    }}
                  >
                    {post.content}
                  </Typography>
                </CardContent>

                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  px: 3,
                  pb: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {post.likedBy?.length || post.likes?.length || 0} 
                      {post.likes?.length === 1 ? ' support' : ' supports'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {post.comments.length} 
                    {post.comments.length === 1 ? ' response' : ' responses'}
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  py: 1.5
                }}>
                  <Button
                    startIcon={isPostLikedByUser(post) ? <Favorite color="error" /> : <FavoriteBorder />}
                    onClick={() => handleLikePost(post._id)}
                    sx={{ 
                      color: isPostLikedByUser(post) ? 'error.main' : 'text.secondary' 
                    }}
                  >
                    Support
                  </Button>
                  <Button
                    startIcon={<ChatBubbleOutline />}
                    onClick={() => setActiveCommentId(activeCommentId === post._id ? null : post._id)}
                    sx={{ color: 'text.secondary' }}
                  >
                    Respond
                  </Button>
                </Box>

                {(post.comments.length > 0 || activeCommentId === post._id) && (
                  <Box sx={{ bgcolor: 'rgba(167, 196, 188, 0.1)', py: 2, px: 3 }}>
                    {post.comments.length > 0 && (
                      <List disablePadding>
                        {post.comments.map(comment => (
                          <ListItem
                            key={comment._id}
                            alignItems="flex-start"
                            sx={{ px: 0, pb: 1.5, pt: 1.5 }}
                          >
                            <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
                              <Avatar 
                                src={comment.user?.avatar || ''} 
                                sx={{ width: 36, height: 36 }}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2,
                                    bgcolor: 'background.paper',
                                    borderRadius: 3,
                                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)'
                                  }}
                                >
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                                    {comment.userId?.fullname || 'Community Member'}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                                    {comment.content}
                                  </Typography>
                                </Paper>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ pl: 1, display: 'block', mt: 0.5 }}
                                >
                                  {formatDate(comment.createdAt)}
                                </Typography>
                              </Box>
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                    )}

                    {activeCommentId === post._id && (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        mt: post.comments.length > 0 ? 2 : 0
                      }}>
                        <Avatar src={user?.avatar || ''} sx={{ width: 36, height: 36 }} />
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Share your thoughts..."
                          variant="outlined"
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <IconButton
                                size="small"
                                color="primary"
                                disabled={!commentContent.trim() || loading}
                                onClick={() => handleAddComment(post._id)}
                                sx={{ 
                                  backgroundColor: commentContent.trim() ? 'primary.main' : 'transparent',
                                  color: commentContent.trim() ? 'white' : 'primary.main',
                                  '&:hover': {
                                    backgroundColor: commentContent.trim() ? 'primary.dark' : 'transparent',
                                  },
                                  '&.Mui-disabled': {
                                    backgroundColor: 'transparent',
                                  }
                                }}
                              >
                                {loading ? <CircularProgress size={18} color="inherit" /> : <Send fontSize="small" />}
                              </IconButton>
                            )
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                )}
              </Card>
            ))
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8, 
              px: 3, 
              bgcolor: 'rgba(167, 196, 188, 0.1)',
              borderRadius: 4,
              width: '100%'
            }}>
              <SelfImprovement sx={{ fontSize: 60, color: 'primary.light', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.dark' }}>
                No Posts Yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Be the first to share your thoughts with our supportive community.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => document.getElementById('new-post-input')?.focus()}
                startIcon={<SelfImprovement />}
              >
                Start Sharing
              </Button>
            </Box>
          )}
        </Box>

        {/* Menu for post actions */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEditClick}>Edit Post</MenuItem>
          <MenuItem onClick={handleDeleteClick}>Delete Post</MenuItem>
        </Menu>

        {/* Menu for reporting posts */}
        <Menu
          anchorEl={reportMenuAnchorEl}
          open={Boolean(reportMenuAnchorEl)}
          onClose={handleReportMenuClose}
        >
          <MenuItem onClick={handleReportDialogOpen}>Report Post</MenuItem>
        </Menu>

        {/* Edit Post Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Edit Your Post
            <IconButton
              aria-label="close"
              onClick={() => setEditDialogOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={5}
              variant="outlined"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleEditPost} 
              variant="contained" 
              color="primary"
              disabled={!editContent.trim() || loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Post Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>
            Delete Post
            <IconButton
              aria-label="close"
              onClick={() => setDeleteDialogOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleDeletePost} 
              variant="contained" 
              color="error"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Report Post Dialog */}
        <Dialog
          open={reportDialogOpen}
          onClose={handleReportDialogClose}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Report Post
            <IconButton
              aria-label="close"
              onClick={handleReportDialogClose}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Thank you for looking out for our community. Please let us know why you're reporting this post.
            </Typography>
            
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Reason for reporting</FormLabel>
              <RadioGroup
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <FormControlLabel value="harmful" control={<Radio />} label="Contains harmful content" />
                <FormControlLabel value="misinformation" control={<Radio />} label="Contains misinformation" />
                <FormControlLabel value="inappropriate" control={<Radio />} label="Inappropriate for our community" />
                <FormControlLabel value="spam" control={<Radio />} label="Spam or advertising" />
                <FormControlLabel value="other" control={<Radio />} label="Other reason" />
              </RadioGroup>
            </FormControl>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              label="Additional details (optional)"
              placeholder="Please provide any additional context that might help our review team..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleReportDialogClose} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReport} 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Report'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar 
          open={notification.open} 
          autoHideDuration={6000} 
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            variant="filled"
            elevation={6}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default MindShareFeed;