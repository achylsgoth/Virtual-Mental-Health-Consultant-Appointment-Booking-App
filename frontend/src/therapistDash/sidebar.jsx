import React from 'react';
import {
  Box,
  Drawer,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  HomeOutlined, 
  CalendarMonthOutlined, 
  PeopleOutlined, 
  MessageOutlined, 
  AccessTimeOutlined, 
  CircleOutlined 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SideBar = ({ drawerWidth, selectedTab, setSelectedTab }) => {
  const navigate = useNavigate();

  // Sidebar menu items with paths
  const sidebarItems = [
    { text: 'Dashboard', icon: <HomeOutlined />, path: '/therapist-dashboard' },
    { text: 'Sessions', icon: <CalendarMonthOutlined />, path: '/sessionList' },
    // { text: 'Patients', icon: <PeopleOutlined />, path: '/patients' },
    // { text: 'Messages', icon: <MessageOutlined />, path: '/messages' },
    { text: 'Availability', icon: <AccessTimeOutlined />, path: '/availability' },
  ];

  // Handle click on "HealNest" logo to navigate to dashboard
  const handleLogoClick = () => {
    navigate('/therapist-dashboard');
  };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <div>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', py: 1, cursor: 'pointer' }} onClick={handleLogoClick}>
            <CircleOutlined sx={{ mr: 1, color: 'black' }} />
            <Typography variant="h6" noWrap fontWeight="bold">
              HealNest
            </Typography>
          </Box>
        </Toolbar>
        <Divider />
        <List>
          {sidebarItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={selectedTab === item.text}
                onClick={() => {
                  setSelectedTab(item.text);
                  navigate(item.path);
                }}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </div>
    </Drawer>
  );
};

export default SideBar;
