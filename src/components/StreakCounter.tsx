import React from 'react';
import { FaFire, FaRocket } from 'react-icons/fa';

interface StreakCounterProps {
  streak: number;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ streak }) => {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: 'var(--color-card-glass)',
      color: 'var(--color-success)',
      border: '1.5px solid var(--color-success)',
      borderRadius: 16,
      padding: '0.2rem 0.7rem',
      fontWeight: 700,
      fontSize: 14,
      boxShadow: '0 2px 8px 0 var(--color-success)',
      margin: '0 0.3rem',
      transition: 'transform 0.2s',
      userSelect: 'none',
      animation: streak > 0 ? 'pulse 1.2s infinite alternate' : undefined,
    }}>
      <FaFire style={{ color: 'orange', filter: 'drop-shadow(0 0 6px orange)' }} />
      {streak} day streak
      <FaRocket style={{ color: 'var(--color-accent)', marginLeft: 4 }} />
    </div>
  );
};

export default StreakCounter; 