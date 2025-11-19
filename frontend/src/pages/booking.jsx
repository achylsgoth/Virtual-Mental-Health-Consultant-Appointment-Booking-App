import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Rating,
  Paper,
  Grid,
  CircularProgress,
  Container,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  VideoCall as VideoCallIcon,
  AccessTime as ClockIcon,
  CheckCircle as SuccessIcon,
  FilterList as FilterIcon,
  Payment as PaymentIcon,
  Psychology as PsychologyIcon,
  Spa as SpaIcon,
  Healing as HealingIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import axios from 'axios';
import NavBar from '../components/homenav';
import { useAuthStore } from '../store/authStore';
import useTherapistStore from '../store/therapistStore';

const MentalHealthBookingSystem = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id } = useParams();
  const { user } = useAuthStore();

  const {
    therapist,
    availability,
    loading,
    fetchTherapistsById,
    fetchAvailability,
    updateAvailability
  } = useTherapistStore();

  const [selectedTime, setSelectedTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [allSlots, setAllSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [booking, setBooking] = useState(false);
  const [mode, setMode] = useState('light');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentPidx, setPaymentPidx] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [checkingPaymentStatus, setCheckingPaymentStatus] = useState(false);
  const [paymentStatusInterval, setPaymentStatusInterval] = useState(null);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [filterStartTime, setFilterStartTime] = useState('');
  const [filterEndTime, setFilterEndTime] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // Calming color palette
  const colors = {
    primary: '#4a6fa5', // Soft blue
    secondary: '#88a2aa', // Muted teal
    accent: '#c0d6df', // Light sky blue
    background: '#f8f9fa', // Very light gray
    text: '#333333', // Dark gray for text
    lightText: '#6c757d', // Medium gray
    success: '#4caf50', // Green
    warning: '#ff9800', // Amber
    error: '#f44336' // Red
  };

  // Fetch therapist and availability on component mount
  useEffect(() => {
    fetchTherapistsById(id);
    fetchAvailability(id);
  }, [id, fetchTherapistsById, fetchAvailability]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (paymentStatusInterval) {
        clearInterval(paymentStatusInterval);
      }
    };
  }, [paymentStatusInterval]);

  // Process all available slots
  useEffect(() => {
    if (availability && availability[id]) {
      let processedSlots = [];

      if (Array.isArray(availability[id])) {
        availability[id].forEach(availabilityItem => {
          if (availabilityItem.slots && Array.isArray(availabilityItem.slots)) {
            processedSlots = [...processedSlots, ...availabilityItem.slots];
          } else if (availabilityItem.startDateTime) {
            processedSlots.push(availabilityItem);
          }
        });
      }

      setAllSlots(processedSlots);
    }
  }, [availability, id]);

  // Filter slots based on selected date and additional filters
  useEffect(() => {
    let filteredSlots = allSlots.filter(slot => {
      const slotDate = dayjs(slot.startDateTime);
      const dateMatch = !filterDate || slotDate.isSame(filterDate, 'day');

      // Additional filtering conditions
      const timeMatch = (!filterStartTime ||
        dayjs(slot.startDateTime).format('HH:mm') >= filterStartTime) &&
        (!filterEndTime ||
        dayjs(slot.startDateTime).format('HH:mm') <= filterEndTime);

      const statusMatch = filterStatus === 'all' ||
        (filterStatus === 'available' && slot.isAvailable) ||
        (filterStatus === 'booked' && !slot.isAvailable);

      return dateMatch && timeMatch && statusMatch;
    });

    setAvailableSlots(filteredSlots);
  }, [filterDate, allSlots, filterStartTime, filterEndTime, filterStatus]);

  const handleTimeSelection = (slot) => {
    setSelectedTime(slot.startDateTime);
    setSelectedEndTime(slot.endDateTime);
    setShowPaymentOptions(false);
    setPaymentSuccess(false);
    setPaymentPidx('');
    setPaymentUrl('');
    
    if (paymentStatusInterval) {
      clearInterval(paymentStatusInterval);
      setPaymentStatusInterval(null);
    }
  };

  const initiateBookingProcess = () => {
    if (!user) {
      toast.error('You must be logged in to book a session.');
      return;
    }

    if (!selectedTime) {
      toast.error('Please select a time slot first.');
      return;
    }

    setShowPaymentOptions(true);
  };

  const handleKhaltiPayment = async () => {
    if (!therapist || !user || !selectedTime) {
      toast.error('Missing required information.');
      return;
    }
    
    setBooking(true);
    
    try {
      const productIdentity = `SESSION-${id}-${user._id}-${dayjs(selectedTime).format('YYYYMMDD-HHmm')}`;
      const productName = `Therapy Session with ${therapist.fullname}`;
      
      const customerInfo = {
        name: user.fullname || "Client",
        email: user.email
      };
      
      const response = await axios.post('http://localhost:5555/payment/initiate', {
        therapistId: id,
        clientId: user._id,
        amount: therapist.sessionPrice,
        purchase_order_id: productIdentity,
        purchase_order_name: productName,
        customer_info: customerInfo
      });
      
      if (response.data.success) {
        setPaymentPidx(response.data.data.pidx);
        setPaymentUrl(response.data.data.payment_url);
        window.open(response.data.data.payment_url, '_blank');
        startCheckingPaymentStatus(response.data.data.pidx);
      } else {
        toast.error('Payment initiation failed. Please try again.');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Payment initiation failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };
  
 // Simplified interval function that directly calls verifyAndCompleteBooking
 const startCheckingPaymentStatus = (pidx) => {
  // Clear any existing interval
  if (paymentStatusInterval) {
    clearInterval(paymentStatusInterval);
  }
  
  // Create a new interval to check payment status every 5 seconds
  const intervalId = setInterval(() => {
    setCheckingPaymentStatus(true);
    verifyAndCompleteBooking(pidx)
      .then((success) => {
        if(success){
          clearInterval(intervalId);
          setPaymentStatusInterval(null);
        }
      })
      .catch(error => {
        console.error('Error verifying payment:', error);
      })
      .finally(() => {
        setCheckingPaymentStatus(false);
      });
  }, 5000);
  
  // Save the interval ID for cleanup
  setPaymentStatusInterval(intervalId);
  
  toast.success('Payment initiated! We will check the status automatically.', {
    duration: 5000
  });
};

const manualCheckPaymentStatus = () => {
  if (!paymentPidx) return;
  
  setCheckingPaymentStatus(true);
  verifyAndCompleteBooking(paymentPidx)
    .then((success) => {
      // If successful, make sure we update UI appropriately
      if (success && paymentStatusInterval) {
        clearInterval(paymentStatusInterval);
        setPaymentStatusInterval(null);
      }
    })
    .finally(() => {
      setCheckingPaymentStatus(false);
    });
};

// Modified to handle intervals
const verifyAndCompleteBooking = async (pidx) => {
  if(booking || bookingSuccess || paymentSuccess) return false;

  setBooking(true);

  try {
    const verificationResponse = await axios.post('http://localhost:5555/payment/verify', {
      pidx
    });

    if (verificationResponse.data.success) {
      // Clear the check interval if payment is successful
      if (paymentStatusInterval) {
        clearInterval(paymentStatusInterval);
        setPaymentStatusInterval(null);
      }
      
      setPaymentSuccess(true);
      setPaymentData(verificationResponse.data.data);

      if(!bookingSuccess){
      await completeBookingAfterPayment(pidx);
      }
      return true;
    } else {
      toast.info('Payment still in progress. Please wait...');
      return false;
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    toast.error('Payment verification failed. Please contact support.');
    return false;
  } finally {
    setBooking(false);
  }
};

  const completeBookingAfterPayment = async (pidx) => {
    const bookingData = {
      therapistId: id,
      clientId: user._id,
      scheduledTime: selectedTime,
      duration: 50,
      payment: {
        amount: therapist.sessionPrice,
        currency: 'NPR',
        status: 'completed',
        method: 'khalti',
        transactionId: pidx
      },
    };

    try {
      setBookingSuccess(true);
      const response = await axios.post(`http://localhost:5555/session/create`, bookingData);

      if (response.data.success) {
        const isoFormattedTime = new Date(selectedTime).toISOString();
        const availabilityResponse = await updateAvailability(isoFormattedTime, id); 
      }

      
      setMeetingLink(response.data.session.meetingLink);
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error('Session booking failed after payment. Please contact support.');
    } finally {
      setBooking(false);
    }
  };

  const handleCancelPayment = () => {
    if (paymentStatusInterval) {
      clearInterval(paymentStatusInterval);
      setPaymentStatusInterval(null);
    }
    
    setPaymentPidx('');
    setPaymentUrl('');
    setShowPaymentOptions(false);
  };

  const handleOpenFilterDialog = () => {
    setOpenFilterDialog(true);
  };

  const handleCloseFilterDialog = () => {
    setOpenFilterDialog(false);
  };

  const handleApplyFilters = () => {
    handleCloseFilterDialog();
  };

  const resetFilters = () => {
    setFilterStartTime('');
    setFilterEndTime('');
    setFilterStatus('all');
    setFilterDate('');
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: colors.background
      }}>
        <Box textAlign="center">
          <CircularProgress size={60} thickness={4} sx={{ color: colors.primary }} />
          <Typography variant="h6" mt={2} color={colors.text}>
            Loading therapist information...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Therapist not found
  if (!therapist) {
    return (
      <Box sx={{
        maxWidth: 1200,
        margin: 'auto',
        p: 3,
        backgroundColor: colors.background,
        minHeight: '100vh'
      }}>
        <Typography variant="h5" color={colors.text}>
          Therapist not found
        </Typography>
      </Box>
    );
  }

  // Booking success screen
  if (bookingSuccess) {
    return (
      <Container maxWidth="sm" sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        backgroundColor: colors.background
      }}>
        <Paper elevation={3} sx={{
          p: 4,
          borderRadius: 3,
          backgroundColor: 'white',
          textAlign: 'center',
          maxWidth: 500,
          width: '100%',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.18)'
        }}>
          <Box sx={{
            backgroundColor: colors.success,
            color: 'white',
            width: 80,
            height: 80,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <SuccessIcon sx={{ fontSize: 50 }} />
          </Box>
          <Typography variant="h4" sx={{ 
            mb: 2, 
            fontWeight: 600, 
            color: colors.text,
            fontFamily: '"Playfair Display", serif'
          }}>
            Appointment Confirmed
          </Typography>
          <Typography variant="body1" sx={{ 
            mb: 3, 
            color: colors.lightText,
            lineHeight: 1.6
          }}>
            Your session with <strong>{therapist.fullname}</strong> is scheduled for{' '}
            <strong>{dayjs(selectedTime).format('MMMM D, YYYY [at] h:mm A')}</strong>.
          </Typography>
          
          <Box sx={{
            backgroundColor: colors.accent,
            p: 2,
            borderRadius: 2,
            mb: 3,
            textAlign: 'left'
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Payment Details:
            </Typography>
            <Typography variant="body2">
              Amount: NPR {therapist.sessionPrice}
            </Typography>
            <Typography variant="body2">
              Method: Khalti
            </Typography>
            <Typography variant="body2">
              Transaction ID: {paymentPidx.substring(0, 10)}...
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            href="/client-dashboard"
            sx={{
              backgroundColor: colors.primary,
              '&:hover': { backgroundColor: '#3a5a80' },
              mb: 2,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Go to Dashboard
          </Button>
          <Typography variant="caption" display="block" sx={{ 
            color: colors.lightText,
            mt: 2
          }}>
            A confirmation has been sent to your email
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{
      backgroundColor: colors.background,
      minHeight: '100vh'
    }}>
      <NavBar mode={mode} setMode={setMode} />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Therapist Profile Section */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                backgroundColor: 'white',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 4,
                flexDirection: isMobile ? 'column' : 'row',
                textAlign: isMobile ? 'center' : 'left'
              }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mr: isMobile ? 0 : 3,
                    mb: isMobile ? 2 : 0,
                    backgroundColor: colors.primary,
                    fontSize: '3rem',
                  }}
                  src=''
                >
                  {therapist.avatar}
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 600, 
                    color: colors.text,
                    fontFamily: '"Playfair Display", serif',
                    mb: 1
                  }}>
                    Dr. {therapist.fullname}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ 
                    color: colors.secondary, 
                    mb: 1,
                    fontStyle: 'italic'
                  }}>
                    {therapist.therapistType}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: isMobile ? 'center' : 'flex-start',
                    flexWrap: 'wrap',
                    gap: 1,
                    mt: 1
                  }}>
                    <Rating
                      value={therapist.rating || 0}
                      precision={0.5}
                      readOnly
                      sx={{ color: colors.primary }}
                    />
                    <Typography variant="body2" sx={{ color: colors.lightText }}>
                      {therapist.rating || 0} ({therapist.reviews || 0} reviews)
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
  {therapist.specializations && therapist.specializations.length > 0 ? (
    // Map through specializations array to create a chip for each one
    therapist.specializations.map((specialization, index) => (
      <Chip
        key={index}
        icon={<PsychologyIcon />}
        label={specialization}
        sx={{ mr: 1, mb: 1 }}
      />
    ))
  ) : (
    // Fallback if no specializations are available
    <Chip
      icon={<PsychologyIcon />}
      label="Integrative Therapy"
      sx={{ mr: 1, mb: 1 }}
    />
  )}
  <Chip
    icon={<HealingIcon />}
    label={`${therapist.yearsOfExperience || '5+'} years experience`}
    sx={{ mr: 1, mb: 1 }}
  />
