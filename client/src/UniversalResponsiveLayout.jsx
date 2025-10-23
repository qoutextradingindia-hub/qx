import React from 'react';
import './UniversalResponsiveLayout.css';

const UniversalResponsiveLayout = ({ children }) => {
  return (
    <div className="universal-responsive-layout">
      {children}
    </div>
  );
};

export default UniversalResponsiveLayout;
