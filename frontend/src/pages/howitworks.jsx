import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Typography, 
  Container, 
  Grid, 
  Box, 
  Paper,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Skeleton,
  useMediaQuery
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Videocam as VideocamIcon,
  AssignmentTurnedIn as AssignmentIcon,
  Psychology as PsychologyIcon,
  LocalHospital as TherapyIcon 
} from '@mui/icons-material';
import NavBar from '../components/homenav';
import { useNavigate } from 'react-router-dom';

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

// Process Step Component
const ProcessStep = ({ icon, title, description, index, isLoading }) => {
  const Icon = icon;
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', mb: 6 }}>
        <Skeleton variant="circular" width={60} height={60} sx={{ mr: 3 }} />
        <Box sx={{ width: '100%' }}>
          <Skeleton variant="text" height={40} width="50%" />
          <Skeleton variant="text" height={20} width="90%" />
          <Skeleton variant="text" height={20} width="80%" />
        </Box>
      </Box>
    );
  }
  
  return (
    <AnimatedElement delay={0.1 * index}>
      <Box sx={{ display: 'flex', mb: 6 }}>
        <Box 
          sx={{ 
            bgcolor: 'primary.light', 
            color: 'primary.main',
            borderRadius: '50%',
            width: 60,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 3,
            opacity: 0.2,
            flexShrink: 0
          }}
        >
          <Icon color="primary" fontSize="medium" />
        </Box>
        <Box>
          <Typography variant="h4" component="h3" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body1">
            {description}
          </Typography>
        </Box>
      </Box>
    </AnimatedElement>
  );
};

// FAQ Component
const FAQ = ({ question, answer, isLoading }) => {
  if (isLoading) {
    return (
      <Skeleton 
        variant="rectangular" 
        height={80} 
        sx={{ borderRadius: 1, mb: 2 }}
      />
    );
  }
  
  return (
    <AnimatedElement>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h6">{question}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            {answer}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </AnimatedElement>
  );
};

