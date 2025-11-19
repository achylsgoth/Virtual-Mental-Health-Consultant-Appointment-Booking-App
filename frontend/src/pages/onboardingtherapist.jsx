import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Paper, Alert, Container, Typography, TextField, Button, Stepper, Step, StepLabel, MenuItem, Select, InputLabel, 
  FormControl, Box, IconButton, Chip, Checkbox, FormControlLabel, Fade, ThemeProvider, createTheme, CssBaseline,
  Radio, RadioGroup
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GoogleIcon from '@mui/icons-material/Google';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SchoolIcon from '@mui/icons-material/School';
import MedicationIcon from '@mui/icons-material/Medication';
import LightModeIcon from '@mui/icons-material/LightMode';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import BadgeIcon from '@mui/icons-material/Badge';
import useOnboardingStore from '../store/onboardingStore.js';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Custom theme for mental health aesthetic
const theme = createTheme({
  palette: {
    primary: {
      main: '#68a4a4', // Calm teal
      light: '#9dd3d3',
      dark: '#4e7a7a',
    },
    secondary: {
      main: '#b1aed5', // Soft lavender
      light: '#d9d6ff',
      dark: '#8584a3',
    },
    background: {
      default: '#f7f9fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#414755',
      secondary: '#6e7582',
    },
    error: {
      main: '#e57373',
    },
    warning: {
      main: '#ffb74d',
    },
    info: {
      main: '#64b5f6',
    },
    success: {
      main: '#81c784',
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', sans-serif",
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 22px',
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

const specializationOptions = ['Depression', 'Anxiety', 'Relationship', 'Trauma', 'ADHD', 'Self-Esteem', 'Grief', 'Family Conflict'];
const languageOptions = ['English', 'Spanish', 'French', 'German', 'Nepali', 'Hindi', 'Mandarin', 'Arabic'];
const therapistTypes = ['clinical', 'counselor', 'coach', 'mental health specialist'];

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

const TherapistOnboarding = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    therapistType: 'counselor',
    licenseNumber: '',
    licenseIssuer: '',
    licenseExpiry: '',
    qualificationDocuments: {
      resume: null,
      professionalLicense: null,
    },
    specializations: [],
    education: [{ degree: '', institution: '', year: '' }],
    slots: [{ 
      startDateTime: '', 
      endDateTime: '', 
      isAvailable: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }],
    sessionPrice: 0,
    languages: [],
    paymentDetails: { provider: '', customerId: '' },
  });

  const onboardTherapist = useOnboardingStore((state) => state.onboardTherapist);
  const navigate = useNavigate();

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      const formDataToSend = new FormData();
      formDataToSend.append('resume', formData.qualificationDocuments.resume);
      formDataToSend.append('professionalLicense', formData.qualificationDocuments.professionalLicense);
      formDataToSend.append('therapistType', formData.therapistType);
      formDataToSend.append('licenseNumber', formData.licenseNumber);
      formDataToSend.append('licenseIssuer', formData.licenseIssuer);
      formDataToSend.append('licenseExpiry', formData.licenseExpiry);
      formDataToSend.append('specializations', JSON.stringify(formData.specializations));
      formDataToSend.append('education', JSON.stringify(formData.education));
      formDataToSend.append('slots', JSON.stringify(formData.slots));
      formDataToSend.append('sessionPrice', JSON.stringify(formData.sessionPrice));
      formDataToSend.append('languages', JSON.stringify(formData.languages));
      formDataToSend.append('paymentDetails', JSON.stringify(formData.paymentDetails));

      try {
        const result = await onboardTherapist(formDataToSend);
        if (result.success) {
          console.log('Form Data Submitted:', formDataToSend);
          toast.success('Onboarding Successful! Welcome to HealNest.');
          navigate('/therapist-dashboard');
        } else {
          console.error('Onboarding failed:', result.message);
          toast.error('Something went wrong. Please try again.');
        }
      } catch (error) {
        console.error('Error during onboarding:', error);
        toast.error('Connection error. Please check your internet and try again.');
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleGoogleCalendarConnect = () => {
    console.log('Connecting to Google Calendar');
    const googleAuthUrl = 'http://localhost:5555/api/calendar/auth/google';
    window.open(googleAuthUrl, '_blank', 'width=600,height=600');
    toast.success('Google Calendar authorization initiated');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      toast.success(`${field} uploaded successfully`);
      setFormData((prevData) => ({
        ...prevData,
        qualificationDocuments: {
          ...prevData.qualificationDocuments,
          [field]: file,
        },
      }));
    }
  };

  const handleSpecializationChange = (specialization) => {
    setFormData((prevData) => {
      const isSelected = prevData.specializations.includes(specialization);
      const updatedSpecializations = isSelected
        ? prevData.specializations.filter((spec) => spec !== specialization)
        : [...prevData.specializations, specialization];
      return {
        ...prevData,
        specializations: updatedSpecializations,
      };
    });
  };

  const handleEducationChange = (index, e) => {
    const { name, value } = e.target;
    const education = [...formData.education];
    education[index][name] = value;
    setFormData((prevData) => ({
      ...prevData,
      education,
    }));
  };

  const addEducation = () => {
    setFormData((prevData) => ({
      ...prevData,
      education: [...prevData.education, { degree: '', institution: '', year: '' }],
    }));
  };

  const handleAvailabilityChange = (slotIndex, e) => {
    const { name, value } = e.target;
    const updatedSlots = [...formData.slots];
    updatedSlots[slotIndex][name] = value;
    setFormData((prevData) => ({
      ...prevData,
      slots: updatedSlots,
    }));
  };

  const addNewSlot = () => {
    setFormData((prevData) => ({
      ...prevData,
      slots: [...prevData.slots, { 
        startDateTime: '', 
        endDateTime: '', 
        isAvailable: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }],
    }));
  };

  const removeSlot = (index) => {
    if (formData.slots.length > 1) {
      setFormData((prevData) => {
        const updatedSlots = [...prevData.slots];
        updatedSlots.splice(index, 1);
        return { ...prevData, slots: updatedSlots };
      });
    } else {
      toast.error("You must have at least one availability slot");
    }
  };

  const handleLanguageChange = (language) => {
    setFormData((prevData) => {
      const isSelected = prevData.languages.includes(language);
      const updatedLanguages = isSelected
        ? prevData.languages.filter((lang) => lang !== language)
        : [...prevData.languages, language];
      return {
        ...prevData,
        languages: updatedLanguages,
      };
    });
  };

  const steps = [
    { label: 'Therapist Type', icon: <BadgeIcon /> },
    { label: 'Qualifications', icon: <MedicationIcon /> },
    { label: 'Specializations', icon: <SchoolIcon /> },
    { label: 'Availability', icon: <CalendarMonthIcon /> },
    { label: 'Payment Details', icon: <LocalAtmIcon /> }
  ];

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 4, 
              my: 4, 
              p: 3, 
              borderRadius: 3,
              backgroundColor: 'background.paper',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}>
              <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600, mb: 2 }}>
                Select Your Therapist Type
              </Typography>
              
              <Paper elevation={0} sx={{ 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'primary.light',
                backgroundColor: 'rgba(104, 164, 164, 0.05)'
              }}>
                <FormControl component="fieldset">
                  <RadioGroup
                    name="therapistType"
                    value={formData.therapistType}
                    onChange={handleChange}
                  >
                    <FormControlLabel 
                      value="clinical" 
                      control={<Radio color="primary" />} 
                      label={
                        <Box>
                          <Typography variant="subtitle1" fontWeight={500}>
                            Clinical Therapist
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Licensed therapists with formal qualifications to diagnose and treat mental health conditions
                          </Typography>
                        </Box>
                      }
                      sx={{ mb: 2 }}
                    />
                    
                    <FormControlLabel 
                      value="counselor" 
                      control={<Radio color="primary" />} 
                      label={
                        <Box>
                          <Typography variant="subtitle1" fontWeight={500}>
                            Counselor
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Trained to provide counseling services and support for various life challenges
                          </Typography>
                        </Box>
                      }
                      sx={{ mb: 2 }}
                    />
                    
                    <FormControlLabel 
                      value="coach" 
                      control={<Radio color="primary" />} 
                      label={
                        <Box>
                          <Typography variant="subtitle1" fontWeight={500}>
                            Mental Health Coach
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Provides guidance and accountability for mental wellbeing goals
                          </Typography>
                        </Box>
                      }
                      sx={{ mb: 2 }}
                    />
                    
                    <FormControlLabel 
                      value="mental health specialist" 
                      control={<Radio color="primary" />} 
                      label={
                        <Box>
                          <Typography variant="subtitle1" fontWeight={500}>
                            Mental Health Specialist
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Other mental health professionals such as psychiatric nurses or social workers
                          </Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </Paper>
              
              {(formData.therapistType === 'clinical' || formData.therapistType === 'counselor') && (
                <Paper elevation={0} sx={{ 
                  p: 3, 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'primary.light',
                  backgroundColor: 'rgba(104, 164, 164, 0.05)'
                }}>
                  <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 3 }}>
                    License Information
                  </Typography>
                  
                  <TextField
                    name="licenseNumber"
                    label="License Number"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required={formData.therapistType === 'clinical'}
                    helperText={formData.therapistType === 'clinical' ? "Required for clinical therapists" : "Optional for counselors"}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    name="licenseIssuer"
                    label="Licensing Body/Authority"
                    value={formData.licenseIssuer}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    name="licenseExpiry"
                    label="License Expiry Date"
                    type="date"
                    value={formData.licenseExpiry}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Paper>
              )}
              
              <Alert severity="info" sx={{ 
                borderRadius: 2, 
                '& .MuiAlert-icon': { color: 'primary.main' } 
              }}>
                Different therapist types have different verification requirements. Clinical therapists must provide license details.
              </Alert>
            </Box>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 4, 
              my: 4, 
              p: 3, 
              borderRadius: 3,
              backgroundColor: 'background.paper',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}>
              <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600, mb: 2 }}>
                Professional Documentation
              </Typography>
              
              <Paper elevation={0} sx={{ 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                border: '2px dashed',
                borderColor: 'primary.light',
                borderRadius: 2,
                backgroundColor: 'rgba(104, 164, 164, 0.05)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'rgba(104, 164, 164, 0.1)',
                }
              }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                  Your resume helps us understand your professional background and experience
                </Typography>
                
                <input
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  id="upload-button-resume"
                  type="file"
                  onChange={(e) => handleFileChange('resume', e)}
                />
                <label htmlFor="upload-button-resume">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    sx={{ 
                      borderRadius: 8,
                      px: 3,
                      py: 1.5,
                      borderColor: 'primary.main',
                      color: 'primary.dark',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        backgroundColor: 'rgba(104, 164, 164, 0.1)',
                      }
                    }}
                  >
                    {formData.qualificationDocuments.resume
                      ? `Selected: ${formData.qualificationDocuments.resume.name}`
                      : 'Upload Resume'}
                  </Button>
                </label>
              </Paper>

              <Paper elevation={0} sx={{ 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                border: '2px dashed',
                borderColor: 'primary.light',
                borderRadius: 2,
                backgroundColor: 'rgba(104, 164, 164, 0.05)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'rgba(104, 164, 164, 0.1)',
                }
              }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                  Your professional license verifies your qualifications to practice
                </Typography>
                
                <input
                  accept="application/pdf,image/*"
                  style={{ display: 'none' }}
                  id="upload-button-license"
                  type="file"
                  onChange={(e) => handleFileChange('professionalLicense', e)}
                />
                <label htmlFor="upload-button-license">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    sx={{ 
                      borderRadius: 8,
                      px: 3,
                      py: 1.5,
                      borderColor: 'primary.main',
                      color: 'primary.dark',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        backgroundColor: 'rgba(104, 164, 164, 0.1)',
                      }
                    }}
                  >
                    {formData.qualificationDocuments.professionalLicense
                      ? `Selected: ${formData.qualificationDocuments.professionalLicense.name}`
                      : 'Upload Professional License'}
                  </Button>
                </label>
              </Paper>
              
              <Alert severity="info" sx={{ 
                borderRadius: 2, 
                '& .MuiAlert-icon': { color: 'primary.main' } 
              }}>
                Please ensure all documents are clear, legible, and in PDF or image format. 
                Your documents will be reviewed as part of our verification process.
              </Alert>
            </Box>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 4, 
              my: 4, 
              p: 3, 
              borderRadius: 3,
              backgroundColor: 'background.paper',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}>
              <Box>
                <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600, mb: 2 }}>
                  Areas of Focus
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Select the areas you specialize in to help clients find the right match for their needs
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mb={4}>
                  {specializationOptions.map((specialization) => (
                    <Chip
                      key={specialization}
                      label={specialization}
                      color={formData.specializations.includes(specialization) ? 'primary' : 'default'}
                      onClick={() => handleSpecializationChange(specialization)}
                      sx={{
                        borderRadius: '16px',
                        py: 2.5,
                        px: 1,
                        fontWeight: 500,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600, mb: 2 }}>
                  Languages
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Select all languages in which you can provide therapy
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mb={4}>
                  {languageOptions.map((language) => (
                    <Chip
                      key={language}
                      label={language}
                      color={formData.languages.includes(language) ? 'secondary' : 'default'}
                      onClick={() => handleLanguageChange(language)}
                      sx={{
                        borderRadius: '16px',
                        py: 2.5,
                        px: 1,
                        fontWeight: 500,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600, mb: 2 }}>
                  Education & Training
                </Typography>
                
                <AnimatePresence>
                  {formData.education.map((edu, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          mb: 2, 
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'primary.light',
                          backgroundColor: 'rgba(104, 164, 164, 0.05)'
                        }}
                      >
                        <TextField
                          name="degree"
                          label="Degree/Certification"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, e)}
                          fullWidth
                          margin="normal"
                          variant="outlined"
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          name="institution"
                          label="Institution"
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(index, e)}
                          fullWidth
                          margin="normal"
                          variant="outlined"
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          name="year"
                          label="Year Completed"
                          value={edu.year}
                          onChange={(e) => handleEducationChange(index, e)}
                          fullWidth
                          margin="normal"
                          variant="outlined"
                        />
                      </Paper>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <Button 
                  variant="outlined" 
                  onClick={addEducation}
                  sx={{ 
                    mt: 2,
                    borderRadius: 8,
                    borderColor: 'primary.main',
                    color: 'primary.dark',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'rgba(104, 164, 164, 0.1)',
                    }
                  }}
                >
                  + Add Another Degree/Certification
                </Button>
              </Box>
            </Box>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 4, 
              my: 4, 
              p: 3, 
              borderRadius: 3,
              backgroundColor: 'background.paper',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}>
              <Paper
                elevation={0}
                sx={{
                  width: '100%',
                  p: 4,
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: 'primary.light',
                  borderRadius: 3,
                  mb: 4,
                  backgroundColor: 'rgba(104, 164, 164, 0.05)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(104, 164, 164, 0.1)',
                  }
                }}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <CalendarMonthIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
                </motion.div>
                <Typography variant="h6" gutterBottom fontWeight="bold" color="primary.dark">
                  Connect Your Calendar
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  To manage your therapy sessions efficiently, please connect your Google Calendar.
                  This will help you set your availability and schedule appointments.
                </Typography>
                <Alert severity="info" sx={{ 
                  mb: 3, 
                  borderRadius: 2, 
                  '& .MuiAlert-icon': { color: 'primary.main' } 
                }}>
                  You need to connect your Google account to enable session scheduling and availability management.
                </Alert>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleCalendarConnect}
                  sx={{
                    bgcolor: '#4285F4',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#3367D6',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    },
                    px: 4,
                    py: 1.5,
                    mb: 3,
                    borderRadius: 8,
                    transition: 'all 0.3s ease'
                  }}
                >
                  Connect Google Calendar
                </Button>
              </Paper>

              <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600, mb: 2 }}>
                Set Your Availability
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Define when you're available to conduct therapy sessions
              </Typography>

              <AnimatePresence>
                {formData.slots.map((slot, slotIndex) => (
                  <motion.div
                    key={slotIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 3, 
                        mb: 3, 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'primary.light',
                        backgroundColor: 'rgba(104, 164, 164, 0.05)'
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="subtitle1" fontWeight={500}>
                          Availability Slot {slotIndex + 1}
                        </Typography>
                        <IconButton
                          onClick={() => removeSlot(slotIndex)}
                          color="error"
                          disabled={formData.slots.length <= 1}
                          sx={{ opacity: formData.slots.length > 1 ? 1 : 0.5 }}
                        >
                          <LightModeIcon />
                        </IconButton>
                      </Box>

                      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                        <TextField
                          name="startDateTime"
                          label="Start Date & Time"
                          type="datetime-local"
                          value={slot.startDateTime}
                          onChange={(e) => handleAvailabilityChange(slotIndex, e)}
                          fullWidth
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                        <TextField
                          name="endDateTime"
                          label="End Date & Time"
                          type="datetime-local"
                          value={slot.endDateTime}
                          onChange={(e) => handleAvailabilityChange(slotIndex, e)}
                          fullWidth
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </Box>

                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={slot.isAvailable}
                            onChange={(e) => {
                              const updatedSlots = [...formData.slots];
                              updatedSlots[slotIndex].isAvailable = e.target.checked;
                              setFormData((prevData) => ({
                                ...prevData,
                                slots: updatedSlots,
                              }));
                            }}
                            color="primary"
                          />
                        }
                        label="This slot is available for booking"
                      />
                    </Paper>
                  </motion.div>
                ))}
              </AnimatePresence>

              <Button
                variant="outlined"
                onClick={addNewSlot}
                sx={{ 
                  mt: 2,
                  borderRadius: 8,
                  borderColor: 'primary.main',
                  color: 'primary.dark',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'rgba(104, 164, 164, 0.1)',
                  }
                }}
              >
                + Add Another Time Slot
              </Button>

              <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600, mt: 3, mb: 2 }}>
                Session Pricing
              </Typography>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'primary.light',
                  backgroundColor: 'rgba(104, 164, 164, 0.05)'
                }}
              >
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Set your price per session (45-50 minutes)
                </Typography>
                <TextField
                  name="sessionPrice"
                  label="Session Price (USD)"
                  type="number"
                  value={formData.sessionPrice}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{
                    startAdornment: <LocalAtmIcon color="action" sx={{ mr: 1 }} />,
                  }}
                  inputProps={{
                    min: 0,
                    step: 5,
                  }}
                />
              </Paper>
            </Box>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 4, 
              my: 4, 
              p: 3, 
              borderRadius: 3,
              backgroundColor: 'background.paper',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}>
              <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600, mb: 2 }}>
                Payment Setup
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                To receive payments from your clients, please set up your payment details
              </Typography>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 4,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'primary.light',
                  backgroundColor: 'rgba(104, 164, 164, 0.05)'
                }}
              >
                <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 3 }}>
                  Payment Provider
                </Typography>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="payment-provider-label">Select Payment Provider</InputLabel>
                  <Select
                    labelId="payment-provider-label"
                    name="provider"
                    value={formData.paymentDetails.provider}
                    onChange={(e) => {
                      setFormData((prevData) => ({
                        ...prevData,
                        paymentDetails: {
                          ...prevData.paymentDetails,
                          provider: e.target.value,
                        },
                      }));
                    }}
                    label="Select Payment Provider"
                  >
                    <MenuItem value="Khalti">Khalti</MenuItem>
                    <MenuItem value="Esewa">Esewa</MenuItem>
                    
                  </Select>
                </FormControl>

                {formData.paymentDetails.provider && (
                  <Fade in={formData.paymentDetails.provider !== ''}>
                    <TextField
                      label={
                        formData.paymentDetails.provider === 'Khalti'
                          ? 'Khalti Account ID'
                          : formData.paymentDetails.provider === 'Esewa'
                          ? 'Esewa Email'
                          : 'Bank Account Details'
                      }
                      name="customerId"
                      value={formData.paymentDetails.customerId}
                      onChange={(e) => {
                        setFormData((prevData) => ({
                          ...prevData,
                          paymentDetails: {
                            ...prevData.paymentDetails,
                            customerId: e.target.value,
                          },
                        }));
                      }}
                      fullWidth
                      multiline={formData.paymentDetails.provider === 'bank_transfer'}
                      rows={formData.paymentDetails.provider === 'bank_transfer' ? 4 : 1}
                      helperText={
                        formData.paymentDetails.provider === 'Khalti'
                          ? 'Enter your Khalti Account ID'
                          : formData.paymentDetails.provider === 'Esewa'
                          ? 'Enter the email associated with your Esewa account'
                          : 'Enter your complete bank account details including account number, routing number, and bank name'
                      }
                    />
                  </Fade>
                )}
              </Paper>

              <Alert severity="info" sx={{ 
                borderRadius: 2, 
                '& .MuiAlert-icon': { color: 'primary.main' } 
              }}>
                Your payment information is encrypted and secured. You will be able to update these details anytime from your profile settings.
              </Alert>

              <Box mt={4} textAlign="center">
                <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600, mb: 2 }}>
                  Review & Finalize
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  You've completed all the required steps! Please review your information before submitting.
                </Typography>
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                  Once submitted, your profile will enter our verification process. This typically takes 1-3 business days.
                </Alert>
              </Box>
            </Box>
          </motion.div>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: 'primary.light', p: 4, textAlign: 'center' }}>
            <Typography variant="h4" color="primary.dark" sx={{ fontWeight: 700, mb: 1 }}>
              Therapist Onboarding
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome to HealNest! Let's set up your therapist profile to start helping clients.
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 4 } }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    StepIconProps={{
                      icon: step.icon,
                    }}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <AnimatePresence mode="wait">
              {getStepContent(activeStep)}
            </AnimatePresence>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ 
                  borderRadius: 8,
                  borderColor: 'primary.main',
                  color: 'primary.dark'
                }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: 8,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default TherapistOnboarding;