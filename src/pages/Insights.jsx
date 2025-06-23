import React, { useState } from 'react';
import styles from './Insights.module.css';
import { fetchWeeklyInsights } from '../lib/openaiClient';
import { supabase } from '../lib/supabaseClient';

export default function Insights() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [manualInput, setManualInput] = useState('');

  async function handleGenerate() {
    setLoading(true);
    setShowManual(false);
    setInsights(null);
    try {
      const result = await fetchWeeklyInsights();
      if (result && result.success) {
        setInsights(result.data);
      } else {
        setShowManual(true);
      }
    } catch (e) {
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
      <h1>📊 Weekly Summary & Challenge Mode</h1>
      <button className={styles.generateBtn} onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Weekly Insights'}
      </button>
      {insights && (
        <div className={styles.insightsBox}>
          <section>
            <h2>🔁 Log Frequency</h2>
            <pre>{insights.frequency}</pre>
          </section>
          <section>
            <h2>😐 Mood Heatmap</h2>
            <pre>{insights.heatmap}</pre>
          </section>
          <section>
            <h2>❌ Abandoned Goals</h2>
            <pre>{insights.abandoned}</pre>
          </section>
          <section>
            <h2>🧠 AI Questions That Push Back</h2>
            <pre>{insights.questions}</pre>
          </section>
        </div>
      )}
      {showManual && (
        <div className={styles.fallbackBox}>
          <p>GPT failed. Paste this into ChatGPT manually:</p>
          <textarea className={styles.codeBlock} value={insights?.prompt || ''} readOnly rows={8} />
          <textarea className={styles.manualInput} value={manualInput} onChange={e => setManualInput(e.target.value)} placeholder="Paste ChatGPT response here..." rows={6} />
          <button className={styles.saveBtn} onClick={handleManualSave}>Save Insights</button>
        </div>
      )}
    </div>
  );
} 