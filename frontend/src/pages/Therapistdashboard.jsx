import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  Stack,
  Box,
  Card,
  CardContent,
  Rating
} from '@mui/material';
import {
  HomeOutlined,
  CalendarMonthOutlined,
  PeopleOutlined,
  MessageOutlined,
  AccessTimeOutlined,
  CheckCircleOutlined,
  StarOutlined,
  FeedbackOutlined
} from '@mui/icons-material';

import useTherapistStore from '../store/therapistStore';
import dayjs from "dayjs";
import Layout from '../therapistDash/layout';
import AvailabilitySection from '../therapistDash/setAvailability';
import useFeedbackStore from '../store/feedbackStore';

const drawerWidth = 240;

export default function HealNestDashboard() {
  const [selectedTab, setSelectedTab] = useState('Dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const {
    loading,
    error,
    fetchTherapists,
    fetchAuthenticatedAvailability,
    fetchAuthenticatedTherapist,
    therapist,
    fetchSessions,
    sessions = [], 
  } = useTherapistStore();

  const {
    fetchCurrentTherapistFeedback, 
    feedbacks = [], 
    loading: feedbackLoading, 
    error: feedbackError 
  } = useFeedbackStore();

  // Load data in sequence to ensure proper dependencies
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // First, fetch the authenticated therapist
        await fetchAuthenticatedTherapist();
      } catch (error) {
        console.error("Error fetching therapist data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [fetchAuthenticatedTherapist]);

  // Load dependent data after therapist is loaded
  useEffect(() => {
    const loadDependentData = async () => {
      if (therapist?._id) {
        try {
          // Load these in parallel since they depend on therapist but not on each other
          await Promise.all([
            fetchAuthenticatedAvailability(),
            fetchSessions(),
            fetchCurrentTherapistFeedback()
          ]);
        } catch (error) {
          console.error("Error fetching dependent data:", error);
        }
      }
    };
    
    if (therapist?._id) {
      loadDependentData();
    }
  }, [therapist, fetchAuthenticatedAvailability, fetchSessions, fetchCurrentTherapistFeedback]);



  // Filter sessions to show only scheduled sessions

const scheduledSessions = sessions && sessions.length > 0 
    ? sessions.filter(session => session.status === 'scheduled')
    : [];

const completedSessions = sessions && sessions.length > 0
    ? sessions.filter(session => session.status === 'completed')
    : [];


   // Calculate unique clients with safety checks
const uniqueClientIds = sessions && sessions.length > 0
    ? [...new Set(sessions
        .filter(session => session.clientId && session.clientId._id)
        .map(session => session.clientId._id))]
    : [];

const totalPatients = uniqueClientIds.length;
 // Sort feedbacks by most recent with safety checks
  const recentFeedbacks = feedbacks && feedbacks.length > 0
    ? [...feedbacks]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3) // Display only the 3 most recent feedbacks
    : [];

  // Calculate stats
  const stats = {
    upcomingSessions: scheduledSessions.length ,
    completedSessions: completedSessions.length ,
    totalPatients: totalPatients ,
    averageRating: feedbacks.length > 0 
      ? (feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length).toFixed(1)
      : 0
  };

  const dashboardContent = (
    <>
      {/* Welcome Message */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Welcome, {therapist?.fullname || 'Guest'}!
        </Typography>
      </Box>
      
      {/* Statistics Grid */}
      <Grid container spacing={3} sx={{ mb: 1 }}>
        <Grid item xs={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarMonthOutlined sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Upcoming Sessions
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight="bold">
              {stats.upcomingSessions}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircleOutlined sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Completed Sessions
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight="bold">
              {stats.completedSessions} 
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleOutlined sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Total Patients
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight="bold">
              {stats.totalPatients}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <StarOutlined sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Average Rating
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight="bold">
              {stats.averageRating}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    
      <Grid container spacing={3}>
        {/* Upcoming Sessions Column */}
        <Grid item xs={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="medium">
                Upcoming Sessions
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
              >
                New Session
              </Button>
            </Box>

            <Stack spacing={3}>
              {loading ? (
                <Typography variant="body1" color="text.secondary">
                  Loading sessions...
                </Typography>
              ) : !scheduledSessions || scheduledSessions.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  No scheduled sessions.
                </Typography>
              ) : (
                scheduledSessions.map(session => (
                  <Box key={session._id} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: '#f0f0f0', color: 'text.primary', mr: 2 }}>
                      {session.clientId && session.clientId.fullname ? 
                        session.clientId.fullname.charAt(0) : '?'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {session.clientId && session.clientId.fullname ? 
                          session.clientId.fullname : 'Unknown Client'} {session.status}
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
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Recent Feedbacks Column */}
        <Grid item xs={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="medium">
                Recent Feedbacks
              </Typography>
              <FeedbackOutlined sx={{ color: 'text.secondary' }} />
            </Box>

            <Stack spacing={3}>
              {feedbackLoading ? (
                <Typography variant="body1" color="text.secondary">
                  Loading feedbacks...
                </Typography>
              ) : recentFeedbacks.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  No recent feedbacks.
                </Typography>
              ) : (
                recentFeedbacks.map(feedback => (
                  <Box 
                    key={feedback._id} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      borderBottom: '1px solid', 
                      borderColor: 'divider', 
                      pb: 2 
                    }}
                  >
                    <Avatar sx={{ width: 40, height: 40, bgcolor: '#f0f0f0', color: 'text.primary', mr: 2 }}>
                      {feedback.clientId && feedback.clientId.fullname ? 
                        feedback.clientId.fullname.charAt(0) : '?'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {feedback.clientId && feedback.clientId.fullname ? 
                            feedback.clientId.fullname : 'Unknown Client'}
                        </Typography>
                        <Rating 
                          value={feedback.rating} 
                          precision={0.5} 
                          size="small" 
                          readOnly 
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {feedback.comment}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
                        {dayjs(feedback.createdAt).format('YYYY-MM-DD h:mm A')}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Availability Section - Always render regardless of sessions */}
      <Grid item xs={12} sx={{ mt: 3 }}>
        <AvailabilitySection />
      </Grid>
    </>
  );

  return (
    <Layout
      drawerWidth={drawerWidth}
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      user={therapist}
    >
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography variant="h6">Loading dashboard data...</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography variant="h6" color="error">Error loading dashboard: {error}</Typography>
        </Box>
      ) : (
        dashboardContent
      )}
    </Layout>
  );
}