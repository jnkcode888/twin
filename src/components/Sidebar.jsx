import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/journal', label: 'Journal', icon: '📓' },
  { to: '/ideas', label: 'Ideas', icon: '💡' },
  { to: '/schedule', label: 'Schedule', icon: '⏰' },
  { to: '/goals', label: 'Goals', icon: '🎯' },
  { to: '/WeeklyReview', label: 'Review', icon: '📊' },
  { to: '/metrics', label: 'Metrics', icon: '📈' },
  { to: '/contradictions', label: 'Contradictions', icon: '⚡' },
  { to: '/JohnGPT', label: 'JohnGPT', icon: '🤖' },
];

export default function Sidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar-nav">
        <div className="sidebar-title">LIFE OS</div>
        <ul className="sidebar-list">
          {navLinks.map(link => (
            <li key={link.to}>
              <Link to={link.to} className={location.pathname === link.to ? 'active' : ''}>
                <span className="sidebar-icon">{link.icon}</span> {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      {/* Mobile Hamburger */}
      <button className="sidebar-hamburger" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
      {/* Mobile Sidebar Overlay */}
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}
      {/* Mobile Sidebar */}
      <aside className={`sidebar-mobile${open ? ' open' : ''}`}>
        <div className="sidebar-mobile-header">
          <span className="sidebar-title">LIFE OS</span>
          <button className="sidebar-close" onClick={() => setOpen(false)} aria-label="Close menu">×</button>
        </div>
        <ul className="sidebar-list">
          {navLinks.map(link => (
            <li key={link.to}>
              <Link to={link.to} className={location.pathname === link.to ? 'active' : ''} onClick={() => setOpen(false)}>
                <span className="sidebar-icon">{link.icon}</span> {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
} 