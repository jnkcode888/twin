// openaiClient.js
// ... existing code ... 

import { supabase } from './supabaseClient';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-3.5-turbo';

async function fetchRecentData() {
  // Fetch logs, ideas, goals from the last 7 days
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [logs, ideas, goals] = await Promise.all([
    supabase.from('logs').select('*').gte('created_at', since),
    supabase.from('ideas').select('*').gte('created_at', since),
    supabase.from('goals').select('*').gte('created_at', since),
  ]);
  return {
    logs: logs.data || [],
    ideas: ideas.data || [],
    goals: goals.data || [],
  };
}

export async function fetchWeeklyReflection() {
  let prompt = '';
  try {
    const { logs, ideas, goals } = await fetchRecentData();
    prompt = `You are LifeOS, an honest, intelligent, challenging assistant to John Kinyua.\n\nHere are his logs, ideas, and goals for the past 7 days:\n\nLogs:\n${JSON.stringify(logs, null, 2)}\n\nIdeas:\n${JSON.stringify(ideas, null, 2)}\n\nGoals:\n${JSON.stringify(goals, null, 2)}\n\nIdentify any repeated thoughts, habits, or emotional patterns.\nPoint out any contradictions between what he says and what he does.\nList areas where he's vague or unclear in thinking.\nChallenge assumptions in his ideas.\nRecommend 3 concrete actions that require uncomfortable but necessary effort.`;

    // Fallback prompt in user's requested format
    const fallbackPrompt = `You are LifeOS, John Kinyua's brutally honest weekly reflection system.\n\nHere is the raw data from my week:\n\n📝 Journals:\n${logs.map(l => l.content || l.log || JSON.stringify(l)).join('\n')}\n\n💡 Ideas:\n${ideas.map(i => i.content || i.idea || JSON.stringify(i)).join('\n')}\n\n🎯 Goals:\n${goals.map(g => g.name || g.goal || JSON.stringify(g)).join('\n')}\n\n---\n\nBased on this, give me the following:\n\n1. 🔁 Identify any repeated thoughts, moods, behaviors, or excuses.\n2. 🧠 What patterns might I be blind to?\n3. ❌ Point out contradictions between my goals and actions.\n4. ⚠️ Where am I being vague, lazy, or avoiding discomfort?\n5. 🤺 Play devil's advocate — what would someone smarter than me criticize?\n6. 💬 Ask me 3 deep, uncomfortable questions I must answer next week.\n7. 🔨 Suggest 3 hard things I should do to break my current loop.\n\nUse a direct, challenging tone. Don't flatter. Don't soften the blow. Help me confront reality.`;

    const ai = await callOpenAI(prompt);
    if (!ai.success) return { success: false, prompt: fallbackPrompt };
    // Try to parse sections from AI response
    const result = parseWeeklyReflection(ai.data);
    return { success: true, data: result };
  } catch (e) {
    return { success: false, prompt };
  }
}

export async function fetchJohnGPTResponse(userInput) {
  try {
    const { logs, ideas, goals } = await fetchRecentData();
    const prompt = `You are JohnGPT — a digital clone of John Kinyua based on his journal logs, reflections, goals, and language patterns.\nYou must: Think like him. Speak like him. Disagree with him when needed.\nAnswer this question as if it came from within. Use his tone, logic, and values.\n\nQuestion: ${userInput}\n\nReference logs:\n${JSON.stringify(logs, null, 2)}`;
    const ai = await callOpenAI(prompt);
    if (!ai.success) return { success: false, prompt };
    return { success: true, data: ai.data };
  } catch (e) {
    return { success: false };
  }
}

export async function fetchWeeklyInsights() {
  try {
    const { logs, ideas, goals } = await fetchRecentData();
    const prompt = `What recurring habits or phrases show up? What might John not be seeing?\nWhat did he avoid? What did he keep postponing?\nWhat would a critic say about his week? Be harsh but fair.\nAsk 3 questions he must answer next week to grow.\n\nLogs:\n${JSON.stringify(logs, null, 2)}\nIdeas:\n${JSON.stringify(ideas, null, 2)}\nGoals:\n${JSON.stringify(goals, null, 2)}`;
    const ai = await callOpenAI(prompt);
    if (!ai.success) return { success: false, prompt };
    // Try to parse sections from AI response
    const result = parseWeeklyInsights(ai.data);
    return { success: true, data: result };
  } catch (e) {
    return { success: false };
  }
}

async function callOpenAI(prompt) {
  try {
    const res = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 900,
        temperature: 0.7,
      }),
    });
    if (!res.ok) return { success: false };
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    return { success: true, data: content };
  } catch (e) {
    return { success: false };
  }
}

function parseWeeklyReflection(text) {
  // Try to split text into sections based on headings or emojis
  const obs = extractSection(text, /AI Observations|🔍/i);
  const contra = extractSection(text, /Contradictions|Blindspots|❓/i);
  const opp = extractSection(text, /Missed Opportunities|💡/i);
  return {
    observations: obs || text,
    contradictions: contra || '',
    opportunities: opp || '',
  };
}

function parseWeeklyInsights(text) {
  return {
    frequency: extractSection(text, /Log Frequency|🔁/i) || text,
    heatmap: extractSection(text, /Mood Heatmap|😐/i) || '',
    abandoned: extractSection(text, /Abandoned Goals|❌/i) || '',
    questions: extractSection(text, /AI Questions|Push Back|🧠/i) || '',
  };
}

function extractSection(text, regex) {
  // Find section by heading or emoji, return following lines until next heading/emoji
  const lines = text.split(/\r?\n/);
  let found = false, result = [];
  for (let line of lines) {
    if (regex.test(line)) { found = true; continue; }
    if (found && /^\s*([A-Z][A-Za-z ]+|[🔍❓💡❌🧠😐])\s*[:：-]?/.test(line)) break;
    if (found) result.push(line);
  }
  return result.join('\n').trim();
}

// Legacy placeholder
export function fetchOpenAICompletion(prompt) {
  return Promise.resolve("This is a mock OpenAI completion for: " + prompt);
} 