const HowItWorksPage = () => {
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

  const findTherapist = () => {
    navigate('/therapist-search');
  };
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        {/* Navigation Bar */}
        <NavBar mode={mode} setMode={setMode} />

        {/* Hero Section */}
        <Box sx={{ bgcolor: mode === 'light' ? 'primary.light' : 'primary.dark', py: 8, opacity: 0.8 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8} sx={{ mx: 'auto', textAlign: 'center' }}>
                {isLoading ? (
                  <>
                    <Skeleton variant="text" height={60} width="80%" sx={{ mx: 'auto' }} />
                    <Skeleton variant="text" height={24} width="60%" sx={{ mx: 'auto', mt: 2 }} />
                  </>
                ) : (
                  <AnimatedElement>
                    <Typography variant="h1" component="h1" color="white" gutterBottom>
                      How HealNest Works
                    </Typography>
                    <Typography variant="h6" color="white">
                      Your simple path to mental wellness
                    </Typography>
                  </AnimatedElement>
                )}
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Process Section */}
        <Container maxWidth="md" sx={{ py: 8 }}>
          {isLoading ? (
            <Skeleton variant="text" height={60} width={300} sx={{ mb: 6 }} />
          ) : (
            <AnimatedElement>
              <Typography variant="h2" component="h2" gutterBottom sx={{ mb: 6 }}>
                Our Simple Process
              </Typography>
            </AnimatedElement>
          )}
          
          <ProcessStep 
            icon={SearchIcon}
            title="Find Your Therapist"
            description="Browse through our extensive network of licensed therapists. Filter by specialty, experience, location, and more. Read reviews from other clients to help make your decision."
            index={0}
            isLoading={isLoading}
          />
          
          
          <ProcessStep 
            icon={CalendarIcon}
            title="Book Your Session"
            description="Choose a date and time that works for you from your therapist's available slots. Our easy scheduling system lets you book, reschedule, or cancel appointments with just a few clicks."
            index={2}
            isLoading={isLoading}
          />
          
          <ProcessStep 
            icon={VideocamIcon}
            title="Attend Virtual Session"
            description="Connect with your therapist through our secure video platform. No downloads required, just click the link in your email confirmation or your account dashboard to start your session."
            index={3}
            isLoading={isLoading}
          />
          
          <ProcessStep 
            icon={TherapyIcon}
            title="Continue Your Journey"
            description="After your initial session, you can schedule regular follow-ups with your therapist. Track your progress and work together to achieve your mental wellness goals."
            index={4}
            isLoading={isLoading}
          />
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Skeleton variant="rectangular" width={200} height={50} sx={{ borderRadius: 50 }} />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <AnimatedElement delay={0.5}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large" 
                  onClick={findTherapist}
                >
                  Find a Therapist Now
                </Button>
              </AnimatedElement>
            </Box>
          )}
        </Container>

        {/* Benefits Section */}
        <Box sx={{ bgcolor: mode === 'light' ? 'grey.100' : 'grey.900', py: 8 }}>
          <Container maxWidth="lg">
            {isLoading ? (
              <Skeleton variant="text" height={60} width={300} sx={{ mx: 'auto', mb: 6 }} />
            ) : (
              <AnimatedElement>
                <Typography variant="h2" component="h2" align="center" gutterBottom sx={{ mb: 6 }}>
                  Benefits of Online Therapy
                </Typography>
              </AnimatedElement>
            )}
            
            <Grid container spacing={4}>
              {isLoading ? (
                Array(4).fill().map((_, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                  </Grid>
                ))
              ) : (
                <>
                  <Grid item xs={12} md={6}>
                    <AnimatedElement delay={0.1}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h4" component="h3" gutterBottom>
                            Convenience & Flexibility
                          </Typography>
                          <Typography variant="body1">
                            Attend therapy sessions from the comfort of your home or any private space.
                            No commuting required, saving you time and reducing stress. Choose appointment
                            times that fit your schedule, including evenings and weekends.
                          </Typography>
                        </CardContent>
                      </Card>
                    </AnimatedElement>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <AnimatedElement delay={0.2}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h4" component="h3" gutterBottom>
                            Privacy & Comfort
                          </Typography>
                          <Typography variant="body1">
                            Enjoy complete privacy without the possibility of running into someone you know
                            in a waiting room. Our platform is HIPAA-compliant and uses end-to-end encryption
                            to ensure your sessions remain confidential.
                          </Typography>
                        </CardContent>
                      </Card>
                    </AnimatedElement>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <AnimatedElement delay={0.3}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h4" component="h3" gutterBottom>
                            Broader Selection
                          </Typography>
                          <Typography variant="body1">
                            Access a wider range of therapists than might be available in your local area.
                            Find specialists with expertise in your specific concerns, regardless of location.
                            Match with therapists based on your preferences and needs.
                          </Typography>
                        </CardContent>
                      </Card>
                    </AnimatedElement>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <AnimatedElement delay={0.4}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h4" component="h3" gutterBottom>
                            Consistent Support
                          </Typography>
                          <Typography variant="body1">
                            Maintain your therapy schedule even when traveling or during major life transitions.
                            Between-session messaging options allow you to share thoughts or concerns as they arise.
                            Regular sessions promote accountability and sustained progress.
                          </Typography>
                        </CardContent>
                      </Card>
                    </AnimatedElement>
                  </Grid>
                </>
              )}
            </Grid>
          </Container>
        </Box>

        {/* FAQ Section */}
        <Container maxWidth="md" sx={{ py: 8 }}>
          {isLoading ? (
            <Skeleton variant="text" height={60} width={300} sx={{ mb: 6 }} />
          ) : (
            <AnimatedElement>
              <Typography variant="h2" component="h2" gutterBottom sx={{ mb: 6 }}>
                Frequently Asked Questions
              </Typography>
            </AnimatedElement>
          )}
          
          <FAQ 
            question="How do I choose the right therapist for me?"
            answer="When selecting a therapist, consider their areas of specialization, approach to therapy, and experience working with concerns similar to yours. Read therapist profiles and reviews from other clients. Our matching quiz can also help suggest therapists based on your needs. Remember that finding the right therapist sometimes takes time, and it's okay to try sessions with multiple therapists until you find a good fit."
            isLoading={isLoading}
          />
          
          <FAQ 
            question="What technology do I need for online therapy sessions?"
            answer="For the best experience, you'll need a device with a camera and microphone (smartphone, tablet, or computer), a stable internet connection, and a private, quiet space for your sessions. Our platform works on most modern web browsers, so you don't need to download any special software. Before your first session, you can test your equipment through our system check feature."
            isLoading={isLoading}
          />
          
          <FAQ 
            question="How much does online therapy cost?"
            answer="Session fees vary by therapist and range from $100-$200 per session. Many of our therapists accept insurance, and you can filter for those who accept your specific insurance plan. We also offer a sliding scale fee option with select therapists for those facing financial hardship. You can see the exact fee for each therapist on their profile before booking."
            isLoading={isLoading}
          />
          
          <FAQ 
            question="Is online therapy as effective as in-person therapy?"
            answer="Research has shown that online therapy can be just as effective as face-to-face therapy for many common mental health concerns, including anxiety, depression, PTSD, and stress management. Some people even find it more comfortable to open up from their own space. That said, certain situations may benefit from in-person care, and our therapists can help determine if online therapy is appropriate for your specific needs."
            isLoading={isLoading}
          />
          
          <FAQ 
            question="How do I schedule, reschedule, or cancel a session?"
            answer="You can manage all your appointments through your HealNest account dashboard. To schedule a session, simply visit your therapist's profile and click on an available time slot. For rescheduling or cancellation, go to your upcoming appointments, select the session you wish to change, and follow the prompts. Please note that cancellations less than 24 hours before your appointment may incur a fee, depending on your therapist's policy."
            isLoading={isLoading}
          />
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
                <Skeleton variant="text" height={60} width="60%" sx={{ mx: 'auto', mb: 2 }} />
                <Skeleton variant="text" height={24} width="80%" sx={{ mx: 'auto', mb: 4 }} />
                <Skeleton variant="rectangular" width={200} height={50} sx={{ borderRadius: 50, mx: 'auto' }} />
              </>
            ) : (
              <AnimatedElement>
                <Typography variant="h2" component="h2" gutterBottom>
                  Begin Your Wellness Journey Today
                </Typography>
                <Typography variant="h6" sx={{ mb: 4 }}>
                  Your mental health matters. Take the first step toward positive change.
                </Typography>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large" 
                  onClick={findTherapist}
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'secondary.dark',
                    }
                  }}
                >
                  Find Your Therapist
                </Button>
              </AnimatedElement>
            )}
          </Container>
        </Box>

        {/* Footer */}
        <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4 }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="grey.500" align="center">
              © 2025 HealNest. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </div>
    </ThemeProvider>
  );
};

export default HowItWorksPage;