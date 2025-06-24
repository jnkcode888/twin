import React, { useEffect, useState } from 'react';
import GoalCard from '../components/GoalCard';
import { supabase } from '../lib/supabaseClient';
import '../styles/Goals.css';

type Goal = {
  id?: number;
  name: string;
  type: string;
  done: boolean;
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
    const newGoal: Goal = { name, type, done: false };
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

  // Group goals
  const activeGoals = goals.filter(g => !g.done);
  const doneGoals = goals.filter(g => g.done);

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
        <h2 style={{ fontSize: 18, color: '#5b78f6', margin: '1.2rem 0 0.5rem' }}>Active Goals</h2>
        {activeGoals.length === 0 && <div style={{ color: '#aaa', fontSize: 15 }}>No active goals.</div>}
        {activeGoals.map((goal: Goal, idx: number) => (
          <GoalCard
            key={goal.id || idx}
            goal={goal}
            onToggle={() => toggleGoal(goals.indexOf(goal))}
          />
        ))}
        <h2 style={{ fontSize: 18, color: '#5b78f6', margin: '2rem 0 0.5rem' }}>Completed Goals</h2>
        {doneGoals.length === 0 && <div style={{ color: '#aaa', fontSize: 15 }}>No completed goals yet.</div>}
        {doneGoals.map((goal: Goal, idx: number) => (
          <GoalCard
            key={goal.id || idx}
            goal={goal}
            onToggle={() => toggleGoal(goals.indexOf(goal))}
          />
        ))}
      </div>
    </div>
  );
}

export default Goals; 