import React from 'react';

type Goal = {
  id?: number;
  name: string;
  type: string;
  done: boolean;
};

type GoalCardProps = {
  goal: Goal;
  onToggle: () => void;
};

function GoalCard({ goal, onToggle }: GoalCardProps) {
  return (
    <div className={`goal-card${goal.done ? ' done' : ''}`}> 
      <div className="goal-main">
        <input type="checkbox" checked={goal.done} onChange={onToggle} />
        <span className="goal-name">{goal.name}</span>
        <span className="goal-type">[{goal.type}]</span>
      </div>
    </div>
  );
}

export default GoalCard; 