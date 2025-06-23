import React from 'react';

type Goal = {
  id?: number;
  name: string;
  type: string;
  done: boolean;
  progress: number;
};

type GoalCardProps = {
  goal: Goal;
  onToggle: () => void;
  onProgress: (value: number) => void;
};

function GoalCard({ goal, onToggle, onProgress }: GoalCardProps) {
  return (
    <div className={`goal-card${goal.done ? ' done' : ''}`}> 
      <div className="goal-main">
        <input type="checkbox" checked={goal.done} onChange={onToggle} />
        <span className="goal-name">{goal.name}</span>
        <span className="goal-type">[{goal.type}]</span>
      </div>
      <div className="goal-progress">
        <input
          type="range"
          min="0"
          max="100"
          value={goal.progress}
          onChange={e => onProgress(Number(e.target.value))}
        />
        <span>{goal.progress}%</span>
      </div>
    </div>
  );
}

export default GoalCard; 