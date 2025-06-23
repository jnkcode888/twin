import React from 'react';

type ScheduleBlockProps = {
  label: string;
  value: string;
  done: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
};

function ScheduleBlock({ label, value, done, onChange, onToggle }: ScheduleBlockProps) {
  return (
    <div className={`schedule-block${done ? ' done' : ''}`}> 
      <span className="block-label">{label}</span>
      <input
        className="block-input"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={done}
        placeholder="Task..."
      />
      <button className="block-toggle" onClick={onToggle}>
        {done ? '✅' : '⬜'}
      </button>
    </div>
  );
}

export default ScheduleBlock; 