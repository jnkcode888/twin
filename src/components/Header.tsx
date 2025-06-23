import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUserAstronaut } from 'react-icons/fa6';
import { FaHome, FaCalendarAlt, FaBook, FaBullseye, FaBars, FaTimes, FaBrain, FaUser, FaChartBar } from 'react-icons/fa';
import '../styles/App.css';
import styles from './Header.module.css';

const navLinks = [
  { to: '/', label: 'Home', icon: <FaHome style={{ marginRight: 4 }} /> },
  { to: '/schedule', label: 'Schedule', icon: <FaCalendarAlt style={{ marginRight: 4 }} /> },
  { to: '/journal', label: 'Journal', icon: <FaBook style={{ marginRight: 4 }} /> },
  { to: '/goals', label: 'Goals', icon: <FaBullseye style={{ marginRight: 4 }} /> },
  { to: '/WeeklyReview', label: 'Weekly Review', icon: <FaBrain style={{ marginRight: 4 }} /> },
  { to: '/JohnGPT', label: 'JohnGPT', icon: <FaUser style={{ marginRight: 4 }} /> },
  { to: '/Insights', label: 'Insights', icon: <FaChartBar style={{ marginRight: 4 }} /> },
];

export default function Header() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <>
      <header className="App-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <FaUserAstronaut size={28} color="var(--color-primary)" />
          <span style={{ fontWeight: 700, fontSize: '1.3rem', letterSpacing: '1px', color: 'var(--color-primary)' }}>
            LIFE OS
          </span>
        </div>
        <nav className={styles.desktopNav}>
          <ul className="nav-list">
            {navLinks.map(link => (
              <li key={link.to}>
                <Link to={link.to} className={location.pathname === link.to ? 'active' : ''}>{link.icon} {link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.mobileMenuBtn}>
          <button aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
            <FaBars size={22} color="var(--color-primary)" />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-secondary)', fontWeight: 500, fontSize: '1rem' }}>
          <span>Level 3</span>
          <span>• 1200 XP</span>
        </div>
      </header>
      {/* Sidebar for mobile */}
      <div className={styles.sidebar + (sidebarOpen ? ' ' + styles.open : '')}>
        <div className={styles.sidebarHeader}>
          <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-primary)' }}>LIFE OS</span>
          <button aria-label="Close menu" onClick={closeSidebar} className={styles.closeBtn}>
            <FaTimes size={22} />
          </button>
        </div>
        <ul className={styles.sidebarNavList}>
          {navLinks.map(link => (
            <li key={link.to}>
              <Link to={link.to} className={location.pathname === link.to ? styles.active : ''} onClick={closeSidebar}>
                {link.icon} {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {/* Overlay for sidebar */}
      {sidebarOpen && <div className={styles.overlay} onClick={closeSidebar} />}
    </>
  );
}

export {} 