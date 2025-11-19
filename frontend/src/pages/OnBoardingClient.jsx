import React, { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, Stepper, Step, StepLabel, Typography, Button, Container, Paper, 
  ThemeProvider, createTheme, CssBaseline, Alert, Fade
} from "@mui/material";
import EmergencyContactForm from "../onBoardingClient/emergencyContact";
import PreferencesForm from "../onBoardingClient/preferences";
import MedicalHistoryForm from "../onBoardingClient/medicalConditions";
import useOnboardingStore from "../store/onboardingStore";
import EscalatorWarningIcon from '@mui/icons-material/EscalatorWarning';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

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

const ClientOnboarding = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        emergencyContact: { name: "", relationship: "", phoneNumber: "" },
        preferences: { therapistGender: "", preferredLanguage: "", preferredSessionTime: "" },
        medicalHistory: { conditions: [], medications: [], allergies: [], lastUpdated: "" }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const onboardClient = useOnboardingStore((state) => state.onboardClient);
    const navigate = useNavigate();

    const handleNext = () => {
        if (activeStep === 0 && !validateEmergencyContact()) {
            toast.error("Please fill in all emergency contact fields");
            return;
        }
        if (activeStep === 1 && !validatePreferences()) {
            toast.error("Please complete all preference selections");
            return;
        }
        setActiveStep((prevStep) => prevStep + 1);
    };
    
    const handleBack = () => setActiveStep((prevStep) => prevStep - 1);
     
    const handleDataChange = (key, value) => {
        setFormData((prevData) => ({ ...prevData, [key]: value }));
    };

    const validateEmergencyContact = () => {
        const { name, relationship, phoneNumber } = formData.emergencyContact;
        return name.trim() && relationship.trim() && phoneNumber.trim();
    };

    const validatePreferences = () => {
        const { therapistGender, preferredLanguage, preferredSessionTime } = formData.preferences;
        return therapistGender && preferredLanguage && preferredSessionTime;
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        
        if (!validateMedicalHistory()) {
            toast.error("Please provide at least your medical conditions");
            return;
        }
        
        setIsSubmitting(true);
        console.log("Final Data:", formData);
        
        try {
            const response = await onboardClient(formData);
            console.log("Onboarding response:", response);
            
            toast.success("Onboarding completed successfully!");
            setIsComplete(true);
            
            // Navigate after a short delay to show the success state
            setTimeout(() => {
                navigate('/client-dashboard');
            }, 3000);
        } catch (error) {
            console.error("Error submitting onboarding data:", error);
            toast.error("There was an error processing your information. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateMedicalHistory = () => {
        // At minimum, we need conditions array to have at least one item
        return formData.medicalHistory.conditions.length > 0;
    };

    const steps = [
        { 
            label: "Emergency Contact", 
            icon: <EscalatorWarningIcon color="primary" />
        },
        { 
            label: "Preferences", 
            icon: <FavoriteBorderIcon color="primary" />
        },
        { 
            label: "Medical History", 
            icon: <MedicalInformationIcon color="primary" />
        }
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
                        <Paper elevation={0} sx={{ 
                            p: 4, 
                            borderRadius: 3,
                            backgroundColor: 'background.paper',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                        }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600, mb: 2 }}>
                                    Emergency Contact Information
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Please provide details of someone we can contact in case of an emergency during your therapy sessions.
                                </Typography>
                            </Box>
                            
                            <EmergencyContactForm 
                                data={formData.emergencyContact} 
                                onChange={(value) => handleDataChange("emergencyContact", value)} 
                            />
                            
                            <Alert severity="info" sx={{ 
                                mt: 3, 
                                borderRadius: 2, 
                                '& .MuiAlert-icon': { color: 'primary.main' } 
                            }}>
                                This information will only be used in emergency situations and is kept strictly confidential.
                            </Alert>
                        </Paper>
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
                        <Paper elevation={0} sx={{ 
                            p: 4, 
                            borderRadius: 3,
                            backgroundColor: 'background.paper',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                        }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600, mb: 2 }}>
                                    Therapy Preferences
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Help us match you with the right therapist by sharing your preferences for your therapy journey.
                                </Typography>
                            </Box>
                            
                            <PreferencesForm 
                                data={formData.preferences} 
                                onChange={(value) => handleDataChange("preferences", value)} 
                            />
                            
                            <Alert severity="info" sx={{ 
                                mt: 3, 
                                borderRadius: 2, 
                                '& .MuiAlert-icon': { color: 'primary.main' } 
                            }}>
                                While we'll do our best to match your preferences, availability may vary. We recommend being open to different options for faster matching.
                            </Alert>
                        </Paper>
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
                        <Paper elevation={0} sx={{ 
                            p: 4, 
                            borderRadius: 3,
                            backgroundColor: 'background.paper',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                        }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600, mb: 2 }}>
                                    Medical History
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Please share relevant medical information to help your therapist provide better care. This information is kept confidential.
                                </Typography>
                            </Box>
                            
                            <MedicalHistoryForm 
                                data={formData.medicalHistory} 
                                onChange={(value) => handleDataChange("medicalHistory", value)} 
                            />
                            
                            <Alert severity="info" sx={{ 
                                mt: 3, 
                                borderRadius: 2, 
                                '& .MuiAlert-icon': { color: 'primary.main' } 
                            }}>
                                Your therapist may ask for more details during your first session. You can update this information at any time.
                            </Alert>
                        </Paper>
                    </motion.div>
                );
            default:
                return "Unknown step";
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container 
                maxWidth="md" 
                sx={{ 
                    minHeight: '100vh', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    py: 4,
                    backgroundColor: 'background.default'
                }}
            >
                {!isComplete ? (
                    <>
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 4, 
                                mb: 4, 
                                borderRadius: 3, 
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #f7f9fb 0%, #e8f4f4 100%)'
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.8, type: "spring" }}
                                >
                                    <FavoriteBorderIcon 
                                        sx={{ 
                                            fontSize: 48, 
                                            color: 'primary.main'
                                        }} 
                                    />
                                </motion.div>
                            </Box>
                            <Typography variant="h4" gutterBottom align='center' color="primary.dark" sx={{ fontWeight: 600 }}>
                                Welcome to HealNest
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '70%', mx: 'auto' }}>
                                Let's set up your profile so we can match you with the perfect therapist for your journey toward wellbeing.
                            </Typography>
                        </Paper>
                    
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 0, 
                                borderRadius: 3, 
                                overflow: 'hidden',
                                backgroundColor: 'background.paper'
                            }}
                        >
                            <Box sx={{ 
                                p: 3, 
                                backgroundColor: 'primary.light', 
                                borderTopLeftRadius: 12, 
                                borderTopRightRadius: 12 
                            }}>
                                <Stepper activeStep={activeStep} alternativeLabel>
                                    {steps.map((step, index) => (
                                        <Step key={index}>
                                            <StepLabel
                                                StepIconProps={{
                                                    icon: step.icon,
                                                    sx: {
                                                        color: activeStep === index ? 'primary.dark' : 'primary.light',
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            color: activeStep === index ? 'primary.dark' : 'text.secondary',
                                                            fontWeight: activeStep === index ? 600 : 400
                                                        }}
                                                    >
                                                        {step.label}
                                                    </Typography>
                                                </Box>
                                            </StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                            </Box>
                            
                            <Box sx={{ p: 3 }}>
                                <AnimatePresence mode="wait">
                                    {getStepContent(activeStep)}
                                </AnimatePresence>
                                
                                <Box mt={4} display="flex" justifyContent="space-between">
                                    <Button 
                                        disabled={activeStep === 0} 
                                        onClick={handleBack}
                                        sx={{
                                            color: 'text.secondary',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.05)'
                                            }
                                        }}
                                    >
                                        Back
                                    </Button>
                                    
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {activeStep === steps.length - 1 ? (
                                            <Button 
                                                variant="contained" 
                                                color="primary" 
                                                onClick={handleSubmit}
                                                disabled={isSubmitting}
                                                sx={{
                                                    px: 4,
                                                    py: 1.5,
                                                    borderRadius: 8,
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 4px 10px rgba(104, 164, 164, 0.2)',
                                                    '&:hover': {
                                                        boxShadow: '0 6px 12px rgba(104, 164, 164, 0.25)'
                                                    }
                                                }}
                                            >
                                                {isSubmitting ? 'Submitting...' : 'Complete Profile'}
                                            </Button>
                                        ) : (
                                            <Button 
                                                variant="contained" 
                                                color="primary" 
                                                onClick={handleNext}
                                                sx={{
                                                    px: 4,
                                                    py: 1.5,
                                                    borderRadius: 8,
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 4px 10px rgba(104, 164, 164, 0.2)',
                                                    '&:hover': {
                                                        boxShadow: '0 6px 12px rgba(104, 164, 164, 0.25)'
                                                    }
                                                }}
                                            >
                                                Continue
                                            </Button>
                                        )}
                                    </motion.div>
                                </Box>
                            </Box>
                        </Paper>
                    </>
                ) : (
                    <motion.div
                        initial="initial"
                        animate="in"
                        variants={pageVariants}
                        transition={pageTransition}
                    >
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 6, 
                                borderRadius: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: 180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 0.8, type: "spring" }}
                            >
                                <Box 
                                    sx={{ 
                                        width: 100, 
                                        height: 100, 
                                        borderRadius: '50%', 
                                        backgroundColor: 'success.light',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 3
                                    }}
                                >
                                    <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'white' }} />
                                </Box>
                            </motion.div>
                            
                            <Typography variant="h4" gutterBottom color="primary.dark" sx={{ fontWeight: 600 }}>
                                Profile Complete!
                            </Typography>
                            
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '80%', mx: 'auto' }}>
                                Thank you for sharing your information. We're excited to help you on your journey to better mental health.
                                You'll be redirected to your dashboard momentarily.
                            </Typography>
                            
                            <motion.div
                                animate={{ 
                                    y: [0, -5, 0],
                                    transition: { repeat: Infinity, duration: 1.5 } 
                                }}
                            >
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    onClick={() => navigate('/client-dashboard')}
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 8,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 6px 12px rgba(104, 164, 164, 0.25)'
                                        }
                                    }}
                                >
                                    Go to Dashboard
                                </Button>
                            </motion.div>
                        </Paper>
                    </motion.div>
                )}
            </Container>
        </ThemeProvider>
    );
};

export default ClientOnboarding;