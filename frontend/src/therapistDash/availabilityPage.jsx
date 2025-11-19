
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Grid,
  Box,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Chip,
  Stack
} from '@mui/material';
import {
  CalendarMonthOutlined,
  HomeOutlined,
  AccessTimeOutlined,
  CheckCircleOutlined,
  ScheduleOutlined
} from '@mui/icons-material';
import Layout from './layout';
import AvailabilitySection from './setAvailability';
import useTherapistStore from '../store/therapistStore';

const AvailabilityPage = () => {
  const { therapist, availability } = useTherapistStore();
  const [selectedTab, setSelectedTab] = useState('availability');

  // Calculate some basic stats
  const therapistAvailability = therapist && availability[therapist._id] ? availability[therapist._id] : { slots: [] };
  const slots = Array.isArray(therapistAvailability.slots) ? therapistAvailability.slots : [];
  const availableSlots = slots.filter(slot => slot.isAvailable);
  const unavailableSlots = slots.filter(slot => !slot.isAvailable);

  const drawerWidth = 240;

  return (
    <Layout
    drawerWidth={drawerWidth}
    selectedTab={selectedTab}
    setSelectedTab={setSelectedTab}
    user={therapist}
  >
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}
            href="/therapist-dashboard"
          >
            <HomeOutlined sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Typography
            sx={{ display: 'flex', alignItems: 'center', color: 'text.primary' }}
          >
            <CalendarMonthOutlined sx={{ mr: 0.5 }} fontSize="inherit" />
            Availability Management
          </Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Manage Your Availability
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Set your available time slots and sync with Google Calendar to manage your schedule efficiently.
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'success.light',
                      display: 'flex',
                      alignItems: 'center',
                      mr: 2
                    }}
                  >
                    <CheckCircleOutlined sx={{ color: 'success.main', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {availableSlots.length}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Available Slots
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'error.light',
                      display: 'flex',
                      alignItems: 'center',
                      mr: 2
                    }}
                  >
                    <AccessTimeOutlined sx={{ color: 'error.main', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {unavailableSlots.length}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Unavailable Slots
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'info.light',
                      display: 'flex',
                      alignItems: 'center',
                      mr: 2
                    }}
                  >
                    <CalendarMonthOutlined sx={{ color: 'info.main', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {slots.length}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total Slots
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      mr: 2
                    }}
                  >
                    <ScheduleOutlined sx={{ color: 'primary.main', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {slots.length > 0 ? Math.round((availableSlots.length / slots.length) * 100) : 0}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Availability Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Availability Section */}
        <AvailabilitySection />

      
              
            
        
      </Grid>
    </Layout>
  );
};

export default AvailabilityPage;