import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  useTheme,
  useMediaQuery,
  Link
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PsychologyIcon from '@mui/icons-material/Psychology';
import PersonIcon from '@mui/icons-material/Person';

export default function RoleSelection() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleRoleSelect = (role) => {
    const state = encodeURIComponent(JSON.stringify({role}));
    navigate(`/signup?state=${state}`);
  };

  const roleCards = [
    {
      title: "I'm a Therapist",
      description: "Join our community of mental health professionals to provide supportive online therapy services",
      features: [
        "Connect with clients seeking your expertise",
        "Flexible scheduling that works with your lifestyle",
        "Secure payment processing and session management"
      ],
      button: "Continue as Therapist",
      role: "therapist",
      icon: <PsychologyIcon sx={{ fontSize: 48, color: '#5c6bc0' }} />,
      color: 'rgba(92, 107, 192, 0.1)',
      borderColor: 'rgba(92, 107, 192, 0.2)'
    },
    {
      title: "I'm Seeking Support",
      description: "Find and connect with compassionate, licensed therapists for your mental health journey",
      features: [
        "Access to qualified professionals who care",
        "Convenient and private online sessions",
        "Tools to support your mental wellness"
      ],
      button: "Continue as Client",
      role: "client",
      icon: <PersonIcon sx={{ fontSize: 48, color: '#64b5f6' }} />,
      color: 'rgba(100, 181, 246, 0.1)',
      borderColor: 'rgba(100, 181, 246, 0.2)'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      py: 4,
      // background: 'linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%)',
    }}>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ 
            bgcolor: 'white', 
            borderRadius: 4, 
            overflow: 'hidden',
            boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.05)',
            position: 'relative',
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
            <Box sx={{ 
              bgcolor: '#5c6bc0', 
              color: 'white', 
              textAlign: 'center', 
              pt: 6, 
              pb: 4,
              px: 3
            }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ 
                fontWeight: 'bold',
                fontSize: isMobile ? '1.75rem' : '2.25rem',
                color: '#fff'
              }}>
                Begin Your Wellness Journey
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, maxWidth: '600px', mx: 'auto', mb: 2 }}>
                Choose how you'd like to participate in our mental health community
              </Typography>
            </Box>
            
            <Box sx={{ p: { xs: 3, sm: 5, md: 6 } }}>
              <Grid container spacing={4} justifyContent="center">
                {roleCards.map((card, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card 
                      elevation={0}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        bgcolor: card.color,
                        border: '1px solid',
                        borderColor: card.borderColor,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(149, 157, 165, 0.2)',
                        },
                        p: 3
                      }}
                    >
                      <CardContent sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        p: { xs: 2, sm: 3 }
                      }}>
                        <Box 
                          sx={{ 
                            bgcolor: 'white',
                            borderRadius: '50%',
                            p: 2,
                            mb: 3,
                            boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.05)'
                          }}
                        >
                          {card.icon}
                        </Box>

                        <Typography variant="h5" component="h2" gutterBottom sx={{ 
                          fontWeight: 500,
                          color: '#37474f'
                        }}>
                          {card.title}
                        </Typography>
                        
                        <Typography 
                          variant="body1" 
                          color="#546e7a" 
                          textAlign="center" 
                          sx={{ mb: 4 }}
                        >
                          {card.description}
                        </Typography>

                        <List sx={{ width: '100%', mb: 3 }}>
                          {card.features.map((feature, i) => (
                            <ListItem key={i} disableGutters alignItems="flex-start" sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                                <CheckCircleOutlineIcon sx={{ color: index === 0 ? '#5c6bc0' : '#64b5f6' }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={feature}
                                primaryTypographyProps={{ color: '#455a64' }}
                              />
                            </ListItem>
                          ))}
                        </List>

                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleRoleSelect(card.role)}
                          sx={{
                            mt: 'auto',
                            bgcolor: index === 0 ? '#5c6bc0' : '#64b5f6',
                            color: 'white',
                            borderRadius: 3,
                            py: 1.5,
                            fontWeight: 500,
                            textTransform: 'none',
                            fontSize: '1rem',
                            '&:hover': {
                              bgcolor: index === 0 ? '#3949ab' : '#42a5f5',
                              boxShadow: '0 6px 14px rgba(92, 107, 192, 0.4)',
                            },
                            boxShadow: '0 4px 12px rgba(92, 107, 192, 0.3)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {card.button}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#455a64' }}>
              Already have an account? {' '}
              <Link 
                href="/signin" 
                sx={{ 
                  color: '#5c6bc0',
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: '#3949ab'
                  }
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}