</Box>
                </Box>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  color: colors.text,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <SpaIcon sx={{ mr: 1, color: colors.primary }} />
                  Professional Bio
                </Typography>
                <Typography variant="body1" sx={{ 
                  mb: 3, 
                  color: colors.text,
                  lineHeight: 1.8
                }}>
                  {therapist.bio || 'No bio available.'}
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  color: colors.text,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <CalendarIcon sx={{ mr: 1, color: colors.primary }} />
                  Available Time Slots
                </Typography>
                
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3
                }}>
                  <Typography variant="body2" sx={{ color: colors.lightText }}>
                    {filterDate ? dayjs(filterDate).format('MMMM D, YYYY') : 'All available dates'}
                  </Typography>
                  <Button
                    startIcon={<FilterIcon />}
                    onClick={handleOpenFilterDialog}
                    variant="outlined"
                    sx={{
                      borderColor: colors.secondary,
                      color: colors.text,
                      '&:hover': {
                        borderColor: colors.primary
                      }
                    }}
                  >
                    Filter
                  </Button>
                </Box>

                {availableSlots.length > 0 ? (
                  <Grid container spacing={2}>
                    {availableSlots.map((slot, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Paper
                          elevation={0}
                          onClick={() => slot.isAvailable && handleTimeSelection(slot)}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: `1px solid ${
                              selectedTime === slot.startDateTime 
                                ? colors.primary 
                                : 'rgba(0, 0, 0, 0.12)'
                            }`,
                            backgroundColor: selectedTime === slot.startDateTime 
                              ? `${colors.primary}10` 
                              : 'white',
                            cursor: slot.isAvailable ? 'pointer' : 'default',
                            opacity: slot.isAvailable ? 1 : 0.6,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: slot.isAvailable ? colors.primary : 'rgba(0, 0, 0, 0.12)',
                              backgroundColor: slot.isAvailable ? `${colors.primary}08` : 'white'
                            }
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600,
                            color: selectedTime === slot.startDateTime 
                              ? colors.primary 
                              : colors.text
                          }}>
                            {dayjs(slot.startDateTime).format('MMMM D, YYYY')}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: selectedTime === slot.startDateTime 
                              ? colors.primary 
                              : colors.lightText
                          }}>
                            {dayjs(slot.startDateTime).format('h:mm A')} - {dayjs(slot.endDateTime).format('h:mm A')}
                          </Typography>
                          {!slot.isAvailable && (
                            <Chip 
                              label="Booked" 
                              size="small" 
                              sx={{ 
                                mt: 1,
                                backgroundColor: '#ffe0b2',
                                color: '#e65100'
                              }} 
                            />
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: '#f5f5f5',
                      borderRadius: 2
                    }}
                  >
                    <Typography color="text.secondary">
                      No available slots match your criteria.
                    </Typography>
                    <Button 
                      onClick={resetFilters} 
                      sx={{ 
                        mt: 2,
                        color: colors.primary
                      }}
                    >
                      Clear filters
                    </Button>
                  </Paper>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Booking Summary Section */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                backgroundColor: 'white',
                position: 'sticky',
                top: theme.spacing-6,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              <Typography variant="h5" sx={{ 
                mb: 3, 
                color: colors.text,
                fontWeight: 600,
                fontFamily: '"Playfair Display", serif'
              }}>
                Session Summary
              </Typography>

              {selectedTime ? (
                <Box>
                  <Box sx={{ 
                    mb: 3,
                    p: 2,
                    backgroundColor: `${colors.accent}20`,
                    borderRadius: 2
                  }}>
                    <Typography variant="subtitle2" sx={{ 
                      mb: 1,
                      color: colors.lightText,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <CalendarIcon sx={{ mr: 1, fontSize: '1rem', color: colors.primary }} />
                      Session Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {dayjs(selectedTime).format('dddd, MMMM D, YYYY')}
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    mb: 3,
                    p: 2,
                    backgroundColor: `${colors.accent}20`,
                    borderRadius: 2
                  }}>
                    <Typography variant="subtitle2" sx={{ 
                      mb: 1,
                      color: colors.lightText,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <ClockIcon sx={{ mr: 1, fontSize: '1rem', color: colors.primary }} />
                      Session Time
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {dayjs(selectedTime).format('h:mm A')} - {dayjs(selectedEndTime).format('h:mm A')}
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    mb: 3,
                    p: 2,
                    backgroundColor: `${colors.accent}20`,
                    borderRadius: 2
                  }}>
                    <Typography variant="subtitle2" sx={{ 
                      mb: 1,
                      color: colors.lightText,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <VideoCallIcon sx={{ mr: 1, fontSize: '1rem', color: colors.primary }} />
                      Session Details
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
                      Online Video Session (GoogleMeet)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      A secure link will be provided after booking
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    mb: 4,
                    p: 2,
                    backgroundColor: `${colors.accent}20`,
                    borderRadius: 2
                  }}>
                    <Typography variant="subtitle2" sx={{ 
                      mb: 1,
                      color: colors.lightText,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <PaymentIcon sx={{ mr: 1, fontSize: '1rem', color: colors.primary }} />
                      Payment
                    </Typography>
                    <Typography variant="h6" fontWeight="medium" sx={{ color: colors.primary }}>
                      NPR {therapist.sessionPrice || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Inclusive of all taxes
                    </Typography>
                  </Box>

                  {!showPaymentOptions ? (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={initiateBookingProcess}
                      sx={{
                        backgroundColor: colors.primary,
                        py: 1.5,
                        borderRadius: 2,
                        '&:hover': { 
                          backgroundColor: '#3a5a80',
                          boxShadow: '0 4px 12px rgba(74, 111, 165, 0.3)'
                        },
                        fontSize: '1rem',
                        textTransform: 'none'
                      }}
                    >
                      Continue to Payment
                    </Button>
                  ) : paymentPidx ? (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{ 
                        mb: 2, 
                        textAlign: 'center', 
                        fontWeight: 'medium',
                        color: colors.text
                      }}>
                        Payment In Progress
                      </Typography>
                      
                      {checkingPaymentStatus ? (
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          my: 2 
                        }}>
                          <CircularProgress size={24} sx={{ color: colors.primary }} />
                        </Box>
                      ) : (
                        <Typography sx={{ 
                          mb: 2, 
                          textAlign: 'center',
                          color: colors.lightText
                        }}>
                          Waiting for payment confirmation...
                        </Typography>
                      )}
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        gap: 2,
                        mb: 2
                      }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={handleCancelPayment}
                          sx={{
                            borderColor: colors.secondary,
                            color: colors.text,
                            '&:hover': {
                              borderColor: colors.primary
                            }
                          }}
                        >
                          Cancel
                        </Button>
                        
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => checkPaymentStatus(paymentPidx)}
                          sx={{
                            backgroundColor: colors.primary,
                            '&:hover': { 
                              backgroundColor: '#3a5a80',
                              boxShadow: '0 4px 12px rgba(74, 111, 165, 0.3)'
                            }
                          }}
                        >
                          Check Status
                        </Button>
                      </Box>
                      
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => window.open(paymentUrl, '_blank')}
                        sx={{
                          backgroundColor: '#5E338D',
                          color: 'white',
                          py: 1.5,
                          mb: 2,
                          borderRadius: 2,
                          '&:hover': { 
                            backgroundColor: '#4a2a70',
                            boxShadow: '0 4px 12px rgba(94, 51, 141, 0.3)'
                          },
                          fontSize: '1rem',
                          textTransform: 'none'
                        }}
                      >
                        Open Khalti Payment
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{ 
                        mb: 3, 
                        textAlign: 'center', 
                        fontWeight: 'medium',
                        color: colors.text
                      }}>
                        Secure Payment Options
                      </Typography>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleKhaltiPayment}
                        disabled={booking}
                        sx={{
                          backgroundColor: '#5E338D',
                          color: 'white',
                          py: 1.5,
                          mb: 2,
                          borderRadius: 2,
                          '&:hover': { 
                            backgroundColor: '#4a2a70',
                            boxShadow: '0 4px 12px rgba(94, 51, 141, 0.3)'
                          },
                          fontSize: '1rem',
                          textTransform: 'none'
                        }}
                      >
                        {booking ? (
                          <>
                            <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                            Processing...
                          </>
                        ) : 'Pay with Khalti'}
                      </Button>
                      <Typography variant="body2" sx={{ 
                        textAlign: 'center', 
                        color: colors.lightText,
                        fontSize: '0.75rem'
                      }}>
                        Your payment is secure and encrypted. We don't store your payment details.
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  py: 4
                }}>
                  <Box sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: `${colors.accent}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}>
                    <CalendarIcon sx={{
                      fontSize: 40,
                      color: colors.primary
                    }} />
                  </Box>
                  <Typography variant="body1" sx={{ 
                    color: colors.lightText,
                    mb: 1
                  }}>
                    Select an available time slot
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: colors.lightText,
                    maxWidth: 300
                  }}>
                    Choose from the available dates and times to book your session
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Filter Dialog */}
      <Dialog 
        open={openFilterDialog} 
        onClose={handleCloseFilterDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            width: '100%',
            maxWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600,
          color: colors.text,
          borderBottom: `1px solid ${colors.accent}`
        }}>
          Filter Sessions
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Date"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              variant="outlined"
              size="small"
            />
            <TextField
              label="Start Time"
              type="time"
              value={filterStartTime}
              onChange={(e) => setFilterStartTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              fullWidth
              variant="outlined"
              size="small"
            />
            <TextField
              label="End Time"
              type="time"
              value={filterEndTime}
              onChange={(e) => setFilterEndTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              fullWidth
              variant="outlined"
              size="small"
            />
            <TextField
              select
              label="Slot Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              SelectProps={{ native: true }}
            >
              <option value="all">All Slots</option>
              <option value="available">Available Only</option>
              <option value="booked">Booked Only</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          px: 3, 
          py: 2,
          borderTop: `1px solid ${colors.accent}`
        }}>
          <Button 
            onClick={resetFilters} 
            sx={{ 
              color: colors.lightText,
              '&:hover': {
                color: colors.primary
              }
            }}
          >
            Reset
          </Button>
          <Button 
            onClick={handleApplyFilters} 
            sx={{ 
              backgroundColor: colors.primary,
              color: 'white',
              px: 3,
              '&:hover': {
                backgroundColor: '#3a5a80'
              }
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MentalHealthBookingSystem;