import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  TextField, 
  Box, 
  Rating, 
  Divider, 
  IconButton, 
  Paper,
  Switch,
  FormControlLabel,
  useMediaQuery,
  Menu,
  MenuItem,
  Skeleton
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Videocam as VideocamIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import homanImg from '../assets/homan.png';
import NavBar from '../components/homenav';

// Animation hook for scroll effects
const useScrollAnimation = (threshold = 0.1) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return [ref, isVisible];
};

// Animated component wrapper
const AnimatedElement = ({ children, delay = 0, duration = 0.6, direction = 'up', threshold = 0.1 }) => {
  const [ref, isVisible] = useScrollAnimation(threshold);
  
  const getTransform = () => {
    switch (direction) {
      case 'up': return 'translateY(20px)';
      case 'down': return 'translateY(-20px)';
      case 'left': return 'translateX(20px)';
      case 'right': return 'translateX(-20px)';
      default: return 'translateY(20px)';
    }
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate(0)' : getTransform(),
        transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

// Skeleton for TherapistCard
const TherapistCardSkeleton = () => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" height={40} width="80%" />
        <Skeleton variant="text" height={20} width="50%" />
        <Box display="flex" alignItems="center" mb={1}>
          <Skeleton variant="rectangular" width={120} height={24} />
        </Box>
        <Skeleton variant="text" height={20} width="100%" />
        <Skeleton variant="text" height={20} width="90%" />
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Skeleton variant="text" width={80} height={32} />
          <Skeleton variant="rectangular" width={100} height={36} />
        </Box>
      </CardContent>
    </Card>
  );
};

