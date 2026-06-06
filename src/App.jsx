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

const GROUP_SCHEDULE = [
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

function top3DailyTotal(allSubs, allReveals) {
  const familyTotals = {}
  FAMILIES.forEach(f => { familyTotals[f.name] = 0 })
  const dates = [...new Set(allSubs.map(s => s.date))]
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
      familyTotals[fam.name] += scores.slice(0, 3).reduce((a, b) => a + b, 0)
    }
  }
  return familyTotals
}

async function getAllReveals() {
  const { data } = await supabase.from('reveals').select('*')
  const map = {}
  ;(data || []).forEach(r => { map[r.date] = r })
  return map
}
async function upsertReveal(matchId, actual_a, actual_b) {
  await supabase.from('reveals').upsert({ date: matchId, hc_revealed: true, match_result: 'revealed', actual_a, actual_b })
}
async function deleteReveal(matchId) {
  await supabase.from('reveals').delete().eq('date', matchId)
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
  return (data || []).map(s => ({ matchId: s.date, player: s.player, date: s.date, data: s.data }))
}
async function getExtraMatches() {
  const { data } = await supabase.from('questions').select('date, data').order('date', { ascending: true })
  return (data || []).map(q => ({ ...q.data, id: q.date, isKnockout: true }))
}
async function upsertExtraMatch(match) {
  await supabase.from('questions').upsert({ date: match.id, data: match })
}
async function deleteExtraMatch(id) {
  await supabase.from('questions').delete().eq('date', id)
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
    style={{ width: 60, height: 52, textAlign: 'center', fontSize: 26, fontFamily: "'Syne',sans-serif", fontWeight: 700, background: C.bg, border: `2px solid ${C.border}`, borderRadius: 10, color: C.white, outline: 'none' }} />
)
const TextInput = ({ value, onChange, placeholder, type = 'text' }) => (
  <input style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.white, fontSize: 14, width: '100%', outline: 'none' }}
    type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  
)function MatchCard({ match, name, family, reveal, submission, onSubmit }) {
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

 const label = match.isKnockout ? (match.round || 'Knockout') : `Group ${match.group}`

 return (
   <Card accent={fColor + '33'} style={{ marginBottom: 14 }}>
     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
       <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
         <span style={{ fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</span>
         <span style={{ fontSize: 11, color: C.muted }}>· {match.date}</span>
       </div>
       <div style={{ display: 'flex', gap: 8 }}>
         <span style={{ fontSize: 11, color: C.muted }}>✓ <strong style={{ color: C.white }}>+2</strong></span>
         <span style={{ fontSize: 11, color: C.muted }}>🎯 <strong style={{ color: C.white }}>+5</strong></span>
       </div>
     </div>
     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 14 }}>
       <p style={{ fontFamily: "'Syne'", fontSize: 13, fontWeight: 700, flex: 1, textAlign: 'right', color: C.muted }}>{match.teamA}</p>
       <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
         <ScoreInput value={submitted ? submission.scoreA : scoreA} onChange={setScoreA} disabled={submitted} />
         <span style={{ fontFamily: "'Syne'", fontSize: 24, fontWeight: 800, color: C.muted }}>–</span>
         <ScoreInput value={submitted ? submission.scoreB : scoreB} onChange={setScoreB} disabled={submitted} />
       </div>
       <p style={{ fontFamily: "'Syne'", fontSize: 13, fontWeight: 700, flex: 1, color: C.muted }}>{match.teamB}</p>
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
 const [allMatches, setAllMatches] = useState([])
 const [reveals, setReveals] = useState({})
 const [submissions, setSubmissions] = useState({})
 const [loading, setLoading] = useState(true)
 const [visibleCount, setVisibleCount] = useState(3)

 const load = useCallback(async () => {
   const [extra, allRevs] = await Promise.all([getExtraMatches(), getAllReveals()])
   const combined = [...GROUP_SCHEDULE, ...extra].sort((a, b) => a.date.localeCompare(b.date))
   setAllMatches(combined)
   setReveals(allRevs)
   const subs = {}
   for (const m of combined) {
     const s = await getSubmission(m.id, name)
     if (s) subs[m.id] = s
   }
   setSubmissions(subs)
   setLoading(false)
 }, [name])

 useEffect(() => { load() }, [load])
 useEffect(() => { const t = setInterval(load, 30000); return () => clearInterval(t) }, [load])

 if (loading) return <p style={{ color: C.muted, textAlign: 'center', padding: 40 }}>Loading...</p>

 const upcoming = allMatches.filter(m => !reveals[m.id]?.hc_revealed)
 const visible = upcoming.slice(0, visibleCount)
 const hasMore = upcoming.length > visibleCount
 const recentRevealed = allMatches.filter(m => reveals[m.id]?.hc_revealed).slice(-3).reverse()

 if (!upcoming.length && !recentRevealed.length) return (
   <Card style={{ textAlign: 'center', padding: 48 }}>
     <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
     <p style={{ color: C.muted }}>Tournament complete!</p>
   </Card>
 )

 return (
   <div className="fade-up">
     {visible.length > 0 && (
       <>
         <p style={{ fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
           Upcoming — predict now
         </p>
         {visible.map(match => (
           <MatchCard key={match.id} match={match} name={name} family={family}
             reveal={reveals[match.id]} submission={submissions[match.id]}
             onSubmit={(s) => setSubmissions(prev => ({ ...prev, [match.id]: s }))} />
         ))}
         {hasMore && (
           <div style={{ textAlign: 'center', marginBottom: 24 }}>
             <Btn ghost onClick={() => setVisibleCount(v => v + 3)}>
               Next {Math.min(3, upcoming.length - visibleCount)} matches →
             </Btn>
           </div>
         )}
       </>
     )}
     {recentRevealed.length > 0 && (
       <>
         <p style={{ fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16, marginTop: 8 }}>
           Recent results
         </p>
         {recentRevealed.map(match => (
           <MatchCard key={match.id} match={match} name={name} family={family}
             reveal={reveals[match.id]} submission={submissions[match.id]}
             onSubmit={(s) => setSubmissions(prev => ({ ...prev, [match.id]: s }))} />
         ))}
       </>
     )}
   </div>
 )
}

function ScheduleTab() {
 const [extra, setExtra] = useState([])
 const [reveals, setReveals] = useState({})
 const [loading, setLoading] = useState(true)
 const [openDate, setOpenDate] = useState(TODAY)

 useEffect(() => {
   const load = async () => {
     const [ex, revs] = await Promise.all([getExtraMatches(), getAllReveals()])
     setExtra(ex); setReveals(revs); setLoading(false)
   }
   load()
 }, [])

 const allMatches = [...GROUP_SCHEDULE, ...extra].sort((a, b) => a.date.localeCompare(b.date))
 const dates = [...new Set(allMatches.map(m => m.date))]

 if (loading) return <p style={{ color: C.muted, textAlign: 'center', padding: 40 }}>Loading...</p>

 return (
   <div className="fade-up">
     {dates.map(date => {
       const matches = allMatches.filter(m => m.date === date)
       const isOpen = openDate === date
       const isToday = date === TODAY
       const isPast = date < TODAY
       return (
         <div key={date} style={{ marginBottom: 8 }}>
           <button onClick={() => setOpenDate(isOpen ? null : date)} style={{
             width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
             padding: '10px 14px', background: isToday ? C.white + '11' : C.surface,
             border: `1px solid ${isToday ? C.white + '44' : C.border}`,
             borderRadius: 8, cursor: 'pointer', color: isPast ? C.muted : C.white
           }}>
             <span style={{ fontFamily: "'Syne'", fontWeight: 700, fontSize: 14 }}>
               {isToday ? '📅 Today — ' : ''}{date}
             </span>
             <span style={{ fontSize: 12, color: C.muted }}>{matches.length} matches {isOpen ? '▲' : '▼'}</span>
           </button>
           {isOpen && (
             <div style={{ paddingTop: 8 }}>
               {matches.map(m => {
                 const rev = reveals[m.id]
                 return (
                   <div key={m.id} style={{
                     display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                     padding: '10px 14px', background: C.surface, borderRadius: 8,
                     border: `1px solid ${C.border}`, marginBottom: 6
                   }}>
                     <div>
                       <span style={{ fontSize: 11, color: C.muted, marginRight: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                         {m.isKnockout ? (m.round || 'KO') : `Grp ${m.group}`}
                       </span>
                       <span style={{ fontWeight: 600 }}>{m.teamA} vs {m.teamB}</span>
                     </div>
                     {rev?.hc_revealed ? (
                       <span style={{ fontFamily: "'Syne'", fontWeight: 800, color: C.green }}>{rev.actual_a}–{rev.actual_b}</span>
                     ) : (
                       <span style={{ fontSize: 12, color: C.muted }}>{date >= TODAY ? 'Upcoming' : 'TBC'}</span>
                     )}
                   </div>
                 )
               })}
             </div>
           )}
         </div>
       )
     })}
   </div>
 )
}

function AdminPanel({ onBack }) {
 const [reveals, setReveals] = useState({})
 const [extra, setExtra] = useState([])
 const [scores, setScores] = useState({})
 const [loading, setLoading] = useState(true)
 const [filter, setFilter] = useState(TODAY)
 const [showAddForm, setShowAddForm] = useState(false)
 const [newMatch, setNewMatch] = useState({ date: '', teamA: '', teamB: '', round: 'Round of 32' })
 const [saving, setSaving] = useState(false)

 const load = useCallback(async () => {
   const [revs, ex] = await Promise.all([getAllReveals(), getExtraMatches()])
   setReveals(revs); setExtra(ex); setLoading(false)
 }, [])

 useEffect(() => { load() }, [load])

 const allMatches = [...GROUP_SCHEDULE, ...extra].sort((a, b) => a.date.localeCompare(b.date))
 const dates = [...new Set(allMatches.map(m => m.date))].sort()
 const filteredMatches = filter ? allMatches.filter(m => m.date === filter) : allMatches

 const reveal = async (matchId) => {
   const s = scores[matchId] || {}
   if (s.a === undefined || s.b === undefined || s.a === '' || s.b === '') return
   await upsertReveal(matchId, s.a, s.b); load()
 }
 const unreveal = async (matchId) => { await deleteReveal(matchId); load() }
 const setScore = (matchId, side, val) => {
   setScores(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || {}), [side]: val } }))
 }
 const addMatch = async () => {
   if (!newMatch.date || !newMatch.teamA || !newMatch.teamB) return
   setSaving(true)
   const id = `ko_${newMatch.date}_${newMatch.teamA}_${newMatch.teamB}`.replace(/\s/g, '_').toLowerCase()
   await upsertExtraMatch({ ...newMatch, id, isKnockout: true })
   setNewMatch({ date: '', teamA: '', teamB: '', round: 'Round of 32' })
   setShowAddForm(false); setSaving(false); load()
 }
 const delExtra = async (id) => { await deleteExtraMatch(id); load() }
 const rounds = ['Round of 32', 'Round of 16', 'Quarter-final', 'Semi-final', 'Third place', 'Final']

 return (
   <div style={{ maxWidth: 640, margin: '0 auto', padding: 24 }} className="fade-up">
     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
         <Btn ghost small onClick={onBack}>← Back</Btn>
         <span style={{ fontFamily: "'Syne'", fontSize: 20, fontWeight: 800 }}>Admin</span>
       </div>
       <Btn small color={C.green} onClick={() => setShowAddForm(v => !v)}>
         {showAddForm ? 'Cancel' : '+ Add Match'}
       </Btn>
     </div>

     {showAddForm && (
       <Card style={{ marginBottom: 20 }}>
         <p style={{ fontFamily: "'Syne'", fontWeight: 700, marginBottom: 14 }}>Add Knockout Match</p>
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
           <div>
             <p style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>DATE</p>
             <TextInput type="date" value={newMatch.date} onChange={v => setNewMatch(m => ({ ...m, date: v }))} />
           </div>
           <div>
             <p style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>ROUND</p>
             <select value={newMatch.round} onChange={e => setNewMatch(m => ({ ...m, round: e.target.value }))}
               style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', color: C.white, fontSize: 14, width: '100%' }}>
               {rounds.map(r => <option key={r} value={r}>{r}</option>)}
             </select>
           </div>
           <div>
             <p style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>TEAM A</p>
             <TextInput value={newMatch.teamA} onChange={v => setNewMatch(m => ({ ...m, teamA: v }))} placeholder="e.g. Argentina" />
           </div>
           <div>
             <p style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>TEAM B</p>
             <TextInput value={newMatch.teamB} onChange={v => setNewMatch(m => ({ ...m, teamB: v }))} placeholder="e.g. France" />
           </div>
         </div>
         <Btn color={C.green} onClick={addMatch} disabled={!newMatch.date || !newMatch.teamA || !newMatch.teamB || saving}>
           {saving ? 'Saving...' : 'Save Match'}
         </Btn>
       </Card>
     )}

     <div style={{ marginBottom: 16, overflowX: 'auto', display: 'flex', gap: 6, paddingBottom: 4 }}>
       {dates.map(d => (
         <button key={d} onClick={() => setFilter(d)} style={{
           padding: '5px 10px', borderRadius: 6,
           border: `1px solid ${filter === d ? C.white : C.border}`,
           background: filter === d ? C.white : 'transparent',
           color: filter === d ? C.bg : C.muted,
           fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
         }}>{d.slice(5)}</button>
       ))}
     </div>

     {loading ? <p style={{ color: C.muted }}>Loading...</p> : filteredMatches.map(match => {
       const rev = reveals[match.id]
       const s = scores[match.id] || {}
       const label = match.isKnockout ? (match.round || 'KO') : `Group ${match.group}`
       return (
         <Card key={match.id} style={{ marginBottom: 10, padding: '14px 16px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               <span style={{ fontSize: 11, color: match.isKnockout ? C.green : C.muted, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
               <span style={{ fontWeight: 600 }}>{match.teamA} vs {match.teamB}</span>
               {match.isKnockout && <Btn ghost small color={C.red} onClick={() => delExtra(match.id)}>✕</Btn>}
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
     setFamilyTotals(top3DailyTotal(allSubs, allRevs))
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
             {isLeading && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: f.color, color: '#000', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, whiteSpace: 'nowrap' }}>LEADING</div>}
             <div style={{ fontSize: 20, marginBottom: 4 }}>{f.emoji}</div>
             <p style={{ fontSize: 12, color: f.color, fontWeight: 600, marginBottom: 4 }}>{f.name}</p>
             <p style={{ fontFamily: "'Syne'", fontSize: 28, fontWeight: 800, color: isLeading ? f.color : C.white }}>{score}</p>
             <p style={{ fontSize: 10, color: C.muted }}>top 3 daily pts</p>
           </div>
         )
       })}
     </div>
     <p style={{ fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Individual</p>
     {!board.length ? (
       <Card style={{ textAlign: 'center', padding: 40 }}>
         <p style={{ fontSize: 36, marginBottom: 8 }}>🏆</p>
         <p style={{ color: C.muted }}>No entries yet!</p>
       </Card>
     ) : board.map((p, i) => {
       const fColor = p.family ? familyColor(p.family) : C.muted
       return (
         <div key={p.name} style={{
           display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', marginBottom: 8, borderRadius: 10,
           background: i === 0 ? '#FFD70011' : C.surface,
           border: `1px solid ${i === 0 ? '#FFD70044' : C.border}`,
           borderLeft: `3px solid ${fColor}`,
         }}>
           <span style={{ fontSize: 18, width: 26, textAlign: 'center' }}>{medals[i] || i + 1}</span>
           <div style={{ flex: 1 }}>
             <p style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</p>
             <p style={{ fontSize: 12, color: C.muted }}>
               <span style={{ color: fColor }}>{p.family || '—'}</span>
               {' · '}🎯 {p.exact} · ✓ {p.correct} · {p.entered} predictions
             </p>
           </div>
           <div style={{ fontFamily: "'Syne'", fontSize: 28, fontWeight: 800, color: i === 0 ? '#FFD700' : C.white }}>{p.total}</div>
         </div>
       )
     })}
   </div>
 )
}

export default function App() {
 const [view, setView] = useState('play')
 const [name, setName] = useState(() => localStorage.getItem('fwc_name') || '')
 const [family, setFamily] = useState(() => localStorage.getItem('fwc_family') || '')
 const [nameInput, setNameInput] = useState('')
 const [familyInput, setFamilyInput] = useState('')
 const [adminCode, setAdminCode] = useState('')
 const [adminUnlocked, setAdminUnlocked] = useState(false)
 const [showAdmin, setShowAdmin] = useState(false)
 const [switching, setSwitching] = useState(false)

 const enter = () => {
   if (!nameInput.trim() || !familyInput) return
   localStorage.setItem('fwc_name', nameInput.trim())
   localStorage.setItem('fwc_family', familyInput)
   setName(nameInput.trim()); setFamily(familyInput)
   setSwitching(false); setNameInput(''); setFamilyInput('')
 }
 const switchUser = () => { setSwitching(true); setNameInput(''); setFamilyInput('') }
 const tryAdmin = () => { if (adminCode === ADMIN_CODE) { setAdminUnlocked(true); setShowAdmin(true) } }
 const showJoinGate = view === 'play' && (!name || !family || switching)

 if (showAdmin && adminUnlocked) return (
   <>
     <style>{globalCSS}</style>
     <Header name={name} family={family} isAdmin onSwitch={switchUser} onAdminClick={() => {}} />
     <AdminPanel onBack={() => setShowAdmin(false)} />
   </>
 )

 return (
   <>
     <style>{globalCSS}</style>
     <Header name={name} family={family} isAdmin={adminUnlocked} onSwitch={switchUser} onAdminClick={() => setShowAdmin(true)} />
     <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
       <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: C.surface, borderRadius: 10, padding: 4, border: `1px solid ${C.border}` }}>
         {[['play', '⚽ Predict'], ['schedule', '📅 Schedule'], ['board', '🏆 Leaderboard']].map(([v, label]) => (
           <button key={v} onClick={() => { setView(v); setSwitching(false) }} style={{
             flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
             background: view === v ? C.white : 'transparent',
             color: view === v ? C.bg : C.muted,
             fontFamily: "'Instrument Sans'", fontWeight: 600, fontSize: 13,
             cursor: 'pointer', transition: 'all .15s'
           }}>{label}</button>
         ))}
       </div>

       {showJoinGate && (
         <Card style={{ textAlign: 'center', padding: 40 }} className="fade-up">
           <div style={{ fontSize: 48, marginBottom: 16 }}>⚽</div>
           <p style={{ fontFamily: "'Syne'", fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
             {switching ? 'Switch Player' : 'Join the Challenge'}
           </p>
           <p style={{ color: C.muted, fontSize: 14, marginBottom: 28 }}>Pick your family and enter your name</p>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
             {FAMILIES.map(f => (
               <button key={f.name} onClick={() => setFamilyInput(f.name)} style={{
                 padding: '14px 8px', borderRadius: 10, cursor: 'pointer',
                 fontFamily: "'Instrument Sans'", fontWeight: 600, fontSize: 13,
                 border: `2px solid ${familyInput === f.name ? f.color : C.border}`,
                 background: familyInput === f.name ? f.color + '22' : 'transparent',
                 color: familyInput === f.name ? f.color : C.muted, transition: 'all .15s'
               }}>
                 <div style={{ fontSize: 20, marginBottom: 4 }}>{f.emoji}</div>
                 {f.name}
               </button>
             ))}
           </div>
           <div style={{ display: 'flex', gap: 10, maxWidth: 280, margin: '0 auto 12px' }}>
             <TextInput value={nameInput} onChange={setNameInput} placeholder="Your name" />
             <Btn onClick={enter} color={familyInput ? familyColor(familyInput) : C.white} disabled={!nameInput.trim() || !familyInput}>Go</Btn>
           </div>
           {switching && <button onClick={() => setSwitching(false)} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>Cancel</button>}
         </Card>
       )}

       {view === 'play' && name && family && !switching && <PlayerView name={name} family={family} />}
       {view === 'schedule' && <ScheduleTab />}
       {view === 'board' && <Leaderboard />}

       <div style={{ marginTop: 48, paddingTop: 20, borderTop: `1px solid ${C.border}`, textAlign: 'center' }}>
         {!adminUnlocked ? (
           <div style={{ display: 'flex', gap: 8, justifyContent: 'center', maxWidth: 220, margin: '0 auto' }}>
             <TextInput type="password" value={adminCode} onChange={setAdminCode} placeholder="Admin code" />
             <Btn ghost onClick={tryAdmin}>→</Btn>
           </div>
         ) : (
           <Btn ghost onClick={() => setShowAdmin(true)}>Admin →</Btn>
         )}
       </div>
     </div>
   </>
 )
}

function Header({ name, family, isAdmin, onSwitch, onAdminClick }) {
 const fColor = family ? familyColor(family) : C.muted
 return (
   <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
     <div>
       <p style={{ fontFamily: "'Syne'", fontSize: 20, fontWeight: 800, lineHeight: 1 }}>⚽ World Cup 2026</p>
       <p style={{ fontSize: 11, color: C.muted, letterSpacing: 1 }}>FAMILY PREDICTOR</p>
     </div>
     <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
       {name && (
         <button onClick={onSwitch} style={{ background: fColor + '22', color: fColor, border: `1px solid ${fColor}44`, borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
           {name} <span style={{ opacity: .6, fontSize: 10 }}>▾</span>
         </button>
       )}
       {isAdmin && (
         <button onClick={onAdminClick} style={{ background: '#F8514922', color: '#F85149', border: '1px solid #F8514944', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase' }}>Admin</button>
       )}
     </div>
   </div>
 )
}



