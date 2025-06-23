import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, color }) => {
  return (
    <div style={{ width: '100%', margin: '0.5rem 0' }}>
      {label && <div style={{ color: 'var(--color-accent)', fontWeight: 700, marginBottom: 4 }}>{label}</div>}
      <div style={{
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '999px',
        boxShadow: '0 2px 8px 0 var(--color-primary)',
        overflow: 'hidden',
        height: 18,
        position: 'relative',
      }}>
        <div
          style={{
            width: `${progress}%`,
            background: color || 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            height: '100%',
            borderRadius: '999px',
            transition: 'width 0.6s cubic-bezier(.4,2,.3,1)',
            boxShadow: '0 0 16px 2px var(--color-primary)',
            position: 'absolute',
            left: 0,
            top: 0,
          }}
        />
      </div>
      <div style={{ color: 'var(--color-muted)', fontSize: 12, marginTop: 2 }}>{progress}%</div>
    </div>
  );
};

export default ProgressBar; 