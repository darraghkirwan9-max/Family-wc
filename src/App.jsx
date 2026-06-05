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
function MatchCard({ match, name, family, reveal, submission, onSubmit }) {
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submitted = !!submission
  const revealed = reveal?.hc_revealed
  const fColor = familyColor(family)
  const pts = submitted && revealed ? calcPoints(submission, reveal) : null

  const doSubmit = async () => {
    if (scoreA === '' || scoreB === '') return
    setSubmitting(true)
    await upsertSubmission(match.id, name, family, scoreA, scoreB)
    onSubmit({ scoreA, scoreB, family, ts: Date.now() })
    setSubmitting(false)
  }

  return (
    <Card accent={fColor + '33'} style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase' }}>Group {match.group}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 11, color: C.muted }}>✓ correct <strong style={{ color: C.white }}>+2</strong></span>
          <span style={{ fontSize: 11, color: C.muted }}>🎯 exact <strong style={{ color: C.white }}>+5</strong></span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 14 }}>
        <p style={{ fontFamily: "'Syne'", fontSize: 13, fontWeight: 700, flex: 1, textAlign: 'right', color: C.muted }}>{match.teamA}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ScoreInput value={submitted ? submission.scoreA : scoreA} onChange={setScoreA} disabled={submitted} />
          <span style={{ fontFamily: "'Syne'", fontSize: 24, fontWeight: 800, color: C.muted }}>–</span>
          <ScoreInput value={submitted ? submission.scoreB : scoreB} onChange={setScoreB} disabled={submitted} />
        </div>
        <p style={{ fontFamily: "'Syne'", fontSize: 13, fontWeight: 700, flex: 1, textAlign: 'left', color: C.muted }}>{match.teamB}</p>
      </div>
      {!submitted ? (
        <Btn onClick={doSubmit} color={fColor} disabled={scoreA === '' || scoreB === '' || submitting} small>
          {submitting ? 'Locking...' : 'Lock In'}
        </Btn>
      ) : revealed ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: C.muted, fontSize: 13 }}>Result: <strong style={{ color: C.white }}>{reveal.actual_a}–{reveal.actual_b}</strong></span>
          <span style={{ fontFamily: "'Syne'", fontWeight: 800, fontSize: 20, color: pts === 5 ? '#FFD700' : pts > 0 ? C.green : C.red }}>
            {pts === 5 ? '🎯 +5' : pts > 0 ? `+${pts}` : '+0'}
          </span>
        </div>
      ) : (
        <p style={{ color: C.muted, fontSize: 12 }}>Locked: {submission.scoreA}–{submission.scoreB} · points after match</p>
      )}
    </Card>
  )
}

