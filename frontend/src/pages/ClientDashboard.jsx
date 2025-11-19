import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  CircularProgress,
  Stack,
  Alert
} from '@mui/material';
import dayjs from 'dayjs';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Book as JournalIcon,
  Timeline as MoodTrackerIcon,
  SentimentSatisfiedAlt as MoodIcon,
  Timer as TimerIcon,
  CheckCircle as CompletedIcon,
  LocalFireDepartment as StreakIcon,
  Favorite as HeartIcon,
  Create as WriteIcon
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import useClientSessionStore from '../store/clientStore';
import useJournalStore from '../store/journalStore.js';
import useMoodStore from '../store/moodStore.js';
import DashboardLayout from '../clientDash/layout';
import TopBar from '../clientDash/topbar';
import MoodTimeline from '../clientDash/moodVisulization';

const Dashboard = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState({
    client: false,
    sessions: false,
    journals: false,
    moods: false
  });

  const { 
    client, 
    sessions = [], 
    loading: sessionLoading, 
    error: sessionError, 
    fetchSessions, 
    fetchAuthenticatedClient 
  } = useClientSessionStore();
  
  const { 
    journals = [], 
    isLoading: journalLoading, 
    error: journalError, 
    fetchJournals 
  } = useJournalStore();
  
  const { 
    moodTracker = [], 
    loading: moodLoading, 
    error: moodError, 
    fetchMoods 
  } = useMoodStore();

  // Initial client load
  useEffect(() => {
    const loadClient = async () => {
      try {
        await fetchAuthenticatedClient();
        setDataLoaded(prev => ({...prev, client: true}));
      } catch (error) {
        console.error("Error loading client data:", error);
      }
    };
    
    loadClient();
  }, [fetchAuthenticatedClient]);

  // Load dependent data after client is loaded
  useEffect(() => {
    const loadDependentData = async () => {
      if (!client?._id) return;
      
      try {
        // Load sessions, journals, and moods in parallel since they depend on client but not on each other
        const [sessionsPromise, journalsPromise, moodsPromise] = await Promise.allSettled([
          fetchSessions(client._id),
          fetchJournals(),
          fetchMoods()
        ]);
        
        setDataLoaded(prev => ({
          ...prev,
          sessions: sessionsPromise.status === 'fulfilled',
          journals: journalsPromise.status === 'fulfilled',
          moods: moodsPromise.status === 'fulfilled'
        }));
      } catch (error) {
        console.error("Error loading dependent data:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    if (client?._id) {
      loadDependentData();
    }
  }, [client, fetchSessions, fetchJournals, fetchMoods]);

  // Update initial loading state
  useEffect(() => {
    if (dataLoaded.client && dataLoaded.sessions && dataLoaded.journals && dataLoaded.moods) {
      setIsInitialLoading(false);
    }
  }, [dataLoaded]);

  // Calculate streak based on journal entries and get recent journals
  const { currentStreak, recentJournals } = useMemo(() => {
    if (!journals || !journals.length) return { currentStreak: 0, recentJournals: [] };

    // Sort journals by date (newest first)
    const sortedJournals = [...journals].sort((a, b) => 
      new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
    );

    // Get the 3 most recent journals for display
    const recentJournals = sortedJournals.slice(0, 3);

    // Calculate streak
    let streak = 0;
    let currentDate = dayjs();
    const journalDates = new Set(
      sortedJournals.map(journal => 
        dayjs(journal.createdAt || journal.date).format('YYYY-MM-DD')
      )
    );

    // Check yesterday first to see if the streak is active
    const yesterday = currentDate.subtract(1, 'day').format('YYYY-MM-DD');
    const hasEntryYesterday = journalDates.has(yesterday);
    
    // If no entry yesterday, check if there's an entry today to start a new streak
    const today = currentDate.format('YYYY-MM-DD');
    const hasEntryToday = journalDates.has(today);
    
    if (!hasEntryYesterday && !hasEntryToday) {
      return { currentStreak: 0, recentJournals };
    }
    
    // If there's an entry today, count it in the streak
    if (hasEntryToday) {
      streak = 1;
      currentDate = currentDate.subtract(1, 'day');
    }
    
    // Count consecutive days backwards
    let checkDate = currentDate;
    let daysBack = hasEntryToday ? 1 : 0; // Start from yesterday if entry today exists
    
    while (true) {
      const dateString = checkDate.format('YYYY-MM-DD');
      if (journalDates.has(dateString)) {
        streak++;
        checkDate = checkDate.subtract(1, 'day');
      } else {
        break;
      }
    }

    return { currentStreak: streak, recentJournals };
  }, [journals]);

  // Get current mood from the most recent mood entry
  const currentMood = useMemo(() => {
    if (!moodTracker || moodTracker.length === 0) return { text: 'Neutral', value: 3 };

    try {
      // Sort mood entries by timestamp (newest first)
      const sortedMoods = [...moodTracker].sort((a, b) => 
        new Date(b.timestamp || b.createdAt || Date.now()) - 
        new Date(a.timestamp || a.createdAt || Date.now())
      );

      // Get the most recent mood
      const latestMood = sortedMoods[0]?.mood || 3;
      let moodText = 'Neutral';
      
      switch (Number(latestMood)) {
        case 1: moodText = 'Very Negative'; break;
        case 2: moodText = 'Negative'; break;
        case 3: moodText = 'Neutral'; break;
        case 4: moodText = 'Positive'; break;
        case 5: moodText = 'Very Positive'; break;
        default: moodText = 'Neutral';
      }

      return { text: moodText, value: Number(latestMood) };
    } catch (error) {
      console.error("Error calculating current mood:", error);
      return { text: 'Neutral', value: 3 };
    }
  }, [moodTracker]);

  // Format journals for display
  const formattedRecentJournals = useMemo(() => {
    if (!recentJournals || recentJournals.length === 0) return [];
    
    return recentJournals.map(journal => ({
      title: journal.title || 'Journal Entry',
      date: dayjs(journal.createdAt || journal.date).format('MMM D, YYYY'),
      content: journal.content 
        ? journal.content.substring(0, 80) + (journal.content.length > 80 ? '...' : '') 
        : 'No content'
    }));
  }, [recentJournals]);

  // Determine mood color for display
  const getMoodColor = (mood) => {
    switch (mood) {
      case 'Very Negative': return '#D32F2F';
      case 'Negative': return '#F57C00';
      case 'Neutral': return '#FFC107';
      case 'Positive': return '#4CAF50';
      case 'Very Positive': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const statsData = useMemo(() => [
    { 
      title: 'Current Mood', 
      value: currentMood.text, 
      icon: <MoodIcon />, 
      color: getMoodColor(currentMood.text) 
    },
    { 
      title: 'Journal Entries', 
      value: (journals?.length || 0).toString(), 
      icon: <JournalIcon /> 
    },
    { 
      title: 'Sessions Complete', 
      value: (sessions?.filter(s => s?.status === 'completed')?.length || 0).toString(), 
      icon: <CompletedIcon /> 
    },
    { 
      title: 'Streak', 
      value: `${currentStreak} days`, 
      icon: <StreakIcon />, 
      color: '#FF9800' 
    }
  ], [currentMood, journals, sessions, currentStreak]);

  const wellnessTips = [
    'Practice deep breathing exercises for 5 minutes',
    'Write down three things you\'re grateful for'
  ];

  const drawerWidth = 240;

  // Check for any loading state
  const isLoading = isInitialLoading || sessionLoading || journalLoading || moodLoading;
  
  // Check for any error 
  const hasError = sessionError || journalError || moodError;
  const errorMessage = sessionError || journalError || moodError;

  // Filter scheduled sessions
  const upcomingSessions = useMemo(() => {
    return sessions?.filter(session => session?.status === 'scheduled') || [];
  }, [sessions]);

  if (isInitialLoading) {
    return (
      <DashboardLayout>
        <TopBar drawerWidth={drawerWidth} />
        <Box sx={{ 
          mt: 8, 
          p: 3, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '70vh' 
        }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading your dashboard...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <TopBar drawerWidth={drawerWidth} />

      {/* Content container - adds top padding to account for fixed AppBar */}
      <Box sx={{ mt: 8, p: 3 }}>
        {hasError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error loading data: {errorMessage}
          </Alert>
        )}
      
        {/* Welcome Message */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Welcome back, {client?.fullname || "Guest"}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Track your progress and maintain your mental well-being
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)'}, gap: 2, mb: 4 }}>
          {statsData.map((stat, index) => (
            <Card key={index} sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {React.cloneElement(stat.icon, { sx: { color: stat.color } })}
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {stat.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Two Column Layout */}
        <Box sx={{ display: 'grid', gridTemplateColumns: {xs: '1fr', md: '3fr 2fr'}, gap: 3 }}>
          {/* Left Column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Mood Timeline */}
            <Card sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Mood Timeline</Typography>
                <MoodTimeline 
                  moodData={moodTracker || []} 
                  isLoading={moodLoading} 
                  error={moodError} 
                  daysToShow={14} 
                />
              </CardContent>
            </Card>

            {/* Recent Journal Entries */}
            <Card sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Recent Journal Entries</Typography>
                {journalLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : journalError ? (
                  <Typography color="error">{journalError}</Typography>
                ) : formattedRecentJournals.length > 0 ? (
                  formattedRecentJournals.map((entry, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{entry.title}</Typography>
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                        {entry.date}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {entry.content}
                      </Typography>
                      {index < formattedRecentJournals.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No journal entries yet. Start writing today!
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Right Column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Upcoming Sessions */}
            <Card sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Upcoming Sessions</Typography>
                {sessionLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : sessionError ? (
                  <Typography color="error">{sessionError}</Typography>
                ) : (
                  <Stack spacing={2}>
                    {upcomingSessions.length > 0 ? (
                      upcomingSessions.map((session) => (
                        <Box key={session._id} sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 40, height: 40, bgcolor: '#f0f0f0', color: 'text.primary', mr: 2 }}>
                            {session.therapistId?.fullname ? session.therapistId.fullname.charAt(0) : '?'}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              Dr. {session.therapistId?.fullname || "Unknown"} - {session.status}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Therapy Session
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {dayjs(session.scheduledTime).format('YYYY-MM-DD h:mm A')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {session.duration} minutes
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No upcoming sessions scheduled.
                      </Typography>
                    )}
                  </Stack>
                )}
              </CardContent>
            </Card>

            {/* Daily Wellness Tips */}
            <Card sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Daily Wellness Tips</Typography>
                {wellnessTips.map((tip, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    {index === 0 ? <HeartIcon color="error" /> : <WriteIcon color="primary" />}
                    <Typography variant="body2">{tip}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;