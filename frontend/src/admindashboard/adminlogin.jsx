import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Alert,
  Paper
} from '@mui/material';
import { Visibility, VisibilityOff, Login, AdminPanelSettings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useAdminStore from '../store/adminStore'; // Update the import path

const AdminLoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  
  // Get state and actions from the auth store
  const {
    loginAdmin,
    error,
    isLoading,
    isAuthenticated,
    clearError
  } = useAdminStore();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/adminDash');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) clearError();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!credentials.email.trim() || !credentials.password.trim()) {
      clearError();
      useAdminStore.setState({ error: 'Please fill in all fields' });
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      clearError();
      useAdminStore.setState({ error: 'Please enter a valid email address' });
      return;
    }
    
    // Call the login action from the store
    const result = await loginAdmin(credentials.email, credentials.password);
    
    if (result.success) {
      navigate('/adminDash');
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper 
        elevation={6}
        sx={{
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            p: 3, 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <AdminPanelSettings sx={{ fontSize: 40, mb: 1 }} />
          <Typography component="h1" variant="h5" fontWeight="bold">
            Admin Login
          </Typography>
        </Box>
        
        <CardContent sx={{ px: 4, py: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={credentials.email}
              onChange={handleChange}
              variant="outlined"
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={rememberMe} 
                    onChange={() => setRememberMe(!rememberMe)}
                    color="primary"
                  />
                }
                label="Remember me"
              />
              <Typography 
                variant="body2" 
                color="primary" 
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                Forgot password?
              </Typography>
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isLoading}
              startIcon={<Login />}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <Typography variant="body2" color="text.secondary" align="center" mt={2}>
              {"For technical support, please contact "}
              <Typography component="span" color="primary" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                IT Department
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Paper>
    </Container>
  );
};

export default AdminLoginPage;