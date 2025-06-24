import React, { useState, useEffect } from 'react';
import styles from './WeeklyReview.module.css';
import { fetchWeeklyReflection } from '../lib/openaiClient';
import { supabase } from '../lib/supabaseClient';

export default function WeeklyReview() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [manualPrompt, setManualPrompt] = useState('');
  const [journals, setJournals] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    if (showManual) {
      fetchData();
    }
    // eslint-disable-next-line
  }, [showManual]);

  async function fetchData() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: journalEntries } = await supabase
      .from('journal')
      .select('*')
      .gte('timestamp', sevenDaysAgo.toISOString())
      .order('timestamp', { ascending: false });

    const { data: ideaEntries } = await supabase
      .from('ideas')
      .select('*')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    const { data: goalEntries } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    setJournals(journalEntries || []);
    setIdeas(ideaEntries || []);
    setGoals(goalEntries || []);

    // Build prompt
    let prompt = `You are LifeOS, John Kinyua's brutally honest weekly reflection system.\n\nHere is my data from the last 7 days:\n\n`;
    prompt += `📝 Journals:\n`;
    prompt += journalEntries && journalEntries.length ? journalEntries.map(j => `- [${j.timestamp ? new Date(j.timestamp).toLocaleString() : ''}] ${j.log || ''}`).join('\n') : 'None';
    prompt += `\n\n💡 Ideas:\n`;
    prompt += ideaEntries && ideaEntries.length ? ideaEntries.map(i => `- [${i.created_at ? new Date(i.created_at).toLocaleString() : ''}] ${i.idea || ''}${i.tags && i.tags.length ? ' (tags: ' + i.tags.join(', ') + ')' : ''}`).join('\n') : 'None';
    prompt += `\n\n🎯 Goals:\n`;
    prompt += goalEntries && goalEntries.length ? goalEntries.map(g => `- [${g.created_at ? new Date(g.created_at).toLocaleString() : ''}] ${g.name || ''} (${g.done ? 'done' : 'in progress'})`).join('\n') : 'None';
    prompt += `\n\nBased on this, give me the following:\n\n🔁 Repeated thoughts, behaviors, and excuses.\n🧠 Blind spots I might not be seeing.\n❌ Contradictions between my goals and actions.\n⚠️ Where I'm being vague, lazy, or comfortable.\n🤺 Devil's advocate critique of my logic this week.\n❓ 3 deep questions I must face next week.\n🔨 3 uncomfortable but necessary actions to break my loop.\n\nBe direct. Challenge me. Don't soften the truth.`;
    setManualPrompt(prompt);
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setShowManual(false);
    setSummary(null);
    setManualPrompt('');
    try {
      const result = await fetchWeeklyReflection();
      if (result && result.success) {
        setSummary(result.data);
      } else {
        setShowManual(true);
      }
    } catch (e) {
      setShowManual(true);
    }
    setLoading(false);
  }

  async function handleManualSave() {
    await supabase.from('manual_ai_reflection').insert({
      week_start: new Date().toISOString().slice(0, 10),
      gpt_response: manualInput,
      created_at: new Date().toISOString(),
    });
    setManualInput('');
    setShowManual(false);
  }

  return (
    <div className={`${styles.container} fade-in`} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px 0 rgba(90,110,180,0.07)', padding: '2.2rem 1.5rem', maxWidth: 700, margin: '2rem auto', fontFamily: 'Inter, sans-serif', color: '#1a1a1a' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 18 }}>🧠 AI Weekly Reflection</h1>
      <button className={styles.generateBtn} onClick={handleGenerate} disabled={loading} style={{ fontSize: 18, borderRadius: 8, padding: '0.6rem 1.5rem', background: '#5b78f6', color: '#fff', border: 'none', marginBottom: 24 }}>
        {loading ? 'Generating...' : 'Generate AI Weekly Reflection'}
      </button>
      {summary && (
        <div className={styles.summaryBox} style={{ background: '#f9f9fb', borderRadius: 12, padding: '1.5rem', marginTop: 18, fontSize: 17, color: '#1a1a1a', boxShadow: '0 1px 6px 0 rgba(90,110,180,0.04)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 10 }}>🔍 AI Observations</h2>
          <pre>{summary.observations}</pre>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: '1.2rem 0 10px' }}>❓ Contradictions or Blindspots</h2>
          <pre>{summary.contradictions}</pre>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: '1.2rem 0 10px' }}>💡 Missed Opportunities</h2>
          <pre>{summary.opportunities}</pre>
        </div>
      )}
      {showManual && (
        <div className={styles.fallbackBox} style={{ background: '#f9f9fb', borderRadius: 12, padding: '1.5rem', marginTop: 18, fontSize: 17, color: '#1a1a1a', boxShadow: '0 1px 6px 0 rgba(90,110,180,0.04)' }}>
          <h2 className={styles.manualTitle} style={{ fontSize: 20, fontWeight: 600, marginBottom: 10 }}>Manual AI Summary Generator</h2>
          <div className={styles.fallbackPromptLabel} style={{ fontSize: 15, color: '#5b78f6', marginBottom: 8 }}>📌 GPT Fallback Prompt (to copy manually):</div>
          <textarea
            className={styles.codeBlock}
            value={manualPrompt}
            readOnly
            rows={12}
            style={{ fontSize: '0.98rem', marginBottom: 12, width: '100%', borderRadius: 8, border: '1px solid #e5e8f0', background: '#fff' }}
          />
          <label className={styles.manualInputLabel} htmlFor="manualInput" style={{ fontSize: 15, margin: '10px 0 4px', display: 'block' }}>Paste your ChatGPT response here</label>
          <textarea
            id="manualInput"
            className={styles.manualInput}
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            placeholder="Paste your ChatGPT response here..."
            rows={6}
            style={{ fontSize: 16, borderRadius: 8, border: '1px solid #e5e8f0', width: '100%', marginBottom: 12 }}
          />
          <button className={styles.saveBtn} onClick={handleManualSave} style={{ fontSize: 16, borderRadius: 8, padding: '0.5rem 1.2rem', background: '#5b78f6', color: '#fff', border: 'none' }}>Save This Weekly Reflection</button>
        </div>
      )}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
} 