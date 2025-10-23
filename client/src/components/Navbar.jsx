

import React from 'react';
import logo from '../assets/logo.png';
import styles from './Navbar.module.css';
import { FaFlagUsa, FaChevronDown, FaThLarge, FaUser, FaRobot, FaCreditCard, FaUsers, FaChartLine, FaGift, FaHeadphones, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => (
  <nav className={styles.navbar}>
    <div className={styles.logoSection}>
      <img src={logo} alt="Star Traders Logo" className={styles.logo} />
      <span className={styles.title}>STAR TRADERS</span>
    </div>
    <ul className={styles.menu}>
      {/* <li><FaThLarge className={styles.menuIcon} /> DASHBOARD</li> */}
      <li><FaUser className={styles.menuIcon} /> INVEST</li>
      <li><FaRobot className={styles.menuIcon} /> AI BOT <FaChevronDown className={styles.menuDropdown} /></li>
      <li><FaCreditCard className={styles.menuIcon} /> PAYMENTS <FaChevronDown className={styles.menuDropdown} /></li>
      <li><FaUsers className={styles.menuIcon} /> REFERRALS <FaChevronDown className={styles.menuDropdown} /></li>
      <li><FaChartLine className={styles.menuIcon} /> PROFIT <FaChevronDown className={styles.menuDropdown} /></li>
      <li><FaGift className={styles.menuIcon} /> SIGNUP REWARD <FaChevronDown className={styles.menuDropdown} /></li>
      <li><FaHeadphones className={styles.menuIcon} /> SUPPORT <FaChevronDown className={styles.menuDropdown} /></li>
      <li><FaSignOutAlt className={styles.menuIcon} /> LOGOUT</li>
    </ul>
    <div className={styles.rightSection}>
      <span className={styles.flag}><FaFlagUsa /></span>
      <div className={styles.profileMenu}>
        <span className={styles.profileCircle}>LO</span>
        <span className={styles.profileName}>Lokesh</span>
        <FaChevronDown className={styles.dropdownIcon} />
      </div>
    </div>
  </nav>
);

export default Navbar;
