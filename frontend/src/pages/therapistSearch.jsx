import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  Rating,
  Avatar,
  CssBaseline,
  Chip,
  Divider,
  Paper,
  InputAdornment, 
  Menu, 
  MenuItem,
  Slider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import LanguageIcon from '@mui/icons-material/Language';
import SchoolIcon from '@mui/icons-material/School';
import { motion } from 'framer-motion';
import NavBar from '../components/homenav';
import useTherapistStore from '../store/therapistStore';
import { useNavigate } from 'react-router-dom';

// Color theme for mental health aesthetic
const theme = {
  light: {
    primary: '#5C6BC0', // Soft indigo
    secondary: '#78909C', // Blue grey
    background: '#F5F7FA', // Soft light background
    card: '#FFFFFF',
    accent: '#80DEEA', // Soft teal
    text: {
      primary: '#37474F',
      secondary: '#78909C'
    }
  },
  dark: {
    primary: '#5C6BC0', // Keep same primary for consistency
    secondary: '#90A4AE',
    background: '#263238', // Deep blue-grey
    card: '#37474F',
    accent: '#4DB6AC', // Muted teal
    text: {
      primary: '#ECEFF1',
      secondary: '#B0BEC5'
    }
  }
};

// Animated wrapper component with refined animation
const AnimatedElement = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut", delay }}
    viewport={{ once: true, margin: "0px 0px -100px" }}
  >
    {children}
  </motion.div>
);

// Hero Section Component
const HeroSection = ({ mode, onSearch }) => {
  const [searchInput, setSearchInput] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchInput);
  };
  
  return (
    <Box 
      sx={{ 
        py: 6, 
        mb: 6, 
        borderRadius: 2,
        bgcolor: mode === 'light' ? 'rgba(92, 107, 192, 0.08)' : 'rgba(92, 107, 192, 0.15)',
        textAlign: 'center'
      }}
    >
      <AnimatedElement>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            color: mode === 'light' ? theme.light.text.primary : theme.dark.text.primary
          }}
        >
          Find Your Path to Wellness
        </Typography>
        <Typography 
          variant="h6" 
          component="h2"  
          sx={{ 
            maxWidth: 700, 
            mx: 'auto', 
            mb: 4,
            color: mode === 'light' ? theme.light.text.secondary : theme.dark.text.secondary
          }}
        >
          Connect with licensed therapists who specialize in your needs
        </Typography>
      </AnimatedElement>

      <AnimatedElement delay={0.2}>
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={{
            display: 'flex',
            maxWidth: 600,
            mx: 'auto',
            p: 0.5,
            borderRadius: 3,
            bgcolor: mode === 'light' ? '#fff' : theme.dark.card,
            boxShadow: mode === 'light' 
              ? '0 8px 20px rgba(92, 107, 192, 0.15)' 
              : '0 8px 20px rgba(0, 0, 0, 0.3)'
          }}
        > 
          <TextField
            fullWidth
            placeholder="Search by specialty, issue, or therapist name"
            variant="standard"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start" sx={{ ml: 1 }}>
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{ px: 1 }}
          />
          <Button 
            type="submit"
            variant="contained" 
            color="primary"
            sx={{ 
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Search
          </Button>
        </Paper>
      </AnimatedElement>
    </Box>
  );
};

