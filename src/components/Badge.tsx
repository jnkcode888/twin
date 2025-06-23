import React from 'react';

interface BadgeProps {
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

const Badge: React.FC<BadgeProps> = ({ label, icon, color }) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: color || 'var(--color-card-glass)',
        color: 'var(--color-accent)',
        border: `1.5px solid var(--color-accent)`,
        borderRadius: 16,
        padding: '0.2rem 0.7rem',
        fontWeight: 700,
        fontSize: 14,
        boxShadow: '0 2px 8px 0 var(--color-accent)',
        margin: '0 0.3rem',
        transition: 'transform 0.2s',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      className="badge-animated"
    >
      {icon && <span style={{ marginRight: 4 }}>{icon}</span>}
      {label}
    </span>
  );
};

export default Badge; 