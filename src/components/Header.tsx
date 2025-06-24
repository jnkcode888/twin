import React from 'react';
import '../styles/App.css';

export default function Header() {
  return (
      <header className="App-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1.3rem', letterSpacing: '1px', color: 'var(--color-primary)' }}>
            LIFE OS
          </span>
        </div>
      </header>
  );
} 