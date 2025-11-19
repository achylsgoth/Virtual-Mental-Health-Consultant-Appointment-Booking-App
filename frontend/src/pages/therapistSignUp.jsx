import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Divider, Container } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Alert from '@mui/material/Alert';
import  toast from 'react-hot-toast';


export default function SignUpPage() {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    role:'',
  });
  const [errors, setErrors] = useState({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {signup, error} = useAuthStore();

  useEffect(() => {
    const stateParam = searchParams.get("state"); // Get the state parameter
    if (stateParam) {
      try {
        const decodedState = JSON.parse(decodeURIComponent(stateParam));
        const role = decodedState.role;
        setFormData((prevData) => ({ ...prevData, role }));
      } catch (error) {
        console.error("Error decoding state:", error);
        
      }
    }
  }, [searchParams, navigate]); // Add navigate to the dependency array
  const validate = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.fullname) {
      newErrors.fullname = 'Full name is required';
      isValid = false;
    }
    if (!formData.username) {
      newErrors.username = 'Username is required';
      isValid = false;
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
      isValid = false;
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      // Handle form submission
      try{
        await signup(formData.email, formData.password,formData.username, formData.fullname, formData.role);
        navigate("/verify-email");
      }catch(error){
        console.log(error);
      }
    
    }
  };




  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Full viewport height
      }}
    >

      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          px: 3,
          py: 4,
          backgroundColor: 'white',
          borderRadius: 10,
          boxShadow: 3,
          textAlign: 'center',
        }}
      >
        {/* Heading */}
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Create your account
        </Typography>
        <Typography variant="body2" color="textSecondary" mb={3}>
          Welcome! Please fill in the details to get started
        </Typography>

        <Divider sx={{ my: 2 }}></Divider>
        {error && (
        <Alert severity="error" sx={{ width: "100%", maxWidth: 400 }}>
          {error}
        </Alert>
      )}

        {/* Input Fields */}
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
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
            }}
          />
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
            }}
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
          />
          <TextField
            fullWidth
            label="Email address"
            variant="outlined"
            margin="normal"
            type="email"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
            }}
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            fullWidth
            label="Password"
            variant="outlined"
            margin="normal"
            type="password"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
            }}
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
          />

          {/* Sign Up Button */}
          <Button
            fullWidth
            variant="contained"
            type="submit"
            onClick={handleSubmit}
            sx={{
              mt: 2,
              py: 1.5,
              backgroundColor: '#34495E',
              borderRadius: 5,
              ':hover': { backgroundColor: '#7756c6' },
            }}
          >
            Signup
          </Button>
        </form>

        {/* Footer */}
        <Divider sx={{ my: 2 }}></Divider>
        <Typography variant="body2" color="textSecondary" mt={2}>
          Already have an account?{' '}
          <Typography
            component="span"
            color="primary"
            onClick={() => navigate("/signin")}
            sx={{ textDecoration: 'underline', cursor: 'pointer' }}
          >
            Sign in
          </Typography>
        </Typography>
      </Box>
    </Container>
  );
}
