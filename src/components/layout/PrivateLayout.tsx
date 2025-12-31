import React, { useState } from 'react';

import { Box, Toolbar } from '@mui/material';
import Sidebar from '../Sidebar';
import Footer from '../Footer';
import Header from '../Header';


const PrivateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header/>
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar mobileOpen={mobileOpen} onClose={handleToggleSidebar} />
        <Box component="main" sx={{ flexGrow: 1, p: 3, ml: { sm: '240px' } }}>
          <Toolbar />
          {children}
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default PrivateLayout;
