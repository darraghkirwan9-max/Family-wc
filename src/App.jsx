import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase.js'

const FAMILIES = [
  { name: 'Kirwan', color: '#E63946', emoji: '🔴' },
  { name: "O'Rourke", color: '#2A9D8F', emoji: '🟢' },
  { name: 'Carragher', color: '#E9C46A', emoji: '🟡' },
]

const C = {
  bg: '#0D1117',
  surface: '#161B22',
  border: '#30363D',
  white: '#F0F6FC',
  muted: '#8B949E',
  green: '#3FB950',
  red: '#F85149',
}

const TODAY = new Date().toISOString().slice(0, 10)
const ADMIN_CODE = 'kirwan2026'

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Instrument+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.white}; font-family: 'Instrument Sans', sans-serif; min-height: 100vh; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
  .fade-up { animation: fadeUp .4s ease both; }
  input, textarea, button { font-family: 'Instrument Sans', sans-serif; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
`

const familyColor = (name) => FAMILIES.find(f => f.name === name)?.color || C.muted
const familyEmoji = (name) => FAMILIES.find(f => f.name === name)?.emoji || '⚪'

function top50Avg(scores) {
  if (!scores.length) return 0
  const sorted = [...scores].sort((a, b) => b - a)
  const top = sorted.slice(0, Math.ceil(sorted.length / 2))
  return (top.reduce((a, b) => a + b, 0) / top.length)
}

async function getQuestion(date) {
  const { data } = await supabase.from('questions').select('data').eq('date', date).single()
  return data?.data || null
}
async function getAllQuestions() {
  const { data } = await supabase.from('questions').select('date, data').order('date', { ascending: false })
  return data || []
}
async function upsertQuestion(date, qdata) {
  await supabase.from('questions').upsert({ date, data: qdata })
}
async function deleteQuestion(date) {
  await supabase.from('questions').delete().eq('date', date)
}
async function getReveal(date) {
  const { data } = await supabase.from('reveals').select('*').eq('date', date).single()
  return data || null
}
async function upsertReveal(date, revealed, actual_a, actual_b) {
  await supabase.from('reveals').upsert({ date, hc_revealed: revealed, match_result: revealed ? 'revealed' : null, actual_a, actual_b })
}
async function getSubmission(date, player) {
  const id = `${date}::${player}`
  const { data } = await supabase.from('submissions').select('data').eq('id', id).single()
  return data?.data || null
}
async function upsertSubmission(date, player, sdata) {
  const id = `${date}::${player}`
  await supabase.from('submissions').upsert({ id, date, player, data: sdata })
}
async function getAllSubmissions() {
  const { data } = await supabase.from('submissions').select('date, player, data')
  return data || []
}

function calcPoints(sub, reveal) {
  if (!reveal?.hc_revealed) return null
  const actualA = parseInt(reveal.actual_a)
  const actualB = parseInt(reveal.actual_b)
  const pickedA = parseInt(sub.scoreA)
  const pickedB = parseInt(sub.scoreB)
  if (pickedA === actualA && pickedB === actualB) return 5
  const actualResult = actualA > actualB ? 'A' : actualB > actualA ? 'B' : 'Draw'
  const pickedResult = pickedA > pickedB ? 'A' : pickedB > pickedA ? 'B' : 'Draw'
  return actualResult === pickedResult ? 2 : 0
}

const Card = ({ children, style, accent }) => (
  <div style={{
    background: C.surface, border: `1px solid ${accent || C.border}`,
    borderRadius: 12, padding: 20, ...style
  }}>{children}</div>
)

const Btn = ({ children, onClick, color, ghost, small, disabled }) => (
  <button onClick={disabled ? undefined : onClick} style={{
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: ghost ? 'transparent' : (color || C.white),
    color: ghost ? (color || C.muted) : C.bg,
    border: `1px solid ${ghost ? (color || C.border) : 'transparent'}`,
    borderRadius: 8, fontWeight: 600,
    padding: small ? '5px 12px' : '10px 20px',
    fontSize: small ? 12 : 14, opacity: disabled ? .4 : 1,
    transition: 'all .15s',
  }}>{children}</button>
)

const ScoreInput = ({ value, onChange, disabled }) => (
  <input
    type="number" min="0" max="20" value={value}
    onChange={e => onChange(e.target.value)}
    disabled={disabled}
    style={{
      width: 64, height: 56, textAlign: 'center', fontSize: 28,
      fontFamily: "'Syne', sans-serif", fontWeight: 700,
      background: C.bg, border: `2px solid ${C.border}`,
      borderRadius: 10, color: C.white, outline: 'none',
      MozAppearance: 'textfield',
    }}
  />
)

const TextInput = ({ value, onChange, placeholder, type = 'text', multiline }) => {
  const s = {
    background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
    padding: '9px 12px', color: C.white, fontSize: 14, width: '100%', outline: 'none',
    resize: multiline ? 'vertical' : undefined,
  }
  return multiline
    ? <textarea style={{ ...s, minHeight: 70 }} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    : <input style={s} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
}

const Label = ({ children }) => (
  <p style={{ fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>{children}</p>
)

function AdminPanel({ onBack }) {
  const empty = { date: TODAY, teamA: '', teamB: '', groupLabel: '' }
  const [form, setForm] = useState(empty)
  const [questions, setQuestions] = useState([])
  const [reveals, setReveals] = useState({})
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    const qs = await getAllQuestions()
    setQuestions(qs)
    const rm = {}
    for (const q of qs) { const r = await getReveal(q.date); if (r) rm[q.date] = r }
    setReveals(rm)
  }, [])

  useEffect(() => { load() }, [load])

  const save = async () => {
    await upsertQuestion(form.date, form)
    setSaved(true); setTimeout(() => setSaved(false), 2000); load()
  }

  const reveal = async (date) => {
    if (scoreA === '' || scoreB === '') return
    await upsertReveal(date, true, scoreA, scoreB)
    setScoreA(''); setScoreB(''); load()
  }

  const del = async (date) => { await deleteQuestion(date); load() }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 24 }} className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Btn ghost small
