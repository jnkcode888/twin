import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { fetchOpenAICompletion } from '../lib/openaiClient';

export default function Contradictions() {
  const [contradictions, setContradictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [explaining, setExplaining] = useState(null);
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    fetchContradictions();
  }, []);

  async function fetchContradictions() {
    setLoading(true);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const { data: journals } = await supabase
      .from('journal')
      .select('*')
      .gte('timestamp', fourteenDaysAgo.toISOString())
      .order('timestamp', { ascending: false });
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });
    // Simple contradiction logic (expand as needed)
    const found = [];
    (journals || []).forEach(j => {
      (goals || []).forEach(g => {
        // Example: negative mood with ambitious goal
        if ((j.mood === 'sad' || j.mood === 'neutral') && g.done === false && g.type && g.type.toLowerCase().includes('long')) {
          found.push({
            journal: j,
            goal: g,
            reason: 'Mood is low but goal is ambitious. Possible misalignment.'
          });
        }
        // Example: repeated excuse
        if (j.log && j.log.toLowerCase().includes('excuse')) {
          found.push({
            journal: j,
            goal: g,
            reason: 'Repeated excuse detected in journal.'
          });
        }
        // Example: goal never referenced
        if (g.done === false && !(j.log && j.log.toLowerCase().includes(g.name.toLowerCase()))) {
          found.push({
            journal: j,
            goal: g,
            reason: 'Goal set but not referenced in journal.'
          });
        }
      });
    });
    setContradictions(found);
    setLoading(false);
  }

  async function handleExplain(idx) {
    setExplaining(idx);
    setExplanation('');
    const c = contradictions[idx];
    const prompt = `Explain why this is a contradiction for John Kinyua.\nJournal: ${c.journal.log}\nGoal: ${c.goal.name}\nReason: ${c.reason}`;
    try {
      const reply = await fetchOpenAICompletion(prompt);
      setExplanation(reply);
    } catch {
      setExplanation('Could not get explanation from GPT.');
    }
    setExplaining(null);
  }

  return (
    <div className="contradictions-page fade-in" style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 0.5rem', minHeight: '100vh' }}>
      <h1 style={{ fontWeight: 700, fontSize: '2rem', color: '#1a1a1a', marginBottom: 6 }}>⚡ Contradiction Checker</h1>
      <p style={{ color: '#333', marginBottom: 18 }}>See where your thoughts and goals are out of sync. Face your blind spots.</p>
      {loading && <div style={{ color: '#aaa', fontSize: 15 }}>Loading...</div>}
      <div className="contradictions-list" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {contradictions.map((c, idx) => (
          <div key={idx} className="contradiction-card fade-in" style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 8px 0 rgba(255,0,0,0.08)', border: '1.5px solid #ff4d4f', padding: '1.1rem 1.2rem', color: '#1a1a1a', fontFamily: 'Inter, sans-serif', animation: 'fadeIn 0.7s' }}>
            <div style={{ color: '#ff4d4f', fontWeight: 600, marginBottom: 6 }}>Contradiction Detected</div>
            <div style={{ fontSize: 15, marginBottom: 4 }}><b>Journal:</b> {c.journal.log}</div>
            <div style={{ fontSize: 15, marginBottom: 4 }}><b>Goal:</b> {c.goal.name}</div>
            <div style={{ fontSize: 14, marginBottom: 8, color: '#b71c1c' }}><b>Reason:</b> {c.reason}</div>
            <button onClick={() => handleExplain(idx)} disabled={explaining === idx} style={{ background: '#5b78f6', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Explain This</button>
            {explaining === idx && <div style={{ color: '#5b78f6', fontSize: 15, marginTop: 8 }}>Thinking...</div>}
            {explanation && explaining === null && <div style={{ color: '#5b78f6', fontSize: 15, marginTop: 8 }}>{explanation}</div>}
          </div>
        ))}
      </div>
      {!loading && contradictions.length === 0 && <div style={{ color: '#aaa', fontSize: 15, marginTop: 18 }}>No contradictions detected in the last 14 days.</div>}
    </div>
  );
} 