const TherapistCard = ({ name, title, rating, reviews, specialty, price, mode, index }) => {
  return (
    <AnimatedElement delay={0.1 * index}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h3" gutterBottom>
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Box display="flex" alignItems="center" mb={1}>
            <Rating value={rating} precision={0.1} readOnly size="small" />
            <Typography variant="body2" color="text.secondary" ml={1}>
              ({reviews}+ reviews)
            </Typography>
          </Box>
          <Typography variant="body2" paragraph>
            {specialty}
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="primary">
              ${price}/session
            </Typography>
            <Button variant="contained" color="primary" size="small">
              Book Now
            </Button>
          </Box>
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

// Skeleton for How It Works section
const HowItWorksItemSkeleton = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
    <Skeleton variant="circular" width={70} height={70} sx={{ mb: 2 }} />
    <Skeleton variant="text" height={40} width="70%" sx={{ mb: 1 }} />
    <Skeleton variant="text" height={20} width="90%" />
    <Skeleton variant="text" height={20} width="80%" />
  </Box>
);

const HomePage = () => {
  // State for theme mode (light/dark)
  const [mode, setMode] = useState('light');
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Theme menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleThemeMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleThemeChange = (newMode) => {
    setMode(newMode);
    handleMenuClose();
  };

  // Create a theme instance based on the current mode
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

  useEffect(() => {
    // Simulate loading delay for demonstration purposes
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const navigate = useNavigate(); // Hook to navigate

  const goToSignIn = () => {
    navigate("/signin"); // Redirects to sign-in page
  };

  const goToRoleSelection = () => {
    navigate("/select-role"); // Redirects to role selection page
  };

  const findTherapist = () => {
    navigate('/therapist-search');
  };
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        {/* Header */}
       <NavBar mode={mode} setMode={setMode}>
          </NavBar>

        {/* Hero Section */}
        <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              {isLoading ? (
                <>
                  <Skeleton variant="text" height={60} width="90%" />
                  <Skeleton variant="text" height={60} width="70%" />
                  <Skeleton variant="text" height={24} width="80%" sx={{ mt: 2 }} />
                  <Skeleton variant="text" height={24} width="75%" />
                  <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Skeleton variant="rectangular" width={150} height={50} sx={{ borderRadius: 50 }} />
                    <Skeleton variant="rectangular" width={150} height={50} sx={{ borderRadius: 50 }} />
                  </Box>
                </>
              ) : (
                <AnimatedElement direction="right">
                  <Typography variant="h1" component="h1" gutterBottom>
                    Your Journey to Mental Wellness Starts Here
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Connect with licensed therapists online. Book your virtual therapy sessions 
                    easily and start your healing journey.
                  </Typography>
                  <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button variant="contained" color="primary" size="large" onClick={findTherapist}>
                      Find a Therapist
                    </Button>
                    <Button variant="outlined" color="primary" size="large">
                      Learn More
                    </Button>
                  </Box>
                </AnimatedElement>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {isLoading ? (
                <Skeleton 
                  variant="rectangular" 
                  width="100%" 
                  height={400} 
                  sx={{ borderRadius: 2 }}
                />
              ) : (
                <AnimatedElement direction="left" delay={0.2}>
                  <Box component="img" 
                    src={homanImg} 
                    alt="Woman having online therapy session"
                    sx={{ width: '100%' }}
                  />
                </AnimatedElement>
              )}
            </Grid>
          </Grid>

      
         
          
        </Container>

        {/* Featured Therapists */}
        <Box sx={{ py: 8, bgcolor: mode === 'light' ? 'grey.100' : 'grey.900' }}>
          <Container maxWidth="lg">
            {isLoading ? (
              <Skeleton variant="text" height={60} width={300} sx={{ mx: 'auto', mb: 6 }} />
            ) : (
              <AnimatedElement>
                <Typography variant="h2" component="h2" align="center" gutterBottom sx={{ mb: 6 }}>
                  Featured Therapists
                </Typography>
              </AnimatedElement>
            )}
            <Grid container spacing={4}>
              {isLoading ? (
                <>
                  <Grid item xs={12} sm={6} md={4}>
                    <TherapistCardSkeleton />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TherapistCardSkeleton />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TherapistCardSkeleton />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} sm={6} md={4}>
                    <TherapistCard 
                      name="Dr. Sarah Johnson"
                      title="Clinical Psychologist"
                      rating={4.9}
                      reviews="290"
                      specialty="Specializes in anxiety, depression, and trauma"
                      price={120}
                      mode={mode}
                      index={0}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TherapistCard 
                      name="Dr. Michael Chen"
                      title="Psychiatrist"
                      rating={4.8}
                      reviews="150"
                      specialty="Specializes in mood disorders and ADHD"
                      price={150}
                      mode={mode}
                      index={1}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TherapistCard 
                      name="Dr. Emily Rodriguez"
                      title="Family Therapist"
                      rating={4.9}
                      reviews="187"
                      specialty="Specializes in relationships and family issues"
                      price={130}
                      mode={mode}
                      index={2}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Container>
        </Box>

        {/* How It Works */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          {isLoading ? (
            <>
              <Skeleton variant="text" height={60} width={300} sx={{ mx: 'auto', mb: 6 }} />
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <HowItWorksItemSkeleton />
                </Grid>
                <Grid item xs={12} md={4}>
                  <HowItWorksItemSkeleton />
                </Grid>
                <Grid item xs={12} md={4}>
                  <HowItWorksItemSkeleton />
                </Grid>
              </Grid>
            </>
          ) : (
            <>
              <AnimatedElement>
                <Typography variant="h2" component="h2" align="center" gutterBottom sx={{ mb: 6 }}>
                  How It Works
                </Typography>
              </AnimatedElement>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <AnimatedElement delay={0.1}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <Box 
                        sx={{ 
                          bgcolor: 'primary.light', 
                          color: 'primary.main',
                          borderRadius: '50%',
                          width: 70,
                          height: 70,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          opacity: 0.2
                        }}
                      >
                        <SearchIcon color="primary" fontSize="large" />
                      </Box>
                      <Typography variant="h3" component="h3" gutterBottom>
                        Find Your Therapist
                      </Typography>
                      <Typography>
                        Browse through our network of licensed therapists and find the right match for your needs
                      </Typography>
                    </Box>
                  </AnimatedElement>
                </Grid>
                <Grid item xs={12} md={4}>
                  <AnimatedElement delay={0.2}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <Box 
                        sx={{ 
                          bgcolor: 'primary.light', 
                          color: 'primary.main',
                          borderRadius: '50%',
                          width: 70,
                          height: 70,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          opacity: 0.2
                        }}
                      >
                        <CalendarIcon color="primary" fontSize="large" />
                      </Box>
                      <Typography variant="h3" component="h3" gutterBottom>
                        Book a Session
                      </Typography>
                      <Typography>
                        Choose your preferred date and time for your virtual therapy session
                      </Typography>
                    </Box>
                  </AnimatedElement>
                </Grid>
                <Grid item xs={12} md={4}>
                  <AnimatedElement delay={0.3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <Box 
                        sx={{ 
                          bgcolor: 'primary.light', 
                          color: 'primary.main',
                          borderRadius: '50%',
                          width: 70,
                          height: 70,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          opacity: 0.2
                        }}
                      >
                        <VideocamIcon color="primary" fontSize="large" />
                      </Box>
                      <Typography variant="h3" component="h3" gutterBottom>
                        Start Your Session
                      </Typography>
                      <Typography>
                        Connect with your therapist via our secure video platform and begin your journey
                      </Typography>
                    </Box>
                  </AnimatedElement>
                </Grid>
              </Grid>
            </>
          )}
        </Container>

        {/* Footer */}
        <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              {isLoading ? (
                <>
                  <Grid item xs={12} md={3}>
                    <Skeleton variant="text" height={32} width="70%" />
                    <Skeleton variant="text" height={24} width="90%" sx={{ mt: 1 }} />
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Skeleton variant="circular" width={30} height={30} />
                      <Skeleton variant="circular" width={30} height={30} />
                      <Skeleton variant="circular" width={30} height={30} />
                      <Skeleton variant="circular" width={30} height={30} />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Skeleton variant="text" height={32} width="60%" />
                    <Skeleton variant="text" height={24} width="80%" sx={{ mt: 1 }} />
                    <Skeleton variant="text" height={24} width="70%" sx={{ mt: 1 }} />
                    <Skeleton variant="text" height={24} width="75%" sx={{ mt: 1 }} />
                    <Skeleton variant="text" height={24} width="65%" sx={{ mt: 1 }} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Skeleton variant="text" height={32} width="60%" />
                    <Skeleton variant="text" height={24} width="70%" sx={{ mt: 1 }} />
                    <Skeleton variant="text" height={24} width="80%" sx={{ mt: 1 }} />
                    <Skeleton variant="text" height={24} width="90%" sx={{ mt: 1 }} />
                    <Skeleton variant="text" height={24} width="75%" sx={{ mt: 1 }} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Skeleton variant="text" height={32} width="80%" />
                    <Skeleton variant="text" height={24} width="70%" sx={{ mt: 1 }} />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} md={3}>
                    <AnimatedElement>
                      <Typography variant="h6" gutterBottom>
                        HealNest
                      </Typography>
                      <Typography variant="body2" color="grey.400" paragraph>
                        Your trusted partner in mental wellness
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <IconButton size="small" sx={{ color: 'grey.500' }}>
                          <FacebookIcon />
                        </IconButton>
                        <IconButton size="small" sx={{ color: 'grey.500' }}>
                          <TwitterIcon />
                        </IconButton>
                        <IconButton size="small" sx={{ color: 'grey.500' }}>
                          <InstagramIcon />
                        </IconButton>
                        <IconButton size="small" sx={{ color: 'grey.500' }}>
                          <LinkedInIcon />
                        </IconButton>
                      </Box>
                    </AnimatedElement>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <AnimatedElement delay={0.1}>
                      <Typography variant="h6" gutterBottom>
                        Quick Links
                      </Typography>
                      <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                        <Box component="li" sx={{ mb: 1 }}>
                          <Button sx={{ color: 'grey.400', p: 0, textTransform: 'none' }}>
                            Find Therapist
                          </Button>
                        </Box>
                        <Box component="li" sx={{ mb: 1 }}>
                          <Button sx={{ color: 'grey.400', p: 0, textTransform: 'none' }}>
                            How It Works
                          </Button>
                        </Box>
                        <Box component="li" sx={{ mb: 1 }}>
                          <Button sx={{ color: 'grey.400', p: 0, textTransform: 'none' }}>
                            Resources
                          </Button>
                        </Box>
                        <Box component="li" sx={{ mb: 1 }}>
                          <Button sx={{ color: 'grey.400', p: 0, textTransform: 'none' }}>
                            About Us
                          </Button>
                        </Box>
                      </Box>
                    </AnimatedElement>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <AnimatedElement delay={0.2}>
                      <Typography variant="h6" gutterBottom>
                        Support
                      </Typography>
                      <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                        <Box component="li" sx={{ mb: 1 }}>
                          <Button sx={{ color: 'grey.400', p: 0, textTransform: 'none' }}>
                            FAQ
                          </Button>
                        </Box>
                        <Box component="li" sx={{ mb: 1 }}>
                          <Button sx={{ color: 'grey.400', p: 0, textTransform: 'none' }}>
                            Contact Us
                          </Button>
                        </Box>
                        <Box component="li" sx={{ mb: 1 }}>
                          <Button sx={{ color: 'grey.400', p: 0, textTransform: 'none' }}>
                            Privacy Policy
                          </Button>
                        </Box>
                        <Box component="li" sx={{ mb: 1 }}>
                          <Button sx={{ color: 'grey.400', p: 0, textTransform: 'none' }}>
                            Terms of Service
                          </Button>
                        </Box>
                      </Box>
                    </AnimatedElement>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <AnimatedElement delay={0.3}>
                      <Typography variant="h6" gutterBottom>
                        Connect With Us
                      </Typography>
                      <Typography variant="body2" color="grey.400">
                        support@healnest.com
                      </Typography>
                    </AnimatedElement>
                  </Grid>
                </>
              )}
            </Grid>
            <Divider sx={{ my: 4, borderColor: 'grey.800' }} />
            <Typography variant="body2" color="grey.500" align="center">
              © 2025 HealNest. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </div>
    </ThemeProvider>
  );
};

export default HomePage;