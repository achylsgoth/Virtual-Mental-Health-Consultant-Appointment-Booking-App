import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Toolbar,
  Divider
} from '@mui/material';

import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Book as JournalIcon,
  Timeline as MoodTrackerIcon,
  SentimentSatisfiedAlt as MoodIcon,
  Timer as TimerIcon,
  CheckCircle as CompletedIcon,
  LocalFireDepartment as StreakIcon,
  Favorite as HeartIcon,
  Create as WriteIcon
} from '@mui/icons-material';

const drawerWidth = 240;

// Define the menu items globally
export const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/client-dashboard' },
  { text: 'Sessions', icon: <EventIcon />, path: '/clientsessionList' },
  { text: 'Journal', icon: <JournalIcon />, path: '/journal' },
  { text: 'Mood Tracker', icon: <MoodTrackerIcon />, path: '/moodtracker' },
  
];

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#f8f9fa'
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          HealNest
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component="a"
            href={item.path}  // Ensure each menu item links correctly
            sx={{
              mb: 1,
              borderRadius: '0 8px 8px 0',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