// Therapist Card Component with refined design
// TherapistCard Component with therapist type categorization
const TherapistCard = ({
  name,
  rating = 0,
  isLicenseVerified = false,
  education = [], // Array of education objects
  license = '',
  licenseNumber = '',
  issuedInstitution = '',
  therapistType = 'specialist', // Default type
  language = [],
  specialties = [],
  sessionPrice = 0,
  mode = 'light',
  index,
  therapistId
}) => {
  const navigate = useNavigate();
  const currentTheme = mode === 'light' ? theme.light : theme.dark;

  // Define category colors for different therapist types
  const categoryColors = {
    clinical: {
      main: '#2E7D32', // Green
      light: mode === 'light' ? 'rgba(46, 125, 50, 0.08)' : 'rgba(46, 125, 50, 0.15)',
      text: '#2E7D32'
    },
    counselor: {
      main: '#5C6BC0', // Indigo (original primary color)
      light: mode === 'light' ? 'rgba(92, 107, 192, 0.08)' : 'rgba(92, 107, 192, 0.15)',
      text: '#5C6BC0'
    },
    coach: {
      main: '#D81B60', // Pink
      light: mode === 'light' ? 'rgba(216, 27, 96, 0.08)' : 'rgba(216, 27, 96, 0.15)',
      text: '#D81B60'
    },
    specialist: {
      main: '#F57C00', // Orange
      light: mode === 'light' ? 'rgba(245, 124, 0, 0.08)' : 'rgba(245, 124, 0, 0.15)',
      text: '#F57C00'
    }
  };

  // Get colors based on therapist type
  const typeColor = categoryColors[therapistType] || categoryColors.specialist;
  const verificationColors = {
    verified: {
      bg: mode === 'light' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(46, 125, 50, 0.2)',
      text: '#2E7D32', // Green
      icon: '#2E7D32'
    },
    unverified: {
      bg: mode === 'light' ? 'rgba(211, 47, 47, 0.1)' : 'rgba(211, 47, 47, 0.2)',
      text: '#D32F2F', // Red
      icon: '#D32F2F'
    }
  };
  const handleBookSession = () => {
    navigate(`/booking/${therapistId}`);
  };
  
  // Format therapist type for display
  const getFormattedType = (type) => {
    switch (type) {
      case 'clinical': return 'Clinical Therapist';
      case 'counselor': return 'Counselor';
      case 'coach': return 'Mental Health Coach';
      case 'specialist': return 'Mental Health Specialist';
      default: return 'Mental Health Professional';
    }
  };
  const getDisplayName = () => {
    if (!name) return 'Unnamed Therapist';
    return therapistType === 'clinical' ? `Dr. ${name}` : name;
  };
  // Get the highest degree from education array
  const getHighestDegree = () => {
    if (!education || education.length === 0) return 'N/A';
    
    // Sort education by year (most recent first)
    const sortedEducation = [...education].sort((a, b) => (b.year || 0) - (a.year || 0));
    
    // Get the most recent degree
    const recentDegree = sortedEducation[0];
    
    return recentDegree.degree || 'N/A';
  };
  
  // Get the most recent institution
  const getInstitution = () => {
    if (!education || education.length === 0) return '';
    
    // Sort education by year (most recent first)
    const sortedEducation = [...education].sort((a, b) => (b.year || 0) - (a.year || 0));
    
    // Get the most recent institution
    const recentEducation = sortedEducation[0];
    
    return recentEducation.institution || '';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1
      }}
      viewport={{ once: true }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: currentTheme.card,
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: mode === 'light'
            ? '0 4px 20px rgba(0,0,0,0.08)'
            : '0 4px 20px rgba(0,0,0,0.3)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: mode === 'light'
              ? `0 12px 28px rgba(${typeColor.main.replace(/[^\d,]/g, '')}, 0.2)`
              : '0 12px 28px rgba(0,0,0,0.4)'
          }
        }}
      >
        <Box sx={{ 
          height: 8, 
          width: '100%', 
          bgcolor: typeColor.main 
        }} />
        
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          {/* Therapist type chip */}
          <Chip 
            label={getFormattedType(therapistType)}
            size="small"
            sx={{ 
              fontSize: '0.75rem',
              mb: 2,
              bgcolor: typeColor.light,
              color: typeColor.text,
              fontWeight: 500
            }}
          />
        
          <Box sx={{ display: 'flex', mb: 2.5 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mr: 2.5,
                bgcolor: typeColor.main,
                boxShadow: mode === 'light'
                  ? `0 4px 12px rgba(${typeColor.main.replace(/[^\d,]/g, '')}, 0.2)`
                  : '0 4px 12px rgba(0,0,0,0.25)'
              }}
            >
              {name?.charAt(0) || 'T'}
            </Avatar>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 0.5,
                  color: currentTheme.text.primary
                }}
              >
                {getDisplayName()}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Rating
                  value={rating}
                  precision={0.5}
                  readOnly
                  size="small"
                  sx={{ mr: 1 }}
                />
              </Box>

              <Chip
                icon={isLicenseVerified ? 
                  <CheckCircleIcon sx={{ color: verificationColors.verified.icon }} /> : 
                  <WarningIcon sx={{ color: verificationColors.unverified.icon }} />
                }
                label={isLicenseVerified ? "Verified License" : "License Not Verified"}
                size="small"
                sx={{ 
                  fontSize: '0.75rem',
                  bgcolor: isLicenseVerified ? 
                    verificationColors.verified.bg : 
                    verificationColors.unverified.bg,
                  color: isLicenseVerified ? 
                    verificationColors.verified.text : 
                    verificationColors.unverified.text,
                  fontWeight: 500,
                  mb: 1
                }}
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SchoolIcon fontSize="small" sx={{ color: currentTheme.secondary, fontSize: 16 }} />
                <Typography 
                  variant="body2" 
                  sx={{ color: currentTheme.text.secondary }}
                >
                  {getHighestDegree()}
                  {getInstitution() && ` • ${getInstitution()}`}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Education Section */}
          {education && education.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 600,
                  color: currentTheme.text.primary
                }}
              >
                Education
              </Typography>
              {education.map((edu, idx) => (
                <Typography 
                  key={idx}
                  variant="body2" 
                  sx={{ 
                    color: currentTheme.text.secondary,
                    mb: 0.5
                  }}
                >
                  {edu.degree}{edu.institution ? ` - ${edu.institution}` : ''}{edu.year ? ` (${edu.year})` : ''}
                </Typography>
              ))}
            </Box>
          )}

          <Divider sx={{ my: 2 }} />
          
          {/* Display license number and institution only for clinical therapists */}
          {therapistType === 'clinical' && (
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 600,
                  color: currentTheme.text.primary
                }}
              >
                License Information
              </Typography>
              <Typography 
                variant="body2"
                sx={{ color: currentTheme.text.secondary }}
              >
                License #: {licenseNumber || 'N/A'}
              </Typography>
              <Typography 
                variant="body2"
                sx={{ color: currentTheme.text.secondary }}
              >
                Issued by: {issuedInstitution || 'N/A'}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1, 
                fontWeight: 600,
                color: currentTheme.text.primary
              }}
            >
              Specializations
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
              {specialties && specialties.length > 0 ? (
                specialties.slice(0, 4).map(specialty => (
                  <Chip 
                    key={specialty}
                    label={specialty} 
                    size="small"
                    sx={{ 
                      fontSize: '0.75rem',
                      bgcolor: typeColor.light,
                      color: typeColor.text,
                      fontWeight: 500
                    }}
                  />
                ))
              ) : (
                <Typography variant="body2" sx={{ color: currentTheme.text.secondary }}>
                  No specialties listed
                </Typography>
              )}
            </Box>
          </Box>
          
          {language && language.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LanguageIcon 
                fontSize="small" 
                sx={{ color: currentTheme.secondary, mr: 1, fontSize: 16 }}
              />
              <Typography 
                variant="body2"
                sx={{ color: currentTheme.text.secondary }}
              >
                {language.join(', ')}
              </Typography>
            </Box>
          )}

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 'auto'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                color: typeColor.main
              }}
            >
              NPR {sessionPrice}/hour
            </Typography>
          </Box>
        </CardContent>
        
        <CardActions sx={{ p: 3, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleBookSession}
            sx={{ 
              textTransform: 'none',
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: 'none',
              bgcolor: typeColor.main,
              '&:hover': {
                bgcolor: typeColor.main,
                opacity: 0.9,
                boxShadow: mode === 'light'
                  ? `0 4px 12px rgba(${typeColor.main.replace(/[^\d,]/g, '')}, 0.3)`
                  : '0 4px 12px rgba(0,0,0,0.3)'
              }
            }}
          >
            Book a Session
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
};