function PlayerView({ name, family }) {
  const [reveals, setReveals] = useState({})
  const [submissions, setSubmissions] = useState({})
  const [loading, setLoading] = useState(true)
  const todayMatches = SCHEDULE.filter(m => m.date === TODAY)

  const load = useCallback(async () => {
    const allRevs = await getAllReveals()
    setReveals(allRevs)
    const subs = {}
    for (const m of todayMatches) {
      const s = await getSubmission(m.id, name)
      if (s) subs[m.id] = s
    }
    setSubmissions(subs)
    setLoading(false)
  }, [name])

  useEffect(() => { load() }, [load])
  useEffect(() => { const t = setInterval(load, 15000); return () => clearInterval(t) }, [load])

  if (loading) return <p style={{ color: C.muted, textAlign: 'center', padding: 40 }}>Loading...</p>

  if (!todayMatches.length) return (
    <Card style={{ textAlign: 'center', padding: 48 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
      <p style={{ color: C.muted }}>No matches today.</p>
    </Card>
  )

  return (
    <div className="fade-up">
      <p style={{ fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
        {todayMatches.length} {todayMatches.length === 1 ? 'match' : 'matches'} today
      </p>
      {todayMatches.map(match => (
        <MatchCard key={match.id} match={match} name={name} family={family}
          reveal={reveals[match.id]} submission={submissions[match.id]}
          onSubmit={(s) => setSubmissions(prev => ({ ...prev, [match.id]: s }))} />
      ))}
    </div>
  )
}

function AdminPanel({ onBack }) {
  const [reveals, setReveals] = useState({})
  const [scores, setScores] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(TODAY)

  const load = useCallback(async () => {
    const r = await getAllReveals()
    setReveals(r)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const reveal = async (matchId) => {
    const s = scores[matchId] || {}
    if (s.a === undefined || s.b === undefined || s.a === '' || s.b === '') return
    await upsertReveal(matchId, s.a, s.b)
    load()
  }

  const unreveal = async (matchId) => {
    await deleteReveal(matchId)
    load()
  }

  const setScore = (matchId, side, val) => {
    setScores(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || {}), [side]: val } }))
  }

  const filteredMatches = filter ? SCHEDULE.filter(m => m.date === filter) : SCHEDULE
  const dates = [...new Set(SCHEDULE.map(m => m.date))].sort()

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 24 }} className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Btn ghost small onClick={onBack}>← Back</Btn>
        <span style={{ fontFamily: "'Syne'", fontSize: 22, fontWeight: 800 }}>Admin — Reveal Results</span>
      </div>
      <div style={{ marginBottom: 20, overflowX: 'auto', display: 'flex', gap: 6, paddingBottom: 4 }}>
        {dates.map(d => (
          <button key={d} onClick={() => setFilter(d)} style={{
            padding: '5px 10px', borderRadius: 6, border: `1px solid ${filter === d ? C.white : C.border}`,
            background: filter === d ? C.white : 'transparent', color: filter === d ? C.bg : C.muted,
            fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
          }}>{d.slice(5)}</button>
        ))}
      </div>
      {loading ? <p style={{ color: C.muted }}>Loading...</p> : filteredMatches.map(match => {
        const rev = reveals[match.id]
        const s = scores[match.id] || {}
        return (
          <Card key={match.id} style={{ marginBottom: 10, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <span style={{ fontSize: 11, color: C.muted, marginRight: 8 }}>Group {match.group}</span>
                <span style={{ fontWeight: 600 }}>{match.teamA} vs {match.teamB}</span>
              </div>
              {rev?.hc_revealed ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: C.green, fontWeight: 700 }}>{rev.actual_a}–{rev.actual_b} ✓</span>
                  <Btn ghost small color={C.red} onClick={() => unreveal(match.id)}>Undo</Btn>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="number" min="0" max="20" value={s.a || ''} onChange={e => setScore(match.id, 'a', e.target.value)}
                    placeholder="0" style={{ width: 44, padding: '4px 6px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.white, fontSize: 14, textAlign: 'center' }} />
                  <span style={{ color: C.muted }}>–</span>
                  <input type="number" min="0" max="20" value={s.b || ''} onChange={e => setScore(match.id, 'b', e.target.value)}
                    placeholder="0" style={{ width: 44, padding: '4px 6px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.white, fontSize: 14, textAlign: 'center' }} />
                  <Btn small color={C.green} onClick={() => reveal(match.id)} disabled={s.a === '' || s.b === '' || s.a === undefined || s.b === undefined}>
                    Reveal
                  </Btn>
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function Leaderboard() {
  const [board, setBoard] = useState([])
  const [familyTotals, setFamilyTotals] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [allSubs, allRevs] = await Promise.all([getAllSubmissions(), getAllReveals()])
      const scheduleByDate = {}
      SCHEDULE.forEach(m => {
        if (!scheduleByDate[m.date]) scheduleByDate[m.date] = []
        scheduleByDate[m.date].push(m)
      })
      const scores = {}
      for (const sub of allSubs) {
        const { matchId, player, data } = sub
        if (!scores[player]) scores[player] = { total: 0, exact: 0, correct: 0, entered: 0, family: data.family || null }
        scores[player].entered++
        if (data.family) scores[player].family = data.family
        const rev = allRevs[matchId]
        if (rev?.hc_revealed) {
          const pts = calcPoints(data, rev)
          if (pts !== null) {
            scores[player].total += pts
            if (pts === 5) scores[player].exact++
            else if (pts === 2) scores[player].correct++
          }
        }
      }
      const sorted = Object.entries(scores)
        .map(([name, s]) => ({ name, ...s }))
        .sort((a, b) => b.total - a.total || b.exact - a.exact)
      setBoard(sorted)
      const ft = top3DailyAvg(allSubs, allRevs, scheduleByDate)
      setFamilyTotals(ft)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p style={{ color: C.muted, textAlign: 'center', padding: 40 }}>Loading...</p>

  const sortedFamilies = [...FAMILIES].sort((a, b) => (familyTotals[b.name] || 0) - (familyTotals[a.name] || 0))
  const medals = ['🥇', '🥈', '🥉']
  const hasScores = sortedFamilies.some(f => (familyTotals[f.name] || 0) > 0)

  return (
    <div className="fade-up">
      <p style={{ fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Family Standings</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
        {sortedFamilies.map((f, i) => {
          const score = familyTotals[f.name] || 0
          const isLeading = i === 0 && hasScores
          return (
            <div key={f.name} style={{
              background: isLeading ? f.color + '18' : C.surface,
              border: `2px solid ${isLeading ? f.color : C.border}`,
              borderRadius: 12, padding: '14px 10px', textAlign: 'center', position: 'relative'
            }}>
              {isLeading && (
                <div style={{ position: 'absolute', top: -10



