import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Typography, 
  Container, 
  Grid, 
  Box, 
  Card,
  CardContent,
  Avatar,
  Button,
  Skeleton,
  useMediaQuery,
  Divider,
  Paper
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Psychology as PsychologyIcon,
  Computer as ComputerIcon,
  Security as SecurityIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Forum as ForumIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/homenav';

// Animation hook for scroll effects - same as in HomePage
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

// Animated component wrapper - same as in HomePage
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

// Info Item Component
const InfoItem = ({ icon, primary, secondary, isLoading }) => {
  const Icon = icon;
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
        <Box>
          <Skeleton variant="text" height={24} width={150} />
        </Box>
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box
        sx={{
          mr: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.light',
          borderRadius: '50%',
          width: 40,
          height: 40,
          opacity: 0.8
        }}
      >
        <Icon color="primary" />
      </Box>
      <Box>
        <Typography variant="body1" fontWeight="medium">{primary}</Typography>
        {secondary && <Typography variant="body2" color="text.secondary">{secondary}</Typography>}
      </Box>
    </Box>
  );
};

// Feature Item Component
const FeatureItem = ({ title, description, isLoading, index }) => {
  if (isLoading) {
    return (
      <Box sx={{ ml: 3, mb: 4 }}>
        <Skeleton variant="text" height={30} width="70%" />
        <Skeleton variant="text" height={20} width="90%" />
        <Skeleton variant="text" height={20} width="80%" />
      </Box>
    );
  }
  
  return (
    <AnimatedElement delay={0.1 * index}>
      <Box sx={{ ml: 3, mb: 4 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2">
          {description}
        </Typography>
      </Box>
    </AnimatedElement>
  );
};

// Service Card Component
const ServiceCard = ({ title, description, isLoading, index }) => {
  if (isLoading) {
    return (
      <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
    );
  }
  
  return (
    <AnimatedElement delay={0.1 * index}>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h5" component="h3" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

const AboutUsPage = () => {
  // State for theme mode (light/dark)
  const [mode, setMode] = useState('light');
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Create a theme instance based on the current mode - same as in HomePage
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

  const navigate = useNavigate();

  const signUp = () => {
    navigate('/signup');
  };
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        {/* Navigation Bar */}
        <NavBar mode={mode} setMode={setMode} />

        {/* Header */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={5} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              {isLoading ? (
                <Skeleton 
                  variant="rectangular" 
                  width="100%" 
                  height={300} 
                  sx={{ borderRadius: 2 }}
                />
              ) : (
                <AnimatedElement direction="right">
                  <Box 
                    component="img" 
                    src="/api/placeholder/500/400" 
                    alt="HealNest Platform"
                    sx={{ 
                      width: '100%', 
                      maxHeight: 300,
                      objectFit: 'cover',
                      borderRadius: 2,
                      boxShadow: 3
                    }}
                  />
                </AnimatedElement>
              )}
            </Grid>
            <Grid item xs={12} md={7}>
              {isLoading ? (
                <>
                  <Skeleton variant="text" height={60} width="70%" />
                  <Skeleton variant="text" height={30} width="50%" sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={24} width="90%" />
                  <Skeleton variant="text" height={24} width="80%" />
                  <Skeleton variant="text" height={24} width="85%" />
                  <Box sx={{ mt: 3 }}>
                    <Skeleton variant="rectangular" width={150} height={50} sx={{ borderRadius: 50 }} />
                  </Box>
                </>
              ) : (
                <AnimatedElement direction="left">
                  <Typography variant="h1" component="h1" gutterBottom>
                    Welcome to HealNest
                  </Typography>
                  <Typography variant="h5" color="primary" gutterBottom>
                    Your safe, supportive space for mental wellness
                  </Typography>
                  <Typography variant="body1" paragraph>
                    At HealNest, we believe that everyone deserves access to compassionate, 
                    personalized mental health care. We're building a platform that bridges 
                    the gap between people seeking support and professional therapists who are 
                    ready to help — all through a secure, virtual environment.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    onClick={signUp}
                    sx={{ mt: 2 }}
                  >
                    Join the Nest
                  </Button>
                </AnimatedElement>
              )}
            </Grid>
          </Grid>
        </Container>

        {/* Mission & Contact Info Section */}
        <Box sx={{ bgcolor: mode === 'light' ? 'grey.100' : 'grey.900', py: 4 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                {isLoading ? (
                  <Skeleton variant="text" height={40} width="50%" sx={{ mb: 2 }} />
                ) : (
                  <AnimatedElement>
                    <Typography variant="h4" component="h2" gutterBottom>
                      Our Mission
                    </Typography>
                    <Typography variant="body1" paragraph>
                      To make mental health support accessible, affordable, and stigma-free, 
                      no matter where you are. Whether you're navigating anxiety, stress, 
                      relationship challenges, or just need someone to talk to, we're here 
                      to connect you with licensed professionals who truly care.
                    </Typography>
                  </AnimatedElement>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {isLoading ? (
                  <Skeleton variant="text" height={40} width="50%" sx={{ mb: 2 }} />
                ) : (
                  <AnimatedElement>
                    <Typography variant="h4" component="h2" gutterBottom>
                      Contact Us
                    </Typography>
                  </AnimatedElement>
                )}
                <InfoItem 
                  icon={LocationIcon} 
                  primary="Kathmandu, Nepal" 
                  secondary="Serving clients nationwide through our virtual platform"
                  isLoading={isLoading}
                />
                <InfoItem 
                  icon={EmailIcon} 
                  primary="support@healnest.com"
                  secondary="We respond within 24 hours"
                  isLoading={isLoading}
                />
                <InfoItem 
                  icon={PhoneIcon} 
                  primary="(800) 555-NEST"
                  secondary="Mon-Fri, 9am-6pm UTC"
                  isLoading={isLoading}
                />
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* What We Offer */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          {isLoading ? (
            <Skeleton variant="text" height={60} width={300} sx={{ mb: 4 }} />
          ) : (
            <AnimatedElement>
              <Typography variant="h2" component="h2" gutterBottom sx={{ mb: 4 }}>
                What We Offer
              </Typography>
            </AnimatedElement>
          )}
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <ServiceCard 
                title="Virtual Therapy Sessions"
                description="Secure, one-on-one online sessions with qualified therapists from the comfort of your home. Our video platform ensures privacy and clarity for a seamless therapeutic experience."
                isLoading={isLoading}
                index={0}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <ServiceCard 
                title="Flexible Booking"
                description="Choose a time that works for you, with easy rescheduling options. Our system integrates with your calendar and sends helpful reminders so you never miss a session."
                isLoading={isLoading}
                index={1}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <ServiceCard 
                title="Therapist Matching"
                description="Find professionals that suit your needs, specialties, and preferences. Our algorithm helps connect you with therapists whose expertise aligns with your specific concerns."
                isLoading={isLoading}
                index={2}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <ServiceCard 
                title="Community Support"
                description="Engage in forum discussions and share your journey in a judgment-free space. Connect with others who understand what you're going through and find strength in community."
                isLoading={isLoading}
                index={3}
              />
            </Grid>
          </Grid>
          
          {!isLoading && (
            <AnimatedElement delay={0.4}>
              <Typography variant="body1" paragraph sx={{ mt: 6, textAlign: 'center' }}>
                We're more than just a platform — we're a community focused on healing, growth, and human connection. 
                We blend technology with empathy to create an experience that feels personal, safe, and meaningful.
              </Typography>
            </AnimatedElement>
          )}
        </Container>

        {/* Platform Features */}
        <Box sx={{ bgcolor: mode === 'light' ? 'grey.100' : 'grey.900', py: 8 }}>
          <Container maxWidth="lg">
            {isLoading ? (
              <Skeleton variant="text" height={60} width={300} sx={{ mb: 4 }} />
            ) : (
              <AnimatedElement>
                <Typography variant="h2" component="h2" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
                  Smart Platform Features
                </Typography>
              </AnimatedElement>
            )}
            
            <Grid container spacing={6}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex' }}>
                  <Box sx={{ 
                    width: 4, 
                    bgcolor: 'primary.main',
                    borderRadius: 4
                  }} />
                  <Box sx={{ width: '100%' }}>
                    {isLoading ? (
                      <Skeleton variant="text" height={40} width="80%" sx={{ ml: 3, mb: 3 }} />
                    ) : (
                      <AnimatedElement>
                        <Typography variant="h4" component="h3" sx={{ ml: 3, mb: 3 }}>
                          <ComputerIcon 
                            sx={{ 
                              verticalAlign: 'middle', 
                              mr: 1, 
                              color: 'primary.main' 
                            }} 
                          />
                          For Clients
                        </Typography>
                      </AnimatedElement>
                    )}
                    
                    <FeatureItem 
                      title="Smart Calendar Integration"
                      description="Seamless Google Calendar scheduling with automated reminders to help you stay on track with your therapy journey."
                      isLoading={isLoading}
                      index={0}
                    />
                    
                    <FeatureItem 
                      title="Instant Session Access"
                      description="One-click Google Meet links delivered right when you need them, making it easy to connect with your therapist."
                      isLoading={isLoading}
                      index={1}
                    />
                    
                    <FeatureItem 
                      title="Secure Messaging"
                      description="Confidential communication with your therapist between sessions for questions or updates."
                      isLoading={isLoading}
                      index={2}
                    />
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex' }}>
                  <Box sx={{ 
                    width: 4, 
                    bgcolor: 'primary.main',
                    borderRadius: 4
                  }} />
                  <Box sx={{ width: '100%' }}>
                    {isLoading ? (
                      <Skeleton variant="text" height={40} width="80%" sx={{ ml: 3, mb: 3 }} />
                    ) : (
                      <AnimatedElement>
                        <Typography variant="h4" component="h3" sx={{ ml: 3, mb: 3 }}>
                          <PsychologyIcon 
                            sx={{ 
                              verticalAlign: 'middle', 
                              mr: 1, 
                              color: 'primary.main' 
                            }} 
                          />
                          For Therapists
                        </Typography>
                      </AnimatedElement>
                    )}
                    
                    <FeatureItem 
                      title="Practice Management"
                      description="Tools to effortlessly manage your client schedule, session notes, and billing all in one place."
                      isLoading={isLoading}
                      index={0}
                    />
                    
                    <FeatureItem 
                      title="Client Matching"
                      description="Connect with clients whose needs align with your expertise and availability."
                      isLoading={isLoading}
                      index={1}
                    />
                    
                    <FeatureItem 
                      title="Professional Growth"
                      description="Access to continuing education resources and a community of fellow mental health professionals."
                      isLoading={isLoading}
                      index={2}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Why HealNest */}
        <Container maxWidth="md" sx={{ py: 8 }}>
          {isLoading ? (
            <>
              <Skeleton variant="text" height={60} width={300} sx={{ mb: 3 }} />
              <Skeleton variant="text" height={24} width="90%" />
              <Skeleton variant="text" height={24} width="95%" />
              <Skeleton variant="text" height={24} width="85%" />
              <Skeleton variant="text" height={24} width="92%" />
            </>
          ) : (
            <AnimatedElement>
              <Typography variant="h2" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
                Why HealNest?
              </Typography>
              <Typography variant="body1" paragraph>
                We understand that seeking help can be intimidating. That's why we've created a platform that 
                prioritizes your comfort, privacy, and individual needs. Every step, from registration to your 
                first session, is designed to be intuitive and supportive.
              </Typography>
              <Typography variant="body1" paragraph>
                Our community of therapists undergoes rigorous verification to ensure you're matched with licensed, 
                experienced professionals. We believe in the power of the right therapeutic relationship and strive 
                to connect you with someone who truly understands your unique circumstances.
              </Typography>
              <Typography variant="body1" paragraph>
                HealNest is committed to making mental healthcare accessible to everyone. Our flexible pricing 
                options, insurance support, and sliding scale fees aim to remove financial barriers to quality care.
              </Typography>
              <Typography variant="body1">
                Whether you're experiencing a specific challenge or simply want to invest in your mental wellbeing, 
                HealNest provides the tools, resources, and connections to support your journey toward a healthier, 
                more balanced life.
              </Typography>
            </AnimatedElement>
          )}
        </Container>

        {/* Call to Action */}
        <Box 
          sx={{ 
            bgcolor: 'primary.main',
            py: 8,
            color: 'white'
          }}
        >
          <Container maxWidth="md" sx={{ textAlign: 'center' }}>
            {isLoading ? (
              <>
                <Skeleton variant="text" height={60} width="70%" sx={{ mx: 'auto', mb: 2 }} />
                <Skeleton variant="text" height={24} width="80%" sx={{ mx: 'auto', mb: 4 }} />
                <Skeleton variant="rectangular" width={200} height={50} sx={{ borderRadius: 50, mx: 'auto' }} />
              </>
            ) : (
              <AnimatedElement>
                <Typography variant="h2" component="h2" gutterBottom>
                  Join the Nest
                </Typography>
                <Typography variant="h6" sx={{ mb: 4 }}>
                  Start your healing journey today. Connect with therapists who care.
                </Typography>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large" 
                  onClick={signUp}
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'secondary.dark',
                    }
                  }}
                >
                  Create Your Account
                </Button>
              </AnimatedElement>
            )}
          </Container>
        </Box>

        {/* Footer */}
        <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4 }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="grey.500" align="center">
              © 2025 HealNest, Inc. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </div>
    </ThemeProvider>
  );
};

export default AboutUsPage;