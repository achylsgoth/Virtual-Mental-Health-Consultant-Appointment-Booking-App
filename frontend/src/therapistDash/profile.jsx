import React,{ useEffect, useState, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
  Chip,
  OutlinedInput,
  useMediaQuery, CssBaseline
} from '@mui/material';
import { Save, PhotoCamera, Visibility, VisibilityOff, SelfImprovement, Psychology, Favorite } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useProfileStore from '../store/profileUpdateStore.js';
import NavBar from '../components/homenav.jsx';

const ProfileEditPage = () => {
  // Get state and actions from the Zustand store
  const {
    profile,
    isLoading,
    error: storeError,
    avatarUrl,
    fetchProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    clearError
  } = useProfileStore();

  // Local state for form values
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    gender: '',
    bio: '',
    specializations: [],
  });

  // Available specializations
  const availableSpecializations = [
    'Anxiety', 'Depression', 'Trauma', 'PTSD', 'Addiction',
    'Relationships', 'Family Issues', 'Stress Management', 'Self-Esteem',
    'Grief', 'Career Counseling', 'Cognitive Behavioral Therapy (CBT)',
    'Dialectical Behavior Therapy (DBT)', 'Mindfulness', 'Child Therapy'
  ];

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // UI state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  // Form validation
  const [errors, setErrors] = useState({});

  // Fetch user data from backend via Zustand store
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update local form data when profile data is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        fullname: profile.fullname || '',
        email: profile.email || '',
        gender: profile.gender || '',
        bio: profile.bio || '',
        specializations: profile.specializations || [],
      });
    }
  }, [profile]);

  // Show error notification when store has error
  useEffect(() => {
    if (storeError) {
      setNotification({
        open: true,
        message: storeError,
        severity: 'error'
      });
      clearError();
    }
  }, [storeError, clearError]);

  // Handle input changes for profile info
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle specializations change
  const handleSpecializationsChange = (event) => {
    const {
      target: { value },
    } = event;
    // On autofill we get a stringified value.
    const specializations = typeof value === 'string' ? value.split(',') : value;
    setFormData({
      ...formData,
      specializations: specializations
    });
  };

  // Handle input changes for password
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords({
      ...passwords,
      [name]: value
    });
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  // Handle avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await uploadAvatar(file);
        setNotification({
          open: true,
          message: 'Avatar updated successfully',
          severity: 'success'
        });
      } catch (error) {
        setNotification({
          open: true,
          message: 'Failed to upload avatar',
          severity: 'error'
        });
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Validate fullname
    if (!formData.fullname) {
      newErrors.fullname = 'Full name is required';
    }

    // Validate password change if any password field is filled
    if (passwords.currentPassword || passwords.newPassword || passwords.confirmPassword) {
      if (!passwords.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }

      if (!passwords.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (passwords.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }

      if (!passwords.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your new password';
      } else if (passwords.newPassword !== passwords.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Update profile information
      await updateProfile(formData);

      // Change password if provided
      if (passwords.currentPassword && passwords.newPassword) {
        await changePassword({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        });
      }

      setNotification({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });

      // Clear password fields after successful update
      if (passwords.newPassword) {
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // Error notifications are handled by the useEffect that watches storeError
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  const [mode, setMode] = useState('light');

  const theme = useMemo(
      () =>
        createTheme({
          palette: {
            mode,
            primary: {
              main: mode === 'light' ? '#3f51b5' : '#90caf9',
            },
            secondary: {
              main: mode === 'light' ? '#f50057' : '#f48fb1',
            },
            background: {
              default: mode === 'light' ? '#ffffff' : '#121212',
              paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
            },
          },
          typography: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            h1: {
              fontWeight: 700,
              fontSize: '2.5rem',
            },
            h2: {
              fontWeight: 700,
              fontSize: '2rem',
            },
            h3: {
              fontWeight: 600,
              fontSize: '1.5rem',
            },
            h4: {
              fontWeight: 600,
              fontSize: '1.25rem',
            },
          },
          components: {
            MuiButton: {
              styleOverrides: {
                root: {
                  borderRadius: 50,
                  textTransform: 'none',
                },
              },
            },
          },
        }),
      [mode],
    );
  
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
    useEffect(() => {
      // Initialize theme based on user's system preference
      if (prefersDarkMode) {
        setMode('dark');
      }
    }, [prefersDarkMode]);



  return (
    <ThemeProvider theme={theme}>
            <CssBaseline />
            <NavBar mode={mode} setMode={setMode} />
  
      
     
     
      <Container  sx={{ 
        py: 2,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Grid container spacing={3} maxWidth="md">
          {/* Profile Information Card */}
          <Grid item xs={12} md={5}>
            <Box sx={{
              p: 5,
              borderRadius: 4,
              boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.05)',
              background: 'linear-gradient(145deg, #f5f7fa 0%, #e4ecfb 100%)',
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #81c784 0%, #64b5f6 50%, #9575cd 100%)',
              }
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Psychology sx={{ color: '#5c6bc0', fontSize: 48 }} />
              </Box>

              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#37474f' }}>
                Your Wellness Profile
              </Typography>

              {/* Avatar Section */}
              <Box display="flex" flexDirection="column" alignItems="center" mb={4} mt={2}>
                <Avatar
                  src={avatarUrl || '/api/placeholder/150/150'}
                  alt={formData.fullname}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mb: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    border: '4px solid #e4ecfb'
                  }}
                />
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                  size="small"
                  sx={{
                    borderRadius: 3,
                    color: '#5c6bc0',
                    borderColor: '#5c6bc0',
                    '&:hover': {
                      borderColor: '#3949ab',
                      backgroundColor: 'rgba(92, 107, 192, 0.04)'
                    }
                  }}
                >
                  Change Avatar
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleAvatarChange}
                  />
                </Button>
              </Box>

              <Box sx={{ 
                textAlign: 'left', 
                mb: 3,
                '& .MuiGrid-item': {
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2
                }
              }}>
                <Grid container>
                  <Grid item xs={12} sx={{ mb: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'rgba(129, 199, 132, 0.1)',
                      border: '1px solid rgba(129, 199, 132, 0.2)',
                    }}>
                      <SelfImprovement sx={{ color: '#81c784', mr: 2 }} />
                      <Typography variant="body1" sx={{ color: '#455a64' }}>
                        Keep your information up-to-date
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sx={{ mb: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'rgba(92, 107, 192, 0.1)',
                      border: '1px solid rgba(92, 107, 192, 0.2)',
                    }}>
                      <Favorite sx={{ color: '#5c6bc0', mr: 2 }} />
                      <Typography variant="body1" sx={{ color: '#455a64' }}>
                        Your privacy is our priority
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#78909c', mt: 'auto' }}>
                "Taking care of yourself is an important part of the journey."
              </Typography>
            </Box>
          </Grid>

          {/* Edit Form Card */}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                width: '100%',
                px: 4,
                py: 5,
                backgroundColor: 'white',
                borderRadius: 4,
                boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #64b5f6 0%, #81c784 50%, #ffb74d 100%)',
                }
              }}
            >
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#37474f', textAlign: 'center', mb: 3 }}>
                  Edit Your Profile
                </Typography>

                <Divider sx={{ my: 2, color: '#90a4ae', '&::before, &::after': { borderColor: '#cfd8dc' } }} />

                {/* Personal Information Section */}
                <Typography variant="h6" gutterBottom sx={{ color: '#546e7a', fontWeight: 500, mb: 2 }}>
                  Personal Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="fullname"
                      label="Full Name"
                      value={formData.fullname}
                      onChange={handleProfileChange}
                      fullWidth
                      error={!!errors.fullname}
                      helperText={errors.fullname}
                      sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          '&:hover fieldset': {
                            borderColor: '#64b5f6',
                          },
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: '#b0bec5',
                        },
                        "& .MuiInputLabel-root": {
                          color: '#78909c',
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: '#5c6bc0',
                        },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: '#5c6bc0',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="email"
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleProfileChange}
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email}
                      sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          '&:hover fieldset': {
                            borderColor: '#64b5f6',
                          },
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: '#b0bec5',
                        },
                        "& .MuiInputLabel-root": {
                          color: '#78909c',
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: '#5c6bc0',
                        },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: '#5c6bc0',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        '&:hover fieldset': {
                          borderColor: '#64b5f6',
                        },
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: '#b0bec5',
                      },
                      "& .MuiInputLabel-root": {
                        color: '#78909c',
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: '#5c6bc0',
                      },
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: '#5c6bc0',
                      },
                    }}>
                      <InputLabel id="gender-label">Gender</InputLabel>
                      <Select
                        labelId="gender-label"
                        name="gender"
                        value={formData.gender}
                        label="Gender"
                        onChange={handleProfileChange}
                      >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                        <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {profile?.role !== 'client' && (
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          '&:hover fieldset': {
                            borderColor: '#64b5f6',
                          },
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: '#b0bec5',
                        },
                        "& .MuiInputLabel-root": {
                          color: '#78909c',
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: '#5c6bc0',
                        },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: '#5c6bc0',
                        },
                      }}>
                        <InputLabel id="specializations-label">Specializations</InputLabel>
                        <Select
                          labelId="specializations-label"
                          id="specializations"
                          multiple
                          value={formData.specializations}
                          onChange={handleSpecializationsChange}
                          input={<OutlinedInput id="select-multiple-chip" label="Specializations" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} sx={{ 
                                  backgroundColor: 'rgba(92, 107, 192, 0.1)', 
                                  color: '#5c6bc0',
                                  borderColor: 'rgba(92, 107, 192, 0.2)',
                                }} />
                              ))}
                            </Box>
                          )}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 224,
                                width: 250,
                              },
                            },
                          }}
                        >
                          {availableSpecializations.map((specialization) => (
                            <MenuItem
                              key={specialization}
                              value={specialization}
                            >
                              {specialization}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <TextField
                      name="bio"
                      label="Bio"
                      multiline
                      rows={4}
                      value={formData.bio}
                      onChange={handleProfileChange}
                      fullWidth
                      placeholder="Tell us about yourself..."
                      sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          '&:hover fieldset': {
                            borderColor: '#64b5f6',
                          },
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: '#b0bec5',
                        },
                        "& .MuiInputLabel-root": {
                          color: '#78909c',
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: '#5c6bc0',
                        },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: '#5c6bc0',
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3, color: '#90a4ae', '&::before, &::after': { borderColor: '#cfd8dc' } }} />

                {/* Password Section */}
                <Typography variant="h6" gutterBottom sx={{ color: '#546e7a', fontWeight: 500, mb: 2 }}>
                  Change Password
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="currentPassword"
                      label="Current Password"
                      type={showPassword.currentPassword ? 'text' : 'password'}
                      value={passwords.currentPassword}
                      onChange={handlePasswordChange}
                      fullWidth
                      error={!!errors.currentPassword}
                      helperText={errors.currentPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => handleTogglePasswordVisibility('currentPassword')}
                              edge="end"
                            >
                              {showPassword.currentPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          '&:hover fieldset': {
                            borderColor: '#64b5f6',
                          },
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: '#b0bec5',
                        },
                        "& .MuiInputLabel-root": {
                          color: '#78909c',
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: '#5c6bc0',
                        },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: '#5c6bc0',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="newPassword"
                      label="New Password"
                      type={showPassword.newPassword ? 'text' : 'password'}
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      fullWidth
                      error={!!errors.newPassword}
                      helperText={errors.newPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => handleTogglePasswordVisibility('newPassword')}
                              edge="end"
                            >
                              {showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          '&:hover fieldset': {
                            borderColor: '#64b5f6',
                          },
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: '#b0bec5',
                        },
                        "& .MuiInputLabel-root": {
                          color: '#78909c',
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: '#5c6bc0',
                        },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: '#5c6bc0',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="confirmPassword"
                      label="Confirm New Password"
                      type={showPassword.confirmPassword ? 'text' : 'password'}
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      fullWidth
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => handleTogglePasswordVisibility('confirmPassword')}
                              edge="end"
                            >
                              {showPassword.confirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          '&:hover fieldset': {
                            borderColor: '#64b5f6',
                          },
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: '#b0bec5',
                        },
                        "& .MuiInputLabel-root": {
                          color: '#78909c',
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: '#5c6bc0',
                        },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: '#5c6bc0',
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Submit Button */}
                <Box display="flex" justifyContent="center" mt={4}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    startIcon={<Save />}
                    sx={{ 
                      py: 1.5, 
                      px: 4,
                      backgroundColor: '#5c6bc0', 
                      borderRadius: 3,
                      boxShadow: '0 4px 12px rgba(92, 107, 192, 0.3)',
                      textTransform: 'none',
                      fontSize: '1rem',
                      ':hover': { 
                        backgroundColor: '#3949ab',
                        boxShadow: '0 6px 14px rgba(92, 107, 192, 0.4)',
                      }
                    }}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Notifications */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ 
              width: '100%',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
      </ThemeProvider>
   
  );
};

export default ProfileEditPage;