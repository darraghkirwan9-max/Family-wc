import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase.js'

const FAMILIES = [
  { name: 'Kirwan', color: '#E63946', emoji: '🔴' },
  { name: "O'Rourke", color: '#2A9D8F', emoji: '🟢' },
  { name: 'Carragher', color: '#E9C46A', emoji: '🟡' },
]

const C = {
  bg: '#0D1117', surface: '#161B22', border: '#30363D',
  white: '#F0F6FC', muted: '#8B949E', green: '#3FB950', red: '#F85149',
}

const TODAY = new Date().toISOString().slice(0, 10)
const ADMIN_CODE = 'kirwan2026'

const SCHEDULE = [
  { id: 'a1', date: '2026-06-11', group: 'A', teamA: 'Mexico', teamB: 'South Africa' },
  { id: 'a2', date: '2026-06-11', group: 'A', teamA: 'Korea Republic', teamB: 'Czechia' },
  { id: 'b1', date: '2026-06-12', group: 'B', teamA: 'Canada', teamB: 'Bosnia and Herzegovina' },
  { id: 'd1', date: '2026-06-12', group: 'D', teamA: 'United States', teamB: 'Paraguay' },
  { id: 'b2', date: '2026-06-13', group: 'B', teamA: 'Qatar', teamB: 'Switzerland' },
  { id: 'c1', date: '2026-06-13', group: 'C', teamA: 'Brazil', teamB: 'Morocco' },
  { id: 'c2', date: '2026-06-13', group: 'C', teamA: 'Haiti', teamB: 'Scotland' },
  { id: 'd2', date: '2026-06-13', group: 'D', teamA: 'Australia', teamB: 'Türkiye' },
  { id: 'e1', date: '2026-06-14', group: 'E', teamA: 'Germany', teamB: 'Curaçao' },
  { id: 'e2', date: '2026-06-14', group: 'E', teamA: 'Ivory Coast', teamB: 'Ecuador' },
  { id: 'f1', date: '2026-06-14', group: 'F', teamA: 'Netherlands', teamB: 'Japan' },
  { id: 'f2', date: '2026-06-14', group: 'F', teamA: 'Sweden', teamB: 'Tunisia' },
  { id: 'g1', date: '2026-06-15', group: 'G', teamA: 'Belgium', teamB: 'Egypt' },
  { id: 'g2', date: '2026-06-15', group: 'G', teamA: 'Iran', teamB: 'New Zealand' },
  { id: 'h1', date: '2026-06-15', group: 'H', teamA: 'Spain', teamB: 'Cape Verde' },
  { id: 'h2', date: '2026-06-15', group: 'H', teamA: 'Saudi Arabia', teamB: 'Uruguay' },
  { id: 'i1', date: '2026-06-16', group: 'I', teamA: 'France', teamB: 'Senegal' },
  { id: 'i2', date: '2026-06-16', group: 'I', teamA: 'Iraq', teamB: 'Norway' },
  { id: 'j1', date: '2026-06-16', group: 'J', teamA: 'Argentina', teamB: 'Algeria' },
  { id: 'j2', date: '2026-06-16', group: 'J', teamA: 'Austria', teamB: 'Jordan' },
  { id: 'k1', date: '2026-06-17', group: 'K', teamA: 'Portugal', teamB: 'DR Congo' },
  { id: 'k2', date: '2026-06-17', group: 'K', teamA: 'Uzbekistan', teamB: 'Colombia' },
  { id: 'l1', date: '2026-06-17', group: 'L', teamA: 'England', teamB: 'Croatia' },
  { id: 'l2', date: '2026-06-17', group: 'L', teamA: 'Ghana', teamB: 'Panama' },
  { id: 'a3', date: '2026-06-18', group: 'A', teamA: 'Czechia', teamB: 'South Africa' },
  { id: 'a4', date: '2026-06-18', group: 'A', teamA: 'Mexico', teamB: 'Korea Republic' },
  { id: 'b3', date: '2026-06-18', group: 'B', teamA: 'Switzerland', teamB: 'Bosnia and Herzegovina' },
  { id: 'b4', date: '2026-06-18', group: 'B', teamA: 'Canada', teamB: 'Qatar' },
  { id: 'c3', date: '2026-06-19', group: 'C', teamA: 'Scotland', teamB: 'Morocco' },
  { id: 'c4', date: '2026-06-19', group: 'C', teamA: 'Brazil', teamB: 'Haiti' },
  { id: 'd3', date: '2026-06-19', group: 'D', teamA: 'United States', teamB: 'Australia' },
  { id: 'd4', date: '2026-06-19', group: 'D', teamA: 'Türkiye', teamB: 'Paraguay' },
  { id: 'e3', date: '2026-06-20', group: 'E', teamA: 'Germany', teamB: 'Ivory Coast' },
  { id: 'e4', date: '2026-06-20', group: 'E', teamA: 'Ecuador', teamB: 'Curaçao' },
  { id: 'f3', date: '2026-06-20', group: 'F', teamA: 'Netherlands', teamB: 'Sweden' },
  { id: 'f4', date: '2026-06-20', group: 'F', teamA: 'Tunisia', teamB: 'Japan' },
  { id: 'g3', date: '2026-06-21', group: 'G', teamA: 'Belgium', teamB: 'Iran' },
  { id: 'g4', date: '2026-06-21', group: 'G', teamA: 'New Zealand', teamB: 'Egypt' },
  { id: 'h3', date: '2026-06-21', group: 'H', teamA: 'Spain', teamB: 'Saudi Arabia' },
  { id: 'h4', date: '2026-06-21', group: 'H', teamA: 'Uruguay', teamB: 'Cape Verde' },
  { id: 'i3', date: '2026-06-22', group: 'I', teamA: 'France', teamB: 'Iraq' },
  { id: 'i4', date: '2026-06-22', group: 'I', teamA: 'Norway', teamB: 'Senegal' },
  { id: 'j3', date: '2026-06-22', group: 'J', teamA: 'Argentina', teamB: 'Austria' },
  { id: 'j4', date: '2026-06-22', group: 'J', teamA: 'Jordan', teamB: 'Algeria' },
  { id: 'k3', date: '2026-06-23', group: 'K', teamA: 'Portugal', teamB: 'Uzbekistan' },
  { id: 'k4', date: '2026-06-23', group: 'K', teamA: 'Colombia', teamB: 'DR Congo' },
  { id: 'l3', date: '2026-06-23', group: 'L', teamA: 'England', teamB: 'Ghana' },
  { id: 'l4', date: '2026-06-23', group: 'L', teamA: 'Panama', teamB: 'Croatia' },
  { id: 'a5', date: '2026-06-24', group: 'A', teamA: 'Czechia', teamB: 'Mexico' },
  { id: 'a6', date: '2026-06-24', group: 'A', teamA: 'South Africa', teamB: 'Korea Republic' },
  { id: 'b5', date: '2026-06-24', group: 'B', teamA: 'Switzerland', teamB: 'Canada' },
  { id: 'b6', date: '2026-06-24', group: 'B', teamA: 'Bosnia and Herzegovina', teamB: 'Qatar' },
  { id: 'c5', date: '2026-06-24', group: 'C', teamA: 'Scotland', teamB: 'Brazil' },
  { id: 'c6', date: '2026-06-24', group: 'C', teamA: 'Morocco', teamB: 'Haiti' },
  { id: 'd5', date: '2026-06-25', group: 'D', teamA: 'Türkiye', teamB: 'United States' },
  { id: 'd6', date: '2026-06-25', group: 'D', teamA: 'Paraguay', teamB: 'Australia' },
  { id: 'e5', date: '2026-06-25', group: 'E', teamA: 'Curaçao', teamB: 'Ivory Coast' },
  { id: 'e6', date: '2026-06-25', group: 'E', teamA: 'Ecuador', teamB: 'Germany' },
  { id: 'f5', date: '2026-06-25', group: 'F', teamA: 'Japan', teamB: 'Sweden' },
  { id: 'f6', date: '2026-06-25', group: 'F', teamA: 'Tunisia', teamB: 'Netherlands' },
  { id: 'g5', date: '2026-06-26', group: 'G', teamA: 'Egypt', teamB: 'Iran' },
  { id: 'g6', date: '2026-06-26', group: 'G', teamA: 'New Zealand', teamB: 'Belgium' },
  { id: 'h5', date: '2026-06-26', group: 'H', teamA: 'Cape Verde', teamB: 'Saudi Arabia' },
  { id: 'h6', date: '2026-06-26', group: 'H', teamA: 'Uruguay', teamB: 'Spain' },
  { id: 'i5', date: '2026-06-26', group: 'I', teamA: 'Norway', teamB: 'France' },
  { id: 'i6', date: '2026-06-26', group: 'I', teamA: 'Senegal', teamB: 'Iraq' },
  { id: 'j5', date: '2026-06-27', group: 'J', teamA: 'Jordan', teamB: 'Argentina' },
  { id: 'j6', date: '2026-06-27', group: 'J', teamA: 'Algeria', teamB: 'Austria' },
  { id: 'k5', date: '2026-06-27', group: 'K', teamA: 'Colombia', teamB: 'Portugal' },
  { id: 'k6', date: '2026-06-27', group: 'K', teamA: 'DR Congo', teamB: 'Uzbekistan' },
  { id: 'l5', date: '2026-06-27', group: 'L', teamA: 'Panama', teamB: 'England' },
  { id: 'l6', date: '2026-06-27', group: 'L', teamA: 'Ghana', teamB: 'Croatia' },
]

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Instrument+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.white}; font-family: 'Instrument Sans', sans-serif; min-height: 100vh; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
  .fade-up { animation: fadeUp .4s ease both; }
  input, textarea, button { font-family: 'Instrument Sans', sans-serif; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
`

const familyColor = (name) => FAMILIES.find(f => f.name === name)?.color || C.muted

function top3DailyAvg(allSubs, allReveals, scheduleByDate) {
  const familyTotals = {}
  FAMILIES.forEach(f => { familyTotals[f.name] = 0 })
  const dates = [...new Set(Object.keys(scheduleByDate))]
  for (const date of dates) {
    const familyDayScores = {}
    FAMILIES.forEach(f => { familyDayScores[f.name] = {} })
    for (const sub of allSubs) {
      if (sub.date !== date) continue
      const { player, data } = sub
      if (!data.family) continue
      const rev = allReveals[sub.matchId]
      if (!rev?.hc_revealed) continue
      const pts = calcPoints(data, rev)
      if (pts === null) continue
      if (!familyDayScores[data.family][player]) familyDayScores[data.family][player] = 0
      familyDayScores[data.family][player] += pts
    }
    for (const fam of FAMILIES) {
      const scores = Object.values(familyDayScores[fam.name]).sort((a, b) => b - a)
      const top3 = scores.slice(0, 3)
      familyTotals[fam.name] += top3.reduce((a, b) => a + b, 0)
    }
  }
  return familyTotals
}

function calcPoints(sub, reveal) {
  if (!reveal?.hc_revealed) return null
  const actualA = parseInt(reveal.actual_a)
  const actualB = parseInt(reveal.actual_b)
  const pickedA = parseInt(sub.scoreA)
  const pickedB = parseInt(sub.scoreB)
  if (isNaN(pickedA) || isNaN(pickedB)) return 0
  if (pickedA === actualA && pickedB === actualB) return 5
  const actualResult = actualA > actualB ? 'A' : actualB > actualA ? 'B' : 'Draw'
  const pickedResult = pickedA > pickedB ? 'A' : pickedB > pickedA ? 'B' : 'Draw'
  return actualResult === pickedResult ? 2 : 0
}

async function getReveal(matchId) {
  const { data } = await supabase.from('reveals').select('*').eq('date', matchId).single()
  return data || null
}
async function upsertReveal(matchId, actual_a, actual_b) {
  await supabase.from('reveals').upsert({ date: matchId, hc_revealed: true, match_result: 'revealed', actual_a, actual_b })
}
async function deleteReveal(matchId) {
  await supabase.from('reveals').delete().eq('date', matchId)
}
async function getAllReveals() {
  const { data } = await supabase.from('reveals').select('*')
  const map = {}
  ;(data || []).forEach(r => { map[r.date] = r })
  return map
}
async function getSubmission(matchId, player) {
  const id = `${matchId}::${player}`
  const { data } = await supabase.from('submissions').select('data').eq('id', id).single()
  return data?.data || null
}
async function upsertSubmission(matchId, player, family, scoreA, scoreB) {
  const id = `${matchId}::${player}`
  await supabase.from('submissions').upsert({ id, date: matchId, player, data: { scoreA, scoreB, family, ts: Date.now() } })
}
async function getAllSubmissions() {
  const { data } = await supabase.from('submissions').select('date, player, data')
  return (data || []).map(s => ({ matchId: s.date, player: s.player, date: s.date.split('::')[0] || s.date, data: s.data }))
}

const Card = ({ children, style, accent }) => (
  <div style={{ background: C.surface, border: `1px solid ${accent || C.border}`, borderRadius: 12, padding: 20, ...style }}>
    {children}
  </div>
)

const Btn = ({ children, onClick, color, ghost, small, disabled }) => (
  <button onClick={disabled ? undefined : onClick} style={{
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: ghost ? 'transparent' : (color || C.white),
    color: ghost ? (color || C.muted) : C.bg,
    border: `1px solid ${ghost ? (color || C.border) : 'transparent'}`,
    borderRadius: 8, fontWeight: 600,
    padding: small ? '5px 12px' : '10px 20px',
    fontSize: small ? 12 : 14, opacity: disabled ? .4 : 1, transition: 'all .15s',
  }}>{children}</button>
)

const ScoreInput = ({ value, onChange, disabled }) => (
  <input type="number" min="0" max="20" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
    style={{ width: 60, height: 52, textAlign: 'center', fontSize: 26, fontFamily: "'Syne', sans-serif", fontWeight: 700, background: C.bg, border: `2px solid ${C.border}`, borderRadius: 10, color: C.white, outline: 'none' }} />
)

const TextInput = ({ value, onChange, placeholder, type = 'text' }) => (
  <input style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.white, fontSize: 14, width: '100%', outline: 'none' }}
    type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
)
