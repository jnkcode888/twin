import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';

export default function Home() {
  const [status, setStatus] = useState({
    journal: false,
    goals: false,
    reflection: false,
  });
  const navigate = useNavigate();

  return (
    <div className="home-dashboard fade-in" style={{ maxWidth: 600, width: '100%', margin: '0 auto', textAlign: 'center', background: '#fff', borderRadius: 22, boxShadow: '0 4px 32px 0 rgba(90,110,180,0.10)', padding: '2.5rem 1.5rem', marginTop: 36, position: 'relative', overflow: 'hidden' }}>
      <h1 style={{ fontWeight: 800, fontSize: '2.3rem', letterSpacing: 1, marginBottom: 10, color: '#1a1a1a', textShadow: '0 2px 8px #f4f6fa' }}>
        Welcome to <span style={{ color: '#5b78f6' }}>LifeOS</span>
      </h1>
      <p style={{ fontSize: 18, marginBottom: 28, color: '#333', opacity: 0.92 }}>
        Your dashboard for <b>journaling</b>, <b>goals</b>, and <b>clarity</b>.
      </p>
      <div className="slide-in" style={{ background: '#f9f9fb', borderRadius: 18, boxShadow: '0 2px 12px 0 rgba(90,110,180,0.06)', padding: '2rem 1.2rem', margin: '2rem 0 1.5rem 0', animation: 'slideIn 0.7s' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 18, color: '#5b78f6', letterSpacing: 0.5 }}>🟢 Today's Status</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start', margin: '0 auto', maxWidth: 300 }}>
          <label className="status-check fade-in" style={{ fontSize: 17, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 12, fontWeight: 500, transition: 'color 0.2s' }}>
            <input type="checkbox" checked={status.journal} onChange={e => setStatus(s => ({ ...s, journal: e.target.checked }))} />
            <span style={{ fontSize: 22 }}>{status.journal ? '✅' : '📝'}</span> Journal
          </label>
          <label className="status-check fade-in" style={{ fontSize: 17, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 12, fontWeight: 500, transition: 'color 0.2s' }}>
            <input type="checkbox" checked={status.goals} onChange={e => setStatus(s => ({ ...s, goals: e.target.checked }))} />
            <span style={{ fontSize: 22 }}>{status.goals ? '✅' : '🎯'}</span> Goals Set
          </label>
          <label className="status-check fade-in" style={{ fontSize: 17, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 12, fontWeight: 500, transition: 'color 0.2s' }}>
            <input type="checkbox" checked={status.reflection} onChange={e => setStatus(s => ({ ...s, reflection: e.target.checked }))} />
            <span style={{ fontSize: 22 }}>{status.reflection ? '✅' : '💭'}</span> Reflection done
          </label>
      </div>
      </div>
      <div className="home-nav-btns" style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 30, alignItems: 'center' }}>
        <button className="home-nav-btn slide-in" onClick={() => navigate('/journal')} style={{ fontSize: 18, fontWeight: 600, background: '#5b78f6', color: '#fff', border: 'none', borderRadius: 12, padding: '1rem 2.2rem', boxShadow: '0 2px 8px 0 rgba(90,110,180,0.08)', letterSpacing: 0.5, transition: 'background 0.2s' }}>Go to Journal</button>
        <button className="home-nav-btn slide-in" onClick={() => navigate('/goals')} style={{ fontSize: 18, fontWeight: 600, background: '#fff', color: '#5b78f6', border: '2px solid #5b78f6', borderRadius: 12, padding: '1rem 2.2rem', boxShadow: '0 2px 8px 0 rgba(90,110,180,0.08)', letterSpacing: 0.5, transition: 'background 0.2s, color 0.2s' }}>Go to Goals</button>
        <button className="home-nav-btn slide-in" onClick={() => navigate('/WeeklyReview')} style={{ fontSize: 18, fontWeight: 600, background: '#f9f9fb', color: '#1a1a1a', border: '2px solid #e5e8f0', borderRadius: 12, padding: '1rem 2.2rem', boxShadow: '0 2px 8px 0 rgba(90,110,180,0.08)', letterSpacing: 0.5, transition: 'background 0.2s, color 0.2s' }}>Review Week</button>
      </div>
    </div>
  );
} 