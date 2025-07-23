import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { fetchJohnGPTResponse } from '../lib/openaiClient';

export default function JohnGPT() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [includeContext, setIncludeContext] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  async function fetchHistory() {
    const { data } = await supabase
      .from('johngpt_chat')
      .select('*')
      .order('timestamp', { ascending: true });
    setMessages(data || []);
  }

  async function handleAsk(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    let context = {};
    if (includeContext) {
      const [journals, goals, ideas] = await Promise.all([
        supabase.from('journal').select('*').order('timestamp', { ascending: false }),
        supabase.from('goals').select('*').order('created_at', { ascending: false }),
        supabase.from('ideas').select('*').order('created_at', { ascending: false }),
      ]);
      context = {
        journals: journals.data || [],
        goals: goals.data || [],
        ideas: ideas.data || [],
      };
    }
    let gpt_response = '';
    try {
      const result = await fetchJohnGPTResponse(input);
      gpt_response = result && result.success ? result.data : 'Sorry, I could not connect to the AI right now.';
    } catch {
      gpt_response = 'Sorry, I could not connect to the AI right now.';
    }
    await supabase.from('johngpt_chat').insert({
      user_message: input,
      gpt_response,
      context_used: context,
      timestamp: new Date().toISOString(),
    });
    setMessages([...messages, { user_message: input, gpt_response, context_used: context, timestamp: new Date().toISOString() }]);
    setInput('');
    setLoading(false);
  }

  return (
    <div className="johngpt-page fade-in" style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 0.5rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontWeight: 700, fontSize: '2rem', color: '#1a1a1a', marginBottom: 6 }}>Talk to JohnGPT</h1>
      <p style={{ color: '#333', marginBottom: 18 }}>This agent knows your past journals, goals, and ideas. Ask anything — it will challenge your thinking.</p>
      <div className="johngpt-chat-window" style={{ flex: 1, overflowY: 'auto', background: '#f9f9fb', borderRadius: 14, boxShadow: '0 1px 8px 0 rgba(90,110,180,0.07)', padding: '1.2rem', marginBottom: 18, minHeight: 320 }}>
        {messages.map((msg, i) => (
          <React.Fragment key={i}>
            <div className="chat-bubble user-bubble slide-in" style={{ alignSelf: 'flex-end', background: '#5b78f6', color: '#fff', borderRadius: '16px 16px 4px 16px', marginBottom: 10, maxWidth: '85%', padding: '0.7rem 1.1rem', fontSize: 16 }}>{msg.user_message}</div>
            <div className="chat-bubble gpt-bubble slide-in" style={{ alignSelf: 'flex-start', background: '#fff', color: '#1a1a1a', borderRadius: '16px 16px 16px 4px', marginBottom: 18, maxWidth: '85%', padding: '0.7rem 1.1rem', fontSize: 16, boxShadow: '0 1px 6px 0 rgba(90,110,180,0.04)' }}>{msg.gpt_response}</div>
          </React.Fragment>
        ))}
        {loading && <div className="gpt-loading" style={{ color: '#5b78f6', fontSize: 18, margin: '0.5rem 0 1.2rem 0' }}><span className="loading-dots">Thinking</span></div>}
        <div ref={chatEndRef} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <label style={{ fontSize: 14, color: '#5b78f6', display: 'flex', alignItems: 'center', gap: 4 }}>
          <input type="checkbox" checked={includeContext} onChange={e => setIncludeContext(e.target.checked)} style={{ accentColor: '#5b78f6' }} /> Use recent journals/goals/ideas
        </label>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <textarea
          className="johngpt-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your question..."
          rows={2}
          style={{ flex: 1, borderRadius: 10, border: '1.5px solid #e5e8f0', padding: '0.8rem 1rem', fontSize: 16, fontFamily: 'Inter, sans-serif', background: '#fff', boxShadow: '0 1px 8px 0 rgba(90,110,180,0.07)', outline: 'none', resize: 'none', transition: 'box-shadow 0.2s' }}
        />
        <button onClick={handleAsk} disabled={loading || !input.trim()} style={{ background: '#5b78f6', color: '#fff', border: 'none', borderRadius: 10, padding: '0.8rem 1.3rem', fontWeight: 600, fontSize: 16, boxShadow: '0 1px 4px 0 rgba(90,110,180,0.04)' }}>Ask</button>
        </div>
    </div>
  );
} 