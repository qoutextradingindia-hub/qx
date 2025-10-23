import React from 'react';
import '../components/SideDrawer.css';

const HamburgerMenu = ({ onClick, isOpen }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  // Hide hamburger when sidebar is open
  if (isOpen) {
    return null;
  }

  const handleTouch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <button 
      className="stylish-hamburger-btn" 
      onClick={handleClick}
      onTouchEnd={handleTouch}
      type="button"
      aria-label="Toggle navigation menu"
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      <div className={`hamburger-lines ${isOpen ? 'open' : ''}`}>
        <span className="line line1"></span>
        <span className="line line2"></span>
        <span className="line line3"></span>
      </div>
    </button>
  );
};

export default HamburgerMenu;
