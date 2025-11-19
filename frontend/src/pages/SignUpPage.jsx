import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Divider, Container, Grid, Alert } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import PsychologyIcon from '@mui/icons-material/Psychology';
import toast from 'react-hot-toast';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    role: '',
  });
  const [errors, setErrors] = useState({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signup, error } = useAuthStore();

  useEffect(() => {
    const stateParam = searchParams.get("state");
    if (stateParam) {
      try {
        const decodedState = JSON.parse(decodeURIComponent(stateParam));
        const role = decodedState.role;
        setFormData((prevData) => ({ ...prevData, role }));
      } catch (error) {
        console.error("Error decoding state:", error);
      }
    }
  }, [searchParams, navigate]);

  const validate = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.fullname) newErrors.fullname = 'Full name is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        await signup(formData.email, formData.password, formData.username, formData.fullname, formData.role);
        navigate("/verify-email");
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <Box sx={{background: 'linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%)'}}>
    <Container maxWidth="lg" sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      py: 4,
      // background: 'linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%)',
    }}>
      <Grid container spacing={3} alignItems="center">
        {/* Left Side - Benefits Section */}
        <Grid item xs={12} md={6}>
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
              <PsychologyIcon sx={{ color: '#5c6bc0', fontSize: 48 }} />
            </Box>
            
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#37474f' }}>
              Begin Your Wellness Journey
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, color: '#546e7a' }}>
              Join our supportive community and discover new ways to nurture your mental wellbeing:
            </Typography>
            
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
                    <SelfImprovementIcon sx={{ color: '#81c784', mr: 2 }} />
                    <Typography variant="body1" sx={{ color: '#455a64' }}>
                      Connect with compassionate, certified therapists
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
                    <FavoriteIcon sx={{ color: '#5c6bc0', mr: 2 }} />
                    <Typography variant="body1" sx={{ color: '#455a64' }}>
                      Safe and confidential therapy sessions
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sx={{ mb: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(100, 181, 246, 0.1)',
                    border: '1px solid rgba(100, 181, 246, 0.2)',
                  }}>
                    <SelfImprovementIcon sx={{ color: '#64b5f6', mr: 2 }} />
                    <Typography variant="body1" sx={{ color: '#455a64' }}>
                      Access therapeutic resources anytime, anywhere
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#78909c', mt: 2 }}>
              "The journey of a thousand miles begins with a single step."
            </Typography>
          </Box>
        </Grid>

        {/* Right Side - Signup Form */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              width: '100%',
              maxWidth: 450,
              px: 4,
              py: 5,
              backgroundColor: 'white',
              borderRadius: 4,
              boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.05)',
              textAlign: 'center',
              mx: 'auto',
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
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <FavoriteIcon sx={{ color: '#5c6bc0', fontSize: 40 }} />
            </Box>
            
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#37474f' }}>
              Create Your Account
            </Typography>
            <Typography variant="body2" color="#78909c" mb={3}>
              We're glad you're here. Let's get started on your journey.
            </Typography>

            <Divider sx={{ my: 2, color: '#90a4ae', '&::before, &::after': { borderColor: '#cfd8dc' } }} />
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  width: "100%", 
                  maxWidth: 450, 
                  mb: 2,
                  borderRadius: 2,
                  '& .MuiAlert-icon': { color: '#e57373' } 
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField 
                fullWidth 
                label="Full name" 
                variant="outlined" 
                margin="normal" 
                name="fullname" 
                value={formData.fullname} 
                onChange={handleChange} 
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
              
              <TextField 
                fullWidth 
                label="Username" 
                variant="outlined" 
                margin="normal" 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                error={!!errors.username} 
                helperText={errors.username}
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
              
              <TextField 
                fullWidth 
                label="Email address" 
                variant="outlined" 
                margin="normal" 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
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
              
              <TextField 
                fullWidth 
                label="Password" 
                variant="outlined" 
                margin="normal" 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                error={!!errors.password} 
                helperText={errors.password}
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

              <Button 
                fullWidth 
                variant="contained" 
                type="submit" 
                sx={{ 
                  mt: 2, 
                  py: 1.5, 
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
                Begin Your Journey
              </Button>
            </form>

            <Divider sx={{ my: 3, color: '#90a4ae', '&::before, &::after': { borderColor: '#cfd8dc' } }} />
            
            <Typography variant="body2" color="#78909c">
              Already have an account?{' '}
              <Typography 
                component="span" 
                sx={{ 
                  color: '#5c6bc0', 
                  textDecoration: 'none', 
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                  } 
                }} 
                onClick={() => navigate("/signin")}
              >
                Sign in
              </Typography>
            </Typography>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Typography variant="caption" color="#78909c">
                Your mental health journey matters. We're here with you every step of the way.
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
    </Box>
  );
}