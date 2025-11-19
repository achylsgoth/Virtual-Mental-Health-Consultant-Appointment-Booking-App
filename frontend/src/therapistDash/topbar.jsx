import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material';
import {
  NotificationsOutlined,
  Settings,
  Logout,
  AccountCircle
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ drawerWidth, user, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const {logout} = useAuthStore();
  const navigate = useNavigate();


  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  const forum = () =>{
    navigate('/feed');
  }

  const handleLogout = async () => {
    handleClose();
   try{
    await logout();
    navigate("/login");

   } catch (error){
    console.error("Logout failed", error);
   }
  };

  

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        boxShadow: 'none',
        backgroundColor: 'white',
        color: 'black'
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-end' }}>
      <Button onClick={forum}>Forum</Button>

        <IconButton size="large" color="inherit">
          <NotificationsOutlined />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
          <IconButton
            onClick={handleClick}
            size="small"
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            sx={{ p: 0 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#f0f0f0', color: 'text.primary' }}>
              {user?.fullname?.charAt(0) || 'T'}
            </Avatar>
          </IconButton>
          <Box sx={{ ml: 1 }}>
            <Typography variant="body1" fontWeight="medium">
              {user?.fullname || 'Loading...'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || 'No email available'}
            </Typography>
          </Box>
        </Box>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
              mt: 1.5,
              width: 200,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleClose} sx={{ py: 1 }}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="My Profile" />
          </MenuItem>
          <MenuItem onClick={handleClose} sx={{ py: 1 }}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ py: 1 }}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;