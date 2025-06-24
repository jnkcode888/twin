import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Ideas() {
  const [idea, setIdea] = useState('');
  const [tags, setTags] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIdeas();
  }, []);

  async function fetchIdeas() {
    setLoading(true);
    const { data } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    setIdeas(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!idea.trim()) return;
    const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean);
    await supabase.from('ideas').insert({
      idea: idea,
      tags: tagArr,
      created_at: new Date().toISOString(),
    });
    setIdea('');
    setTags('');
    fetchIdeas();
  }

  return (
    <div className="ideas-page fade-in">
      <h1 style={{ fontWeight: 700, fontSize: '2rem', color: '#1a1a1a', marginBottom: 18 }}>💡 Ideas</h1>
      <form className="idea-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        <input
          type="text"
          value={idea}
          onChange={e => setIdea(e.target.value)}
          placeholder="Your idea..."
          className="idea-input"
          style={{ fontSize: 17, borderRadius: 8, border: '1.5px solid #e5e8f0', padding: '0.7rem 1rem', background: '#fff', color: '#1a1a1a' }}
        />
        <input
          type="text"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="Tags (comma separated)"
          className="tags-input"
          style={{ fontSize: 15, borderRadius: 8, border: '1.5px solid #e5e8f0', padding: '0.6rem 1rem', background: '#f9f9fb', color: '#1a1a1a' }}
        />
        <button type="submit" className="idea-submit" style={{ background: '#5b78f6', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 8, padding: '0.7rem 1.2rem', fontSize: 16 }}>Add Idea</button>
      </form>
      {loading && <div style={{ color: '#aaa', fontSize: 15 }}>Loading...</div>}
      <div className="ideas-list" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {ideas.map((item) => (
          <div key={item.id} className="idea-card fade-in" style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 8px 0 rgba(90,110,180,0.07)', padding: '1.1rem 1.2rem', color: '#1a1a1a', fontFamily: 'Inter, sans-serif', animation: 'fadeIn 0.7s' }}>
            <div style={{ fontSize: 16, marginBottom: 6 }}>{item.idea}</div>
            <div style={{ fontSize: 13, color: '#5b78f6', marginBottom: 4 }}>{item.created_at && new Date(item.created_at).toLocaleString()}</div>
            {item.tags && item.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                {item.tags.map((tag, i) => (
                  <span key={i} style={{ background: '#f4f6fa', color: '#5b78f6', borderRadius: 8, padding: '2px 10px', fontSize: 13 }}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 