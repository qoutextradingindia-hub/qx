import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
// import SideDrawer from './components/SideDrawer';
// import HamburgerMenu from './components/HamburgerMenu';

// Updated Layout with Sidebar Navigation
const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Old sidebar and hamburger menu removed */}
      {/* Main Content without padding overlap */}
      <div style={{ paddingTop: '20px', paddingLeft: '10px', paddingRight: '10px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;