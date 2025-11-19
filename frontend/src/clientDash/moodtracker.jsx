import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Zoom,
  Fade,
  Paper,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { keyframes } from '@emotion/react';
import Layout from './layout';
import useClientSessionStore from '../store/clientStore';
import useMoodStore from '../store/moodStore.js'; // Import the Zustand store

// Custom styled components
const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const MotionBox = motion(Box);

function MoodTracker() {
  const theme = useTheme();
  const [selectedMood, setSelectedMood] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);
  const {user} = useClientSessionStore();
  
  // Use the Zustand store
  const { moodTracker, loading, error, fetchMoods, addMood, deleteMood } = useMoodStore();

  // Fetch moods when component mounts
  useEffect(() => {
    fetchMoods();
  }, [fetchMoods]);

  const moodOptions = [
    { 
      value: 1, 
      icon: <SentimentVeryDissatisfiedIcon fontSize="large" />, 
      color: '#d32f2f',
      gradient: 'linear-gradient(135deg, #d32f2f 30%, #ff6659 90%)',
      label: 'Very Sad'
    },
    { 
      value: 2, 
      icon: <SentimentDissatisfiedIcon fontSize="large" />, 
      color: '#f57c00',
      gradient: 'linear-gradient(135deg, #f57c00 30%, #ffad42 90%)',
      label: 'Sad'
    },
    { 
      value: 3, 
      icon: <SentimentNeutralIcon fontSize="large" />, 
      color: '#ffd600',
      gradient: 'linear-gradient(135deg, #ffd600 30%, #ffea00 90%)',
      label: 'Neutral'
    },
    { 
      value: 4, 
      icon: <SentimentSatisfiedAltIcon fontSize="large" />, 
      color: '#4caf50',
      gradient: 'linear-gradient(135deg, #4caf50 30%, #80e27e 90%)',
      label: 'Happy'
    },
    { 
      value: 5, 
      icon: <SentimentVerySatisfiedIcon fontSize="large" />, 
      color: '#2196f3',
      gradient: 'linear-gradient(135deg, #2196f3 30%, #6ec6ff 90%)',
      label: 'Overjoyed'
    }
  ];

  // Helper function to get mood icon
  const getMoodIcon = (moodValue) => {
    const option = moodOptions.find(opt => opt.value === moodValue);
    return option ? option.icon : <SentimentNeutralIcon fontSize="medium" />;
  };

  // Helper function to get mood color
  const getMoodColor = (moodValue) => {
    const option = moodOptions.find(opt => opt.value === moodValue);
    return option ? option.color : '#ffd600';
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMood) return;

    // Call the Zustand store's addMood function
    addMood(selectedMood, description);
    setSubmitted(true);

    // Reset form after animation
    setTimeout(() => {
      setSelectedMood('');
      setDescription('');
      setSubmitted(false);
    }, 1500);
  };

  const handleDeleteMood = (moodId) => {
    deleteMood(moodId);
  };

  const toggleViewHistory = () => {
    setViewHistory(!viewHistory);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const drawerWidth = 240;

  return (
    <Layout drawerWidth={drawerWidth}
      user={user}>
      <Box sx={{ mt: 8, p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Fade in={true} timeout={800}>
          <Card 
            elevation={6} 
            sx={{ 
              mb: 4, 
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)',
              overflow: 'visible'
            }}
          >
            <CardContent sx={{ pb: 4 }}>
              <Typography 
                variant="h4" 
                component="h2" 
                gutterBottom 
                sx={{ 
                  textAlign: 'center', 
                  fontWeight: 600,
                  color: theme.palette.primary.dark,
                  mb: 3
                }}
              >
                How are you feeling today?
              </Typography>

              {!viewHistory ? (
                <form onSubmit={handleSubmit}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    flexWrap: 'wrap', 
                    gap: 2, 
                    mb: 4 
                  }}>
                    {moodOptions.map((option, index) => (
                      <Zoom 
                        in={true} 
                        style={{ transitionDelay: `${index * 100}ms` }} 
                        key={option.value}
                      >
                        <MotionBox
                          component={Paper}
                          elevation={selectedMood === option.value ? 8 : 2}
                          whileHover={{ 
                            scale: 1.1, 
                            boxShadow: "0px 10px 25px -5px rgba(0,0,0,0.1)" 
                          }}
                          whileTap={{ scale: 0.95 }}
                          sx={{
                            p: 2,
                            borderRadius: 4,
                            width: 100,
                            height: 110,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            background: selectedMood === option.value ? option.gradient : '#fff',
                            border: selectedMood === option.value 
                              ? `2px solid ${option.color}` 
                              : '1px solid rgba(0,0,0,0.08)',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                              background: option.gradient,
                            }
                          }}
                          onClick={() => handleMoodSelect(option.value)}
                        >
                          <Box 
                            sx={{ 
                              color: option.color,
                              fontSize: '2.5rem',
                              mb: 1,
                              animation: selectedMood === option.value 
                                ? `${pulse} 2s infinite ease-in-out` 
                                : 'none'
                            }}
                          >
                            {option.icon}
                          </Box>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: selectedMood === option.value ? 600 : 400,
                              color: selectedMood === option.value ? '#fff' : 'text.primary'
                            }}
                          >
                            {option.label}
                          </Typography>
                        </MotionBox>
                      </Zoom>
                    ))}
                  </Box>

                  <Fade in={!!selectedMood} timeout={500}>
                    <Box sx={{ mt: 2, mb: 3 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="What's on your mind? (optional)"
                        variant="outlined"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        margin="normal"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s',
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                          '& label.Mui-focused': {
                            color: theme.palette.primary.dark,
                          },
                        }}
                        InputProps={{
                          sx: {
                            backgroundColor: 'rgba(255,255,255,0.8)',
                          }
                        }}
                      />
                    </Box>
                  </Fade>

                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <MotionBox
                      component="div"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={!selectedMood || submitted || loading}
                        sx={{ 
                          mt: 2,
                          px: 4,
                          py: 1.5,
                          borderRadius: 8,
                          fontWeight: 600,
                          fontSize: '1rem',
                          textTransform: 'none',
                          boxShadow: '0px 8px 20px rgba(98, 0, 238, 0.2)',
                          background: 'linear-gradient(45deg, #6200ee 30%, #9c47ff 90%)',
                          transition: 'all 0.3s',
                          '&:hover': {
                            boxShadow: '0px 10px 25px rgba(98, 0, 238, 0.3)',
                          },
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : (submitted ? 'Saved!' : 'Save Mood')}
                      </Button>
                    </MotionBox>

                    <MotionBox
                      component="div"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        variant="outlined"
                        color="primary"
                        size="large"
                        onClick={toggleViewHistory}
                        sx={{ 
                          mt: 2,
                          px: 4,
                          py: 1.5,
                          borderRadius: 8,
                          fontWeight: 600,
                          fontSize: '1rem',
                          textTransform: 'none',
                          transition: 'all 0.3s',
                        }}
                      >
                        View History
                      </Button>
                    </MotionBox>
                  </Box>
                </form>
              ) : (
                <Box>
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom 
                    sx={{ 
                      textAlign: 'center',
                      fontWeight: 500,
                      mb: 3
                    }}
                  >
                    Your Mood History
                  </Typography>

                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : moodTracker.length > 0 ? (
                    <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
                      {moodTracker.map((entry, index) => (
                        <React.Fragment key={entry._id || index}>
                          <ListItem
                            secondaryAction={
                              <IconButton 
                                edge="end" 
                                aria-label="delete"
                                onClick={() => handleDeleteMood(entry._id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            }
                            sx={{
                              borderLeft: `4px solid ${getMoodColor(entry.mood)}`,
                              my: 1,
                              mx: 2,
                              borderRadius: 1,
                              bgcolor: 'rgba(255, 255, 255, 0.9)',
                              boxShadow: '0px 2px 5px rgba(0,0,0,0.05)',
                              '&:hover': {
                                bgcolor: 'rgba(248, 248, 248, 0.9)',
                              }
                            }}
                          >
                            <ListItemIcon sx={{ color: getMoodColor(entry.mood) }}>
                              {getMoodIcon(entry.mood)}
                            </ListItemIcon>
                            <ListItemText
                              primary={entry.mood}
                              secondary={
                                <>
                                  <Typography component="span" variant="body2" color="text.primary">
                                    {entry.description || 'No description provided'}
                                  </Typography>
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    {entry.timestamp ? formatDate(entry.timestamp) : 'No date recorded'}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                          {index < moodTracker.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', p: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No mood entries yet. Start tracking your mood!
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <MotionBox
                      component="div"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        variant="outlined"
                        color="primary"
                        size="large"
                        onClick={toggleViewHistory}
                        sx={{ 
                          px: 4,
                          py: 1.5,
                          borderRadius: 8,
                          fontWeight: 600,
                          fontSize: '1rem',
                          textTransform: 'none',
                        }}
                      >
                        Track New Mood
                      </Button>
                    </MotionBox>
                  </Box>
                </Box>
              )}

              {submitted && !viewHistory && (
                <Fade in={submitted}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    mt: 3,
                    color: 'success.main',
                    fontWeight: 500
                  }}>
                    <Typography variant="body1">
                      Your mood has been recorded! 
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Thank you for sharing how you feel.
                    </Typography>
                  </Box>
                </Fade>
              )}
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </Layout>
  );
}

export default MoodTracker;