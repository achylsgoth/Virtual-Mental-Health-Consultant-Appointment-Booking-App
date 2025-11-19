import React from 'react';
import { Box } from '@mui/material';
import Sidebar, { menuItems } from '../clientDash/sidebar';
import TopBar from './topbar'; // Import menuItems from sidebar

const DashboardLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <TopBar/>
      <Sidebar />  {/* Sidebar already has menuItems inside */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
