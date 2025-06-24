import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Metrics() {
  const [journalCount, setJournalCount] = useState(0);
  const [ideaCount, setIdeaCount] = useState(0);
  const [goals, setGoals] = useState([]);
  const [insights, setInsights] = useState('');
  const [daysJournaled, setDaysJournaled] = useState([]);
  const [daysIdeas, setDaysIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    setLoading(true);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    // Journals
    const { data: journals } = await supabase
      .from('journal')
      .select('*')
      .gte('timestamp', sevenDaysAgo.toISOString());
    setJournalCount(journals ? journals.length : 0);
    const journalDays = (journals || []).map(j => new Date(j.timestamp).toLocaleDateString());
    setDaysJournaled(journalDays);
    // Ideas
    const { data: ideas } = await supabase
      .from('ideas')
      .select('*')
      .gte('created_at', sevenDaysAgo.toISOString());
    setIdeaCount(ideas ? ideas.length : 0);
    const ideaDays = (ideas || []).map(i => new Date(i.created_at).toLocaleDateString());
    setDaysIdeas(ideaDays);
    // Goals
    const { data: goalsData } = await supabase
      .from('goals')
      .select('*');
    setGoals(goalsData || []);
    // Insights
    const { data: reflections } = await supabase
      .from('manual_ai_reflection')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    setInsights(reflections && reflections.length ? reflections[0].gpt_response : '');
    setLoading(false);
  }

  const completed = goals.filter(g => g.done).length;
  const percentGoals = goals.length ? Math.round((completed / goals.length) * 100) : 0;
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString();
  });

  return (
    <div className="metrics-page fade-in" style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 0.5rem', minHeight: '100vh' }}>
      <h1 style={{ fontWeight: 700, fontSize: '2rem', color: '#1a1a1a', marginBottom: 6 }}>📊 Metrics Dashboard</h1>
      <div className="metrics-summary-card" style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 8px 0 rgba(90,110,180,0.07)', padding: '1.2rem', marginBottom: 24 }}>
        <div style={{ fontSize: 17, marginBottom: 8 }}><b>Journals:</b> {journalCount}</div>
        <div style={{ fontSize: 17, marginBottom: 8 }}><b>Ideas:</b> {ideaCount}</div>
        <div style={{ fontSize: 17, marginBottom: 8 }}><b>Goals Completed:</b> {percentGoals}%</div>
        <div style={{ fontSize: 17, marginBottom: 8 }}><b>AI Insights:</b> <span style={{ color: '#5b78f6' }}>{insights ? insights.slice(0, 120) + (insights.length > 120 ? '...' : '') : 'No summary yet.'}</span></div>
      </div>
      <div className="metrics-bars" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Days Journaled</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {days.map(day => (
              <div key={day} style={{ flex: 1, background: daysJournaled.includes(day) ? '#5b78f6' : '#e5e8f0', height: 22, borderRadius: 6, transition: 'background 0.3s' }} title={day}></div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Days Ideas Logged</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {days.map(day => (
              <div key={day} style={{ flex: 1, background: daysIdeas.includes(day) ? '#5b78f6' : '#e5e8f0', height: 22, borderRadius: 6, transition: 'background 0.3s' }} title={day}></div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Goals Completed</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {goals.map((g, i) => (
              <div key={i} style={{ flex: 1, background: g.done ? '#5b78f6' : '#e5e8f0', height: 22, borderRadius: 6, transition: 'background 0.3s' }} title={g.name}></div>
            ))}
          </div>
        </div>
      </div>
      {loading && <div style={{ color: '#aaa', fontSize: 15, marginTop: 18 }}>Loading...</div>}
    </div>
  );
} 