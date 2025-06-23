import React, { useEffect, useState } from 'react';
import ScheduleBlock from '../components/ScheduleBlock';
import '../styles/Schedule.css';
import { supabase } from '../lib/supabaseClient';
import { format } from 'date-fns';

type Block = {
  label: string;
  value: string;
  done: boolean;
};

const TIME_BLOCKS = [
  '5PM-6PM', '6PM-7PM', '7PM-8PM', '8PM-9PM', '9PM-10PM',
  '10PM-11PM', '11PM-12AM', '12AM-1AM', '1AM-2AM'
];

const STORAGE_KEY = 'lifeos_schedule';

function getCurrentBlockIdx() {
  const now = new Date();
  let hour = now.getHours();
  if (hour < 17) return -1;
  if (hour >= 17 && hour < 24) return hour - 17;
  if (hour >= 0 && hour < 2) return hour + 7;
  return -1;
}

function Schedule() {
  const [blocks, setBlocks] = useState<Block[]>(() => {
    const local = localStorage.getItem(STORAGE_KEY);
    return local ? JSON.parse(local) : TIME_BLOCKS.map(label => ({ label, value: '', done: false }));
  });
  const [loading, setLoading] = useState(false);
  const currentIdx = getCurrentBlockIdx();

  // Load from Supabase on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error } = await supabase
        .from('schedule')
        .select('*')
        .order('id');
      if (data && data.length) {
        setBlocks(data.map((row: any) => ({ label: row.label, value: row.value, done: row.done })));
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Save to localStorage and Supabase on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
    async function saveData() {
      await supabase.from('schedule').upsert(
        blocks.map((b, i) => ({ id: i + 1, ...b })),
        { onConflict: 'id' }
      );
    }
    saveData();
  }, [blocks]);

  function updateBlock(idx: number, value: string) {
    setBlocks(blocks => blocks.map((b, i) => i === idx ? { ...b, value } : b));
  }
  function toggleBlock(idx: number) {
    setBlocks(blocks => blocks.map((b, i) => i === idx ? { ...b, done: !b.done } : b));
  }

  return (
    <div className="schedule-page">
      <h1>Schedule</h1>
      {loading && <p>Loading...</p>}
      <div className="schedule-list">
        {blocks.map((block, idx) => (
          <div key={block.label} className={idx === currentIdx ? 'current-block' : ''}>
            <ScheduleBlock
              label={block.label}
              value={block.value}
              done={block.done}
              onChange={(val: string) => updateBlock(idx, val)}
              onToggle={() => toggleBlock(idx)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Schedule; 