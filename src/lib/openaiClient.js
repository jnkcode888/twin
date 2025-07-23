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

async function fetchAllData() {
  // Fetch all logs, ideas, goals
  const [logs, ideas, goals] = await Promise.all([
    supabase.from('logs').select('*').order('created_at', { ascending: true }),
    supabase.from('ideas').select('*').order('created_at', { ascending: true }),
    supabase.from('goals').select('*').order('created_at', { ascending: true }),
  ]);
  return {
    logs: logs.data || [],
    ideas: ideas.data || [],
    goals: goals.data || [],
  };
}

// Periodically summarize all data and store the summary
export async function summarizeAllDataAndStore() {
  const { logs, ideas, goals } = await fetchAllData();
  const prompt = `Summarize all of John Kinyua's logs, ideas, and goals so far. Identify deep patterns, recurring themes, and long-term contradictions. Give a psychological profile and suggest areas for growth.`;
  const ai = await callOpenAI(prompt + '\n\nLogs:\n' + JSON.stringify(logs) + '\n\nIdeas:\n' + JSON.stringify(ideas) + '\n\nGoals:\n' + JSON.stringify(goals));
  if (ai.success) {
    await supabase.from('ai_summaries').insert({
      summary: ai.data,
      created_at: new Date().toISOString(),
    });
  }
  return ai;
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
    // Simple greeting detection (can be expanded)
    const greetings = [
      'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'yo', 'sup', 'howdy'
    ];
    const normalized = userInput.trim().toLowerCase();
    const isGreeting = greetings.some(g => normalized === g || normalized.startsWith(g + ' '));

    if (isGreeting) {
      // Minimal prompt for greetings
      const prompt = `You are JohnGPT — a digital clone of John Kinyua. Always reply exactly as John would, in a human, conversational way. If greeted, greet back naturally. Do NOT mention goals, journals, or ideas unless the user asks. Only use personal data if it is relevant to the user's message.\n\nUser: ${userInput}`;
      const ai = await callOpenAI(prompt);
      if (!ai.success) return { success: false, prompt };
      return { success: true, data: ai.data };
    }

    // For deeper questions, include all context
    const { logs, ideas, goals } = await fetchAllData();
    // Fetch last 10 AI conversations as additional context
    const { data: chats } = await supabase
      .from('johngpt_chat')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);
    const chatHistory = (chats || []).map(c => `User: ${c.user_message}\nAI: ${c.gpt_response}`).join('\n');
    // Fetch latest summary if available
    const { data: summaries } = await supabase
      .from('ai_summaries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    const latestSummary = summaries && summaries.length ? summaries[0].summary : '';
    const prompt = `You are JohnGPT — a digital clone of John Kinyua based on his entire journal logs, reflections, goals, ideas, and past conversations.\nYou must: Think, speak, and reply exactly as John would. Only answer the user's question or statement as John would, in a conversational, human way. Do NOT summarize, reflect, or analyze unless the user explicitly asks for it. Use his tone, language, and personality. Use personal data as background knowledge, but only bring up details if relevant to the user's message.\n\nLatest AI Summary:\n${latestSummary}\n\nRecent AI Conversations:\n${chatHistory}\n\nQuestion: ${userInput}\n\nReference logs:\n${JSON.stringify(logs, null, 2)}\nReference ideas:\n${JSON.stringify(ideas, null, 2)}\nReference goals:\n${JSON.stringify(goals, null, 2)}`;
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