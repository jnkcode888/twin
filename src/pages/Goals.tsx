import React, { useEffect, useState } from 'react';
import GoalCard from '../components/GoalCard';
import { supabase } from '../lib/supabaseClient';
import '../styles/Goals.css';

type Goal = {
  id?: number;
  name: string;
  type: string;
  done: boolean;
  progress: number;
};

const TYPES = ['short-term', 'weekly', 'long-term'];

function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState(TYPES[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchGoals() {
      setLoading(true);
      const { data } = await supabase
        .from('goals')
        .select('*')
        .order('id', { ascending: true });
      if (data) setGoals(data as Goal[]);
      setLoading(false);
    }
    fetchGoals();
  }, []);

  async function addGoal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    const newGoal: Goal = { name, type, done: false, progress: 0 };
    setGoals((prev: Goal[]) => [...prev, newGoal]);
    await supabase.from('goals').insert(newGoal);
    setName('');
    setType(TYPES[0]);
  }

  async function toggleGoal(idx: number) {
    const updated = goals.map((g: Goal, i: number) => i === idx ? { ...g, done: !g.done } : g);
    setGoals(updated);
    await supabase.from('goals').update({ done: !goals[idx].done }).eq('id', goals[idx].id);
  }

  async function updateProgress(idx: number, value: number) {
    const updated = goals.map((g: Goal, i: number) => i === idx ? { ...g, progress: value } : g);
    setGoals(updated);
    await supabase.from('goals').update({ progress: value }).eq('id', goals[idx].id);
  }

  return (
    <div className="goals-page">
      <h1>Goals</h1>
      <form className="goal-form" onSubmit={addGoal}>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Goal name..."
          className="goal-name-input"
        />
        <select value={type} onChange={e => setType(e.target.value)} className="goal-type-input">
          {TYPES.map((t: string) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button type="submit" className="goal-add">Add</button>
      </form>
      {loading && <p>Loading...</p>}
      <div className="goals-list">
        {goals.map((goal: Goal, idx: number) => (
          <GoalCard
            key={goal.id || idx}
            goal={goal}
            onToggle={() => toggleGoal(idx)}
            onProgress={(val: number) => updateProgress(idx, val)}
          />
        ))}
      </div>
    </div>
  );
}

export default Goals; 