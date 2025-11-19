import React, { useState, useMemo, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { Palette as PaletteIcon, LightMode as LightModeIcon, DarkMode as DarkModeIcon, AccountCircle, ArrowDropDown } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';


const NavBar = ({ mode, setMode}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);

  
  const themeMenuOpen = Boolean(anchorEl);
  const userMenuOpen = Boolean(userMenuAnchorEl);

  const {user, isAuthenticated, logout} = useAuthStore();

  const handleThemeMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClick = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleThemeMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleThemeChange = (newMode) => {
    setMode(newMode);
    handleThemeMenuClose();
  };

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

  const navigate = useNavigate();

  const goToSignIn = () => {
    navigate('/signin');
  };

  const goToRoleSelection = () => {
    navigate('/select-role');
  };

  const findTherapist = () => {
    navigate('/therapist-search');
  };

  const gohome = () => {
    navigate('/home');
  };

  const goToDashboard = () => {
    navigate('/signin');
    handleUserMenuClose();
  };

  const handleLogout = async() => {
    await logout();
    handleUserMenuClose();
    navigate('/home');
  };

  const handleProfile = () => {
    navigate('/profile');
    handleUserMenuClose();
  };

  const goToForum = () => {
    navigate('/feed');
    handleUserMenuClose();
  };

  const howitworks = () => {
    navigate('/howitworks');
    handleUserMenuClose();
  };

  const aboutme = () => {
    navigate('/about');
    handleUserMenuClose();
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" color="primary" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={gohome}>
            HealNest
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
            <Button color="inherit" onClick={findTherapist}>Find Therapist</Button>
            <Button color="inherit" onClick={howitworks}>How It Works</Button>
            <Button color="inherit" onClick={aboutme}>About Us</Button>
          </Box>

          <IconButton
            onClick={handleThemeMenuClick}
            color="primary"
            aria-controls={themeMenuOpen ? 'theme-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={themeMenuOpen ? 'true' : undefined}
          >
            <PaletteIcon />
          </IconButton>

          <Menu
            id="theme-menu"
            anchorEl={anchorEl}
            open={themeMenuOpen}
            onClose={handleThemeMenuClose}
            MenuListProps={{
              'aria-labelledby': 'theme-button',
            }}
          >
            <MenuItem onClick={() => handleThemeChange('light')}>
              <LightModeIcon sx={{ mr: 1 }} />
              Light Mode
            </MenuItem>
            <MenuItem onClick={() => handleThemeChange('dark')}>
              <DarkModeIcon sx={{ mr: 1 }} />
              Dark Mode
            </MenuItem>
          </Menu>

          {isAuthenticated && user ? (
            <>
            <Button 
                color="inherit" 
                onClick={goToForum}
                sx={{ ml: 2 }}
              >
              Forum
              </Button>
              <Button 
                color="inherit" 
                onClick={goToDashboard}
                sx={{ ml: 2 }}
              >
                Dashboard
              </Button>
              <Box 
                sx={{ 
                  ml: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 50,
                  padding: '4px 12px',
                }}
                onClick={handleUserMenuClick}
              >
                <Avatar 
                  sx={{ width: 32, height: 32, mr: 1 }}
                  alt={user.name}
                  src={user.avatar}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : <AccountCircle />}
                </Avatar>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  {user.name}
                </Typography>
                <ArrowDropDown />
              </Box>
              <Menu
                id="user-menu"
                anchorEl={userMenuAnchorEl}
                open={userMenuOpen}
                onClose={handleUserMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'user-menu-button',
                }}
              >
                <MenuItem onClick={handleProfile}>Profile</MenuItem>
                <MenuItem onClick={goToDashboard}>Dashboard</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="primary" sx={{ ml: 2 }} onClick={goToSignIn}>
                Sign In
              </Button>
              <Button variant="contained" color="primary" sx={{ ml: 2 }} onClick={goToRoleSelection}>
                Get Started
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
};

export default NavBar;