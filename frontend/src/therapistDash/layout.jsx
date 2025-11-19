// Layout.jsx
import React from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import SideBar from './SideBar';
import TopBar from './TopBar';

const Layout = ({ children, drawerWidth, sidebarItems, selectedTab, setSelectedTab, user }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <TopBar drawerWidth={drawerWidth} user={user} />
      <SideBar 
        drawerWidth={drawerWidth} 
        sidebarItems={sidebarItems} 
        selectedTab={selectedTab} 
        setSelectedTab={setSelectedTab} 
      />
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          bgcolor: '#f5f5f7', 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` } 
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;