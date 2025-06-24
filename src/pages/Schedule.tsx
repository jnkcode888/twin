import React, { useEffect, useState, useRef } from 'react';
import ScheduleBlock from '../components/ScheduleBlock';
import '../styles/Schedule.css';
import { supabase } from '../lib/supabaseClient';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Block = {
  label: string;
  value: string;
  done: boolean;
};

type DaySchedule = {
  date: string; // YYYY-MM-DD
  blocks: Block[];
  id: string | null;
};

const DEFAULT_BLOCKS: { Work: Block[]; Weekend: Block[] } = {
  Work: [
    { label: '8AM-5PM', value: 'At Work / Attachment', done: false },
    { label: '7PM-8PM', value: '', done: false },
    { label: '8PM-9PM', value: '', done: false },
    { label: '9PM-10PM', value: '', done: false },
    { label: '10PM-11PM', value: '', done: false },
    { label: '11PM-12AM', value: '', done: false },
  ],
  Weekend: [
    { label: '9AM-11AM', value: '', done: false },
    { label: '11AM-1PM', value: '', done: false },
    { label: '1PM-3PM', value: '', done: false },
    { label: '3PM-5PM', value: '', done: false },
    { label: '5PM-7PM', value: '', done: false },
    { label: '7PM-9PM', value: '', done: false },
    { label: '9PM-10PM', value: '', done: false },
  ],
};

function getSmartDefault(date: Date): Block[] {
  const dayIdx = date.getDay();
  if (dayIdx === 0 || dayIdx === 6) return DEFAULT_BLOCKS.Weekend;
  return DEFAULT_BLOCKS.Work;
}

