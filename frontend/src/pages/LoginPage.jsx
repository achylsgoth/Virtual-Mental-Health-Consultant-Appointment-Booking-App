import * as React from 'react';
import { useState } from 'react';
import { Box, TextField, Button, Typography, Divider, Container, Alert } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import MoodIcon from '@mui/icons-material/Mood';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = useState('');

  const { error, login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(email, password);
    try {
      await login(email, password);
      toast.success('Successfully logged in.');
    } catch (error) {
      console.log(error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5555/auth/google';
  };

  return (
    <Box sx={{background: 'linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%)'}}>
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%)',
      }}
    >
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
          Welcome Back
        </Typography>
        <Typography variant="body2" color="textSecondary" mb={3}>
          Your journey to wellness continues here
        </Typography>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          sx={{
            mb: 3,
            textTransform: 'none',
            color: '#455a64',
            borderColor: '#b0bec5',
            borderRadius: 4,
            py: 1.2,
            '&:hover': {
              backgroundColor: '#eceff1',
              borderColor: '#90a4ae',
            }
          }}
        >
          Continue with Google
        </Button>

        <Divider sx={{ my: 2, color: '#90a4ae', '&::before, &::after': { borderColor: '#cfd8dc' } }}>
          <Typography variant="body2" sx={{ px: 1, color: '#78909c' }}>or sign in with email</Typography>
        </Divider>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              '& .MuiAlert-icon': { color: '#e57373' } 
            }}
          >
            {error}
          </Alert>
        )}

        {/* Input Fields */}
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          margin="normal"
          name="email"
          value={email}
          onChange={handleChange}
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
          value={password}
          onChange={handleChange}
          sx={{
            mb: 1,
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

        <Typography 
          variant="body2" 
          color="primary" 
          sx={{ 
            textAlign: 'right', 
            mb: 3, 
            textDecoration: "none", 
            cursor: "pointer",
            color: '#5c6bc0',
            '&:hover': {
              textDecoration: "underline",
            }
          }} 
          onClick={() => navigate("/forgotpassword")}
        >
          Forgot password?
        </Typography>

        <Button
          fullWidth
          variant="contained"
          type='submit'
          sx={{
            mt: 1,
            py: 1.5,
            backgroundColor: '#5c6bc0',
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(92, 107, 192, 0.3)',
            textTransform: 'none',
            fontSize: '1rem',
            ':hover': { 
              backgroundColor: '#3949ab',
              boxShadow: '0 6px 14px rgba(92, 107, 192, 0.4)',
            },
          }}
          onClick={handleSubmit}
        >
          Sign In
        </Button>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="body2" color="#78909c">
            Don't have an account?{' '}
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
              onClick={() => navigate("/signup")}
            >
              Sign up
            </Typography>
          </Typography>
        </Box>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <MoodIcon sx={{ color: '#81c784', mr: 1, fontSize: 18 }} />
          <Typography variant="caption" color="#78909c">
            Take a deep breath. You're doing great.
          </Typography>
        </Box>
      </Box>
    </Container>
    </Box>
  );
}