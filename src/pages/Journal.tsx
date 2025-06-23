import React, { useState } from 'react';
import '../styles/Journal.css';
import { supabase } from '../lib/supabaseClient';
import { fetchOpenAICompletion } from '../lib/openaiClient';

const MOODS = [
  { label: '😞', value: 'sad' },
  { label: '😐', value: 'neutral' },
  { label: '😊', value: 'happy' },
  { label: '🔥', value: 'fired up' },
];

function Journal() {
  const [log, setLog] = useState('');
  const [mood, setMood] = useState('');
  const [aiReply, setAiReply] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [reflecting, setReflecting] = useState(false);

  async function saveLog() {
    setSaving(true);
    await supabase.from('journal').insert({ log, mood, timestamp: new Date().toISOString() });
    setSaving(false);
  }

  async function askAI() {
    setReflecting(true);
    setError('');
    setAiReply('');
    const prompt = `You are LifeOS, John Kinyua's personal AI. Analyze this log and mood. Give 1 win, 1 weakness, and 1 action step for tomorrow.\nLog: ${log}\nMood: ${mood}`;
    try {
      const reply = await fetchOpenAICompletion(prompt);
      setAiReply(reply);
    } catch {
      setError('GPT failed. Paste this in ChatGPT:\n\n"You are LifeOS. Analyze this log and give advice: ' + log + '"\n\nPaste the response below:');
    }
    setReflecting(false);
  }

  return (
    <div className="journal-page">
      <h1>Journal</h1>
      <textarea
        className="journal-textarea"
        value={log}
        onChange={e => setLog(e.target.value)}
        placeholder="Write your daily log..."
        rows={6}
      />
      <div className="journal-controls">
        <select value={mood} onChange={e => setMood(e.target.value)} className="journal-mood">
          <option value="">Mood</option>
          {MOODS.map(m => <option key={m.value} value={m.label}>{m.label}</option>)}
        </select>
        <button onClick={saveLog} disabled={saving || !log || !mood} className="journal-save">{saving ? 'Saving...' : 'Save'}</button>
        <button onClick={askAI} disabled={reflecting || !log || !mood} className="journal-ai">{reflecting ? 'Reflecting...' : 'Ask AI for Reflection'}</button>
      </div>
      {aiReply && <div className="journal-ai-reply"><strong>AI Reflection:</strong><br />{aiReply}</div>}
      {error && <div className="journal-fallback"><pre>{error}</pre></div>}
    </div>
  );
}

export default Journal; 