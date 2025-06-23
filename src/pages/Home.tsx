import React from 'react';
import ProgressBar from '../components/ProgressBar';
import Badge from '../components/Badge';
import StreakCounter from '../components/StreakCounter';
import { FaMedal, FaStar, FaTrophy } from 'react-icons/fa';
import '../styles/App.css';

const achievements = [
  { label: 'First Log', icon: <FaMedal />, color: 'var(--color-secondary)' },
  { label: '7 Day Streak', icon: <FaStar />, color: 'var(--color-secondary)' },
  { label: 'Goal Crusher', icon: <FaTrophy />, color: 'var(--color-secondary)' },
];

export default function Home() {
  return (
    <div className="card" style={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
      <h1 className="high-contrast-text" style={{ fontWeight: 700, fontSize: '2.1rem', letterSpacing: 1, marginBottom: 8 }}>
        Welcome to LIFE OS
      </h1>
      <p className="high-contrast-text" style={{ fontSize: 17, marginBottom: 24 }}>
        Your professional dashboard for goals, journaling, and productivity.
      </p>
      <ProgressBar progress={65} label="XP Progress" />
      <div style={{ margin: '1.5rem 0' }}>
        <StreakCounter streak={5} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, margin: '1.5rem 0' }}>
        {achievements.map((a, i) => (
          <Badge key={i} label={a.label} icon={a.icon} color={a.color} />
        ))}
      </div>
      <div className="high-contrast-text" style={{ marginTop: 32, fontSize: 15, color: 'var(--color-muted)' }}>
        <span style={{ fontWeight: 600 }}>Tip:</span> Complete your daily goals and journal to earn more XP and unlock new badges!
      </div>
    </div>
  );
} 