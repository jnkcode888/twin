import React, { useState } from 'react';
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
        let fallbackPrompt = result?.prompt;
        if (!fallbackPrompt) {
          // Generate fallback prompt here if missing
          const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          const [logs, ideas, goals] = await Promise.all([
            supabase.from('logs').select('*').gte('created_at', since),
            supabase.from('ideas').select('*').gte('created_at', since),
            supabase.from('goals').select('*').gte('created_at', since),
          ]);
          fallbackPrompt = `You are LifeOS, John Kinyua's brutally honest weekly reflection system.\n\nHere is the raw data from my week:\n\n📝 Journals:\n${(logs.data || []).map(l => l.content || l.log || JSON.stringify(l)).join('\n')}\n\n💡 Ideas:\n${(ideas.data || []).map(i => i.content || i.idea || JSON.stringify(i)).join('\n')}\n\n🎯 Goals:\n${(goals.data || []).map(g => g.name || g.goal || JSON.stringify(g)).join('\n')}\n\n---\n\nBased on this, give me the following:\n\n1. 🔁 Identify any repeated thoughts, moods, behaviors, or excuses.\n2. 🧠 What patterns might I be blind to?\n3. ❌ Point out contradictions between my goals and actions.\n4. ⚠️ Where am I being vague, lazy, or avoiding discomfort?\n5. 🤺 Play devil's advocate — what would someone smarter than me criticize?\n6. 💬 Ask me 3 deep, uncomfortable questions I must answer next week.\n7. 🔨 Suggest 3 hard things I should do to break my current loop.\n\nUse a direct, challenging tone. Don't flatter. Don't soften the blow. Help me confront reality.`;
        }
        setManualPrompt(fallbackPrompt);
        setShowManual(true);
      }
    } catch (e) {
      setManualPrompt('Failed to generate prompt. Please try again.');
      setShowManual(true);
    }
    setLoading(false);
  }

  async function handleManualSave() {
    await supabase.from('manual_ai_reflection').insert({ content: manualInput, created_at: new Date().toISOString() });
    setManualInput('');
    setShowManual(false);
  }

  return (
    <div className={styles.container}>
      <h1>🧠 AI Weekly Reflection</h1>
      <button className={styles.generateBtn} onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate AI Weekly Reflection'}
      </button>
      {summary && (
        <div className={styles.summaryBox}>
          <h2>🔍 AI Observations</h2>
          <pre>{summary.observations}</pre>
          <h2>❓ Contradictions or Blindspots</h2>
          <pre>{summary.contradictions}</pre>
          <h2>💡 Missed Opportunities</h2>
          <pre>{summary.opportunities}</pre>
        </div>
      )}
      {showManual && (
        <div className={styles.fallbackBox}>
          <h2 className={styles.manualTitle}>Manual AI Summary Generator</h2>
          <div className={styles.fallbackPromptLabel}>📌 GPT Fallback Prompt (to copy manually):</div>
          <textarea
            className={styles.codeBlock}
            value={manualPrompt}
            readOnly
            rows={12}
            style={{ fontSize: '0.98rem', marginBottom: 12 }}
          />
          <label className={styles.manualInputLabel} htmlFor="manualInput">Paste your ChatGPT response here</label>
          <textarea
            id="manualInput"
            className={styles.manualInput}
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            placeholder="Paste your ChatGPT response here..."
            rows={6}
          />
          <button className={styles.saveBtn} onClick={handleManualSave}>Save This Weekly Reflection</button>
        </div>
      )}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
} 