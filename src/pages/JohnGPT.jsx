import React, { useState } from 'react';
import styles from './JohnGPT.module.css';
import { fetchJohnGPTResponse } from '../lib/openaiClient';
import { supabase } from '../lib/supabaseClient';

export default function JohnGPT() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualInput, setManualInput] = useState('');

  async function handleAsk(e) {
    e.preventDefault();
    setLoading(true);
    setShowManual(false);
    setResponse('');
    try {
      const result = await fetchJohnGPTResponse(input);
      if (result && result.success) {
        setResponse(result.data);
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
      <h1>👤 JohnGPT (Personal AI Clone)</h1>
      <form onSubmit={handleAsk} className={styles.form}>
        <input
          className={styles.input}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask yourself..."
          disabled={loading}
        />
        <button className={styles.askBtn} type="submit" disabled={loading || !input.trim()}>
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </form>
      {response && (
        <div className={styles.responseBox}>
          <div className={styles.monologue}>{response}</div>
        </div>
      )}
      {showManual && (
        <div className={styles.fallbackBox}>
          <p>GPT failed. Paste this into ChatGPT manually:</p>
          <textarea className={styles.codeBlock} value={input} readOnly rows={3} />
          <textarea className={styles.manualInput} value={manualInput} onChange={e => setManualInput(e.target.value)} placeholder="Paste ChatGPT response here..." rows={6} />
          <button className={styles.saveBtn} onClick={handleManualSave}>Save Response</button>
        </div>
      )}
    </div>
  );
} 