function getCurrentBlockIdx(blocks: Block[]): number {
  const now = new Date();
  const hour = now.getHours();
  for (let i = 0; i < blocks.length; i++) {
    const [start] = blocks[i].label.split('-');
    const startHour = parseInt(start);
    if (hour === startHour) return i;
  }
  return -1;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDisplay(date: Date): string {
  return `${DAYS[date.getDay()]}, ${date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`;
}

export default function Schedule() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState<Date>(today);
  const [daySchedule, setDaySchedule] = useState<DaySchedule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [animDir, setAnimDir] = useState<string>('');
  const [missedYesterday, setMissedYesterday] = useState<Block[]>([]);
  const [missedLastWeek, setMissedLastWeek] = useState<{ day: string; block: Block }[]>([]);
  const sliderRef = useRef<HTMLDivElement>(null);

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = new Date(e.target.value);
    if (!isNaN(picked.getTime())) setCurrentDate(picked);
  }

  // Load schedule for current date
  useEffect(() => {
    async function fetchDay() {
      setLoading(true);
      const dateStr = formatDate(currentDate);
      const { data } = await supabase.from('weekly_schedule').select('*').eq('date', dateStr).maybeSingle();
      let blocks: Block[];
      let id: string | null = null;
      if (data) {
        blocks = data.blocks;
        id = data.id;
      } else {
        blocks = getSmartDefault(currentDate);
      }
      setDaySchedule({ date: dateStr, blocks, id });
      setLoading(false);
    }
    fetchDay();
  }, [currentDate]);

  // Save current day's blocks to Supabase
  async function saveDay(blocks: Block[]) {
    if (!daySchedule) return;
    const dateStr = daySchedule.date;
    setDaySchedule(ds => ds ? { ...ds, blocks } : null);
    console.log('saveDay:', blocks); // Debug log
    if (daySchedule.id) {
      await supabase.from('weekly_schedule').update({ blocks, updated_at: new Date().toISOString() }).eq('id', daySchedule.id);
    } else {
      const { data } = await supabase.from('weekly_schedule').insert({ date: dateStr, blocks, updated_at: new Date().toISOString() }).select();
      if (data && data[0]) {
        setDaySchedule(ds => ds ? { ...ds, id: data[0].id } : null);
      }
    }
  }

  function updateBlock(blockIdx: number, value: string) {
    if (!daySchedule) return;
    const newBlocks = daySchedule.blocks.map((b: Block, i: number) => i === blockIdx ? { ...b, value } : b);
    console.log('updateBlock:', newBlocks); // Debug log
    saveDay(newBlocks);
  }
  function toggleBlock(blockIdx: number) {
    if (!daySchedule) return;
    const newBlocks = daySchedule.blocks.map((b: Block, i: number) => i === blockIdx ? { ...b, done: !b.done } : b);
    saveDay(newBlocks);
  }

  // Animation for sliding days
  function goToDate(offset: number) {
    setAnimDir(offset > 0 ? 'slide-left' : 'slide-right');
    setTimeout(() => {
      setCurrentDate(prev => {
        const d = new Date(prev);
        d.setDate(d.getDate() + offset);
        return d;
      });
      setAnimDir('');
    }, 250);
  }

  // Missed tasks logic
  useEffect(() => {
    async function fetchMissed() {
      // Yesterday
      const yest = new Date(currentDate);
      yest.setDate(yest.getDate() - 1);
      const yestStr = formatDate(yest);
      const { data: yestData } = await supabase.from('weekly_schedule').select('*').eq('date', yestStr).maybeSingle();
      setMissedYesterday(yestData && yestData.blocks ? yestData.blocks.filter((b: Block) => !b.done && b.value) : []);
      // Last week
      let missed: { day: string; block: Block }[] = [];
      for (let i = 1; i <= 7; i++) {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - i);
        const dStr = formatDate(d);
        const { data } = await supabase.from('weekly_schedule').select('*').eq('date', dStr).maybeSingle();
        if (data && data.blocks) {
          data.blocks.forEach((b: Block) => {
            if (!b.done && b.value) missed.push({ day: formatDisplay(d), block: b });
          });
        }
      }
      setMissedLastWeek(missed.slice(0, 3));
    }
    fetchMissed();
  }, [currentDate]);

  const blocks = daySchedule?.blocks || [];
  const currentBlockIdx = getCurrentBlockIdx(blocks);

  return (
    <div className="schedule-page fade-in">
      {/* Date Picker UI */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 12 }}>
        <input
          type="date"
          value={formatDate(currentDate)}
          onChange={handleDateChange}
          style={{
            fontSize: 16,
            borderRadius: 8,
            border: '1.5px solid #e5e8f0',
            padding: '0.4rem 1rem',
            background: '#fff',
            color: '#1a1a1a',
            boxShadow: '0 1px 4px 0 rgba(90,110,180,0.04)'
          }}
        />
      </div>
      <div className="schedule-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 18 }}>
        <button className="day-nav-btn" onClick={() => goToDate(-1)}>&larr;</button>
        <div className="today-label fade-in" style={{ fontWeight: 700, fontSize: 22, color: '#5b78f6', letterSpacing: 0.5 }}>
          {formatDisplay(currentDate)}{formatDate(currentDate) === formatDate(today) ? ' (Today)' : ''}
        </div>
        <button className="day-nav-btn" onClick={() => goToDate(1)}>&rarr;</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <div ref={sliderRef} className={`schedule-slider ${animDir}`} style={{ transition: 'transform 0.25s' }}>
      <div className="schedule-list">
            {blocks.map((block: Block, idx: number) => (
              <div key={block.label} className={`schedule-block-anim fade-in${idx === currentBlockIdx && formatDate(currentDate) === formatDate(today) ? ' pulse' : ''}`}> 
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
      )}
      {/* Missed tasks */}
      <div className="missed-tasks-section fade-in" style={{ marginTop: 32 }}>
        {missedYesterday.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 600, color: '#ff4d4f', marginBottom: 6 }}>⚠️ You missed these tasks yesterday</div>
            <ul style={{ paddingLeft: 18 }}>
              {missedYesterday.map((b: Block, i: number) => <li key={i} style={{ color: '#b71c1c', fontSize: 15 }}>{b.label}: {b.value}</li>)}
            </ul>
          </div>
        )}
        {missedLastWeek.length > 0 && (
          <div>
            <div style={{ fontWeight: 600, color: '#b88a00', marginBottom: 6 }}>📉 Uncompleted tasks last week</div>
            <ul style={{ paddingLeft: 18 }}>
              {missedLastWeek.map((item, i) => <li key={i} style={{ color: '#b88a00', fontSize: 15 }}>{item.day}: {item.block.label} - {item.block.value}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}