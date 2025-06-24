import React, { useState, useEffect } from 'react';

type ScheduleBlockProps = {
  label: string;
  value: string;
  done: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
};

function ScheduleBlock({ label, value, done, onChange, onToggle }: ScheduleBlockProps) {
  const [localValue, setLocalValue] = useState(value);

  // Keep localValue in sync if parent value changes (e.g., after save)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className={`schedule-block${done ? ' done' : ''}`}> 
      <span className="block-label">{label}</span>
      <input
        className="block-input"
        type="text"
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        onBlur={() => onChange(localValue)}
        disabled={done}
        placeholder="What will you do?"
      />
      <button className="block-toggle" onClick={onToggle}>
        {done ? '✅' : '⬜'}
      </button>
    </div>
  );
}

export default ScheduleBlock; 