const TherapistFinder = () => {
  const [mode, setMode] = useState('light');
  const currentTheme = mode === 'light' ? theme.light : theme.dark;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [ratingFilter, setRatingFilter] = useState(0);

  const {
    therapists,
    loading,
    error,
    fetchTherapists
  } = useTherapistStore();

  // Available filters - moved to one central location
  const allFilters = [
    'Anxiety', 'Depression', 'Trauma', 'Relationship', 
    'Grief', 'Self-Esteem', 'Family Conflict'
  ];

  useEffect(() => {
    // Ensure therapists are loaded when component mounts
    fetchTherapists();
    console.log("Initial therapists:", therapists);
  }, [fetchTherapists]);

  // For debugging - log when therapists change
  useEffect(() => {
    console.log("Therapists updated:", therapists);
  }, [therapists]);

  // Filter therapists based on search query and selected filters
  const filteredTherapists = therapists.filter(therapist => {
    // Null check for therapist properties
    if (!therapist) return false;
    
    // Search query matching (name or specialties)
    const matchesSearch = !searchQuery ? true : (
      (therapist.fullname && therapist.fullname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (therapist.specializations && Array.isArray(therapist.specializations) && 
        therapist.specializations.some(spec => 
          spec.toLowerCase().includes(searchQuery.toLowerCase())
        ))
    );

    // Filter matching (specializations)
    const matchesFilters = selectedFilters.length === 0 || 
      (therapist.specializations && Array.isArray(therapist.specializations) && 
       selectedFilters.every(filter => 
         therapist.specializations.includes(filter)
       ));

    // Price range matching
    const matchesPrice = 
      (!priceRange[0] || (therapist.sessionPrice >= priceRange[0])) && 
      (!priceRange[1] || (therapist.sessionPrice <= priceRange[1]));

    // Rating matching
    const matchesRating = !ratingFilter || (therapist.rating >= ratingFilter);

    return matchesSearch && matchesFilters && matchesPrice && matchesRating;
  });

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterClick = (filter) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  const handleFilterMenuOpen = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleRatingFilterChange = (newValue) => {
    setRatingFilter(newValue);
  };
  
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedFilters([]);
    setRatingFilter(0);
    setPriceRange([0, 200]);
  };

  // Show loading state with better UI feedback
  if (loading) {
    return (
      <>
        <NavBar mode={mode} setMode={setMode} />
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '80vh',
            bgcolor: mode === 'light' ? theme.light.background : theme.dark.background
          }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 2, 
              textAlign: 'center',
              bgcolor: mode === 'light' ? theme.light.card : theme.dark.card
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ color: mode === 'light' ? theme.light.text.primary : theme.dark.text.primary }}
            >
              Loading therapists...
            </Typography>
            {/* You could add a progress indicator here */}
          </Paper>
        </Box>
      </>
    );
  }

  // Better error handling with retry option
  if (error) {
    return (
      <>
        <NavBar mode={mode} setMode={setMode} />
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '80vh',
            bgcolor: mode === 'light' ? theme.light.background : theme.dark.background 
          }}
        >
          <Paper 
            elevation={3}
            sx={{ 
              p: 4, 
              borderRadius: 2, 
              textAlign: 'center',
              bgcolor: mode === 'light' ? theme.light.card : theme.dark.card
            }}
          >
            <Typography 
              color="error" 
              variant="h6" 
              gutterBottom
            >
              Error loading therapists
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ mb: 3, color: mode === 'light' ? theme.light.text.secondary : theme.dark.text.secondary }}
            >
              We couldn't load the therapist data. Please try again.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => fetchTherapists()}
            >
              Retry
            </Button>
          </Paper>
        </Box>
      </>
    );
  }

  // Add a fallback for empty therapists array
  const noTherapistsAvailable = !therapists || therapists.length === 0;

  return (
    <Box sx={{ 
      bgcolor: mode === 'light' ? theme.light.background : theme.dark.background, 
      minHeight: '100vh' 
    }}>
      <CssBaseline />
      <NavBar mode={mode} setMode={setMode} />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <HeroSection mode={mode} onSearch={handleSearch} />
        
        {noTherapistsAvailable ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography 
              variant="h5" 
              sx={{ color: currentTheme.text.primary, mb: 2 }}
            >
              No therapists available at the moment
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ color: currentTheme.text.secondary, mb: 3 }}
            >
              Please check back later or contact support for assistance.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => fetchTherapists()}
            >
              Refresh
            </Button>
          </Box>
        ) : (
          <>
            <AnimatedElement delay={0.3}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography 
                  variant="h5" 
                  component="h2" 
                  sx={{ fontWeight: 600, color: currentTheme.text.primary }}
                >
                  Available Therapists ({filteredTherapists.length})
                </Typography>
                
                <Box>
                  <IconButton
                    color="primary"
                    onClick={handleFilterMenuOpen}
                    sx={{
                      bgcolor: mode === 'light' ? 'rgba(92, 107, 192, 0.08)' : 'rgba(92, 107, 192, 0.15)',
                      '&:hover': {
                        bgcolor: mode === 'light' ? 'rgba(92, 107, 192, 0.15)' : 'rgba(92, 107, 192, 0.25)',
                      }
                    }}
                  >
                    <FilterListIcon />
                  </IconButton>
                  <Menu
                    anchorEl={filterAnchorEl}
                    open={Boolean(filterAnchorEl)}
                    onClose={handleFilterMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ minWidth: 250, p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Minimum Rating
                        </Typography>
                        <Rating
                          value={ratingFilter}
                          onChange={(event, newValue) => handleRatingFilterChange(newValue)}
                          precision={0.5}
                        />
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                          Price Range: Npr {priceRange[0]} - Npr{priceRange[1]}
                        </Typography>
                        <Slider
                          value={priceRange}
                          onChange={handlePriceChange}
                          valueLabelDisplay="auto"
                          min={0}
                          max={300}
                          step={10}
                        />
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          size="small" 
                          fullWidth 
                          sx={{ mt: 2 }}
                          onClick={() => {
                            handleFilterMenuClose();
                          }}
                        >
                          Apply Filters
                        </Button>
                      </Box>
                    </MenuItem>
                  </Menu>
                </Box>
              </Box>
            </AnimatedElement>
            
            {/* Search Bar - Removed as we now use the Hero section search */}
            
            {/* Filter Chips */}
            <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {allFilters.map((filter) => (
                <Chip 
                  key={filter}
                  label={filter}
                  variant={selectedFilters.includes(filter) ? 'filled' : 'outlined'}
                  color="primary"
                  clickable
                  onClick={() => handleFilterClick(filter)}
                  sx={{ 
                    borderRadius: 1.5,
                    bgcolor: selectedFilters.includes(filter) 
                      ? mode === 'light' 
                        ? 'rgba(92, 107, 192, 0.2)' 
                        : 'rgba(92, 107, 192, 0.3)'
                      : mode === 'light' 
                        ? 'rgba(92, 107, 192, 0.08)' 
                        : 'rgba(92, 107, 192, 0.15)',
                    '&:hover': {
                      bgcolor: mode === 'light' 
                        ? 'rgba(92, 107, 192, 0.15)' 
                        : 'rgba(92, 107, 192, 0.25)',
                    }
                  }}
                />
              ))}
              
              {/* Clear filters button - only show if filters are applied */}
              {(selectedFilters.length > 0 || searchQuery || ratingFilter > 0 || 
                priceRange[0] > 0 || priceRange[1] < 200) && (
                <Chip
                  label="Clear Filters"
                  variant="outlined"
                  color="secondary"
                  onClick={clearAllFilters}
                  sx={{
                    borderRadius: 1.5,
                    ml: 1
                  }}
                />
              )}
            </Box>

            {/* Results */}
            {filteredTherapists.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography 
                  variant="h6" 
                  sx={{ color: currentTheme.text.secondary, mb: 2 }}
                >
                  No therapists match your search criteria
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={clearAllFilters}
                >
                  Clear all filters
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
              {filteredTherapists.map((therapist, index) => (
                <Grid item xs={12} sm={6} md={4} key={therapist._id || `therapist-${index}`}>
                  <TherapistCard
                    therapistId={therapist._id}
                    name={therapist.fullname}
                    rating={therapist.rating || 0}
                    isLicenseVerified={therapist.isLicenseVerified || false}
                    education={therapist.education || []}
                    license={therapist.license || ''}
                    licenseNumber={therapist.licenseNumber || ''}
                    issuedInstitution={therapist.issuedInstitution || ''}
                    therapistType={therapist.therapistType || 'specialist'}
                    language={therapist.language || []}
                    specialties={therapist.specializations || []}
                    sessionPrice={therapist.sessionPrice || 0}
                    mode={mode}
                    index={index}
                  />
                </Grid>
              ))}
            </Grid>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default TherapistFinder;