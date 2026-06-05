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
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .6; } }
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

// ── Supabase ────────────────────────────────────────────────────────────────
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

function calcPoints(sub, reveal, question) {
  if (!reveal?.hc_revealed) return null
  const actualA = parseInt(reveal.actual_a)
  const actualB = parseInt(reveal.actual_b)
  const pickedA = parseInt(sub.scoreA)
  const pickedB = parseInt(sub.scoreB)
  let pts = 0
  // Exact score: +5
  if (pickedA === actualA && pickedB === actualB) return 5
  // Correct result: +2
  const actualResult = actualA > actualB ? 'A' : actualB > actualA ? 'B' : 'Draw'
  const pickedResult = pickedA > pickedB ? 'A' : pickedB > pickedA ? 'B' : 'Draw'
  if (actualResult === pickedResult) pts += 2
  return pts
}

// ── UI Primitives ───────────────────────────────────────────────────────────
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

// ── Admin ────────────────────────────────────────────────────────────────────
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
        <Btn ghost small onClick={onBack}>← Back</Btn>
        <span style={{ fontFamily: "'Syne'", fontSize: 22, fontWeight: 800 }}>Admin Panel</span>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <p style={{ fontFamily: "'Syne'", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Add Match</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div><Label>Date</Label><TextInput type="date" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} /></div>
          <div><Label>Label</Label><TextInput value={form.groupLabel} onChange={v => setForm(f => ({ ...f, groupLabel: v }))} placeholder="Group A" /></div>
          <div><Label>Team A</Label><TextInput value={form.teamA} onChange={v => setForm(f => ({ ...f, teamA: v }))} placeholder="Brazil" /></div>
          <div><Label>Team B</Label><TextInput value={form.teamB} onChange={v => setForm(f => ({ ...f, teamB: v }))} placeholder="Argentina" /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Btn onClick={save} color="#3FB950">Save Match</Btn>
          {saved && <span style={{ color: C.green, fontSize: 13 }}>Saved ✓</span>}
        </div>
      </Card>

      {questions.map(q => {
        const rev = reveals[q.date]
        return (
          <Card key={q.date} style={{ marginBottom: 10, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: rev?.hc_revealed ? 0 : 12 }}>
              <div>
                <span style={{ fontWeight: 600 }}>{q.date}</span>
                <span style={{ color: C.muted, fontSize: 13, marginLeft: 10 }}>{q.data.teamA} vs {q.data.teamB}</span>
                {q.data.groupLabel && <span style={{ color: C.muted, fontSize: 12, marginLeft: 8 }}>· {q.data.groupLabel}</span>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {rev?.hc_revealed && (
                  <span style={{ color: C.green, fontSize: 13, fontWeight: 600 }}>
                    {rev.actual_a}–{rev.actual_b} ✓
                  </span>
                )}
                <Btn ghost small color={C.red} onClick={() => del(q.date)}>Delete</Btn>
              </div>
            </div>
            {!rev?.hc_revealed && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: C.muted }}>Final score:</span>
                <input type="number" min="0" max="20" value={scoreA} onChange={e => setScoreA(e.target.value)}
                  placeholder="0" style={{ width: 48, padding: '4px 8px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.white, fontSize: 14, textAlign: 'center' }} />
                <span style={{ color: C.muted }}>–</span>
                <input type="number" min="0" max="20" value={scoreB} onChange={e => setScoreB(e.target.value)}
                  placeholder="0" style={{ width: 48, padding: '4px 8px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.white, fontSize: 14, textAlign: 'center' }} />
                <Btn small color="#3FB950" onClick={() => reveal(q.date)} disabled={scoreA === '' || scoreB === ''}>
                  Reveal Result
                </Btn>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

// ── Player View ──────────────────────────────────────────────────────────────
function PlayerView({ name, family }) {
  const [question, setQuestion] = useState(null)
  const [reveal, setReveal] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [q, r, s] = await Promise.all([getQuestion(TODAY), getReveal(TODAY), getSubmission(TODAY, name)])
    setQuestion(q); setReveal(r); setSubmission(s); setLoading(false)
  }, [name])

  useEffect(() => { load() }, [load])
  useEffect(() => { const t = setInterval(load, 15000); return () => clearInterval(t) }, [load])

  const submit = async () => {
    if (scoreA === '' || scoreB === '') return
    setSubmitting(true)
    const s = { scoreA, scoreB, family, ts: Date.now() }
    await upsertSubmission(TODAY, name, s)
    setSubmission(s); setSubmitting(false)
  }

  const fColor = familyColor(family)

  if (loading) return <p style={{ color: C.muted, textAlign: 'center', padding: 40 }}>Loading...</p>

  if (!question) return (
    <Card style={{ textAlign: 'center', padding: 48 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
      <p style={{ color: C.muted }}>No match set for today yet.</p>
    </Card>
  )

  const submitted = !!submission
  const revealed = reveal?.hc_revealed
  const pts = submitted && revealed ? calcPoints(submission, reveal, question) : null
  const actualA = reveal?.actual_a
  const actualB = reveal?.actual_b

  const pickedA = submitted ? submission.scoreA : scoreA
  const pickedB = submitted ? submission.scoreB : scoreB

  return (
    <div className="fade-up">
      <Card style={{ marginBottom: 16 }} accent={fColor + '44'}>
        {question.groupLabel && (
          <p style={{ fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            {question.groupLabel}
          </p>
        )}

        {/* Match header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <p style={{ fontFamily: "'Syne'", fontSize: 13, fontWeight: 700, color: C.muted, flex: 1, textAlign: 'center' }}>{question.teamA}</p>
          <p style={{ color: C.muted, fontSize: 13, padding: '0 12px' }}>vs</p>
          <p style={{ fontFamily: "'Syne'", fontSize: 13, fontWeight: 700, color: C.muted, flex: 1, textAlign: 'center' }}>{question.teamB}</p>
        </div>

        {/* Score picker */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
          <ScoreInput value={pickedA} onChange={setScoreA} disabled={submitted} />
          <span style={{ fontFamily: "'Syne'", fontSize: 32, fontWeight: 800, color: C.muted }}>–</span>
          <ScoreInput value={pickedB} onChange={setScoreB} disabled={submitted} />
        </div>

        {/* Points legend */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: C.muted }}>✓ Correct result <strong style={{ color: C.white }}>+2</strong></span>
          <span style={{ fontSize: 12, color: C.muted }}>🎯 Exact score <strong style={{ color: C.white }}>+5</strong></span>
        </div>

        {!submitted ? (
          <Btn onClick={submit} color={fColor} disabled={scoreA === '' || scoreB === '' || submitting}>
            {submitting ? 'Locking in...' : 'Lock In Prediction'}
          </Btn>
        ) : (
          <div style={{ textAlign: 'center' }}>
            {revealed ? (
              <div>
                <p style={{ fontFamily: "'Syne'", fontSize: 13, color: C.muted, marginBottom: 4 }}>Final score</p>
                <p style={{ fontFamily: "'Syne'", fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
                  {actualA} – {actualB}
                </p>
                <p style={{ fontFamily: "'Syne'", fontSize: 48, fontWeight: 800, color: pts === 5 ? '#FFD700' : pts > 0 ? C.green : C.red }}>
                  {pts === 5 ? '🎯 +5' : pts > 0 ? `✓ +${pts}` : '✗ +0'}
                </p>
                {pts === 5 && <p style={{ color: '#FFD700', fontSize: 13, marginTop: 4 }}>Exact score!</p>}
              </div>
            ) : (
              <p style={{ color: C.muted, fontSize: 13 }}>
                Prediction locked: <strong style={{ color: C.white }}>{submission.scoreA} – {submission.scoreB}</strong>
                <br /><span style={{ fontSize: 12 }}>Points revealed after the match</span>
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

// ── Leaderboard ──────────────────────────────────────────────────────────────
function Leaderboard() {
  const [board, setBoard] = useState([])
  const [familyScores, setFamilyScores] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const allSubs = await getAllSubmissions()
      const allQs = await getAllQuestions()
      const qMap = {}
      allQs.forEach(q => { qMap[q.date] = q.data })
      const revs = {}
      for (const q of allQs) { const r = await getReveal(q.date); if (r) revs[q.date] = r }

      const scores = {}
      for (const sub of allSubs) {
        const { date, player, data } = sub
        if (!scores[player]) scores[player] = { total: 0, exact: 0, correct: 0, entered: 0, family: data.family || null }
        scores[player].entered++
        if (data.family) scores[player].family = data.family
        const rev = revs[date]
        const q = qMap[date]
        if (rev && q) {
          const pts = calcPoints(data, rev, q)
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

      const fs = {}
      for (const f of FAMILIES) {
        const members = sorted.filter(p => p.family === f.name).map(p => p.total)
        fs[f.name] = top50Avg(members)
      }
      setFamilyScores(fs)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p style={{ color: C.muted, textAlign: 'center', padding: 40 }}>Loading...</p>

  const sortedFamilies = [...FAMILIES].sort((a, b) => (familyScores[b.name] || 0) - (familyScores[a.name] || 0))
  const leader = sortedFamilies[0]
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="fade-up">
      {/* Family banner */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Family Standings</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {sortedFamilies.map((f, i) => {
            const score = familyScores[f.name] || 0
            const isLeading = i === 0 && score > 0
            return (
              <div key={f.name} style={{
                background: isLeading ? f.color + '18' : C.surface,
                border: `2px solid ${isLeading ? f.color : C.border}`,
                borderRadius: 12, padding: '14px 10px', textAlign: 'center', position: 'relative'
              }}>
                {isLeading && score > 0 && (
                  <div style={{
                    position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                    background: f.color, color: '#000', fontSize: 9, fontWeight: 700,
                    padding: '2px 7px', borderRadius: 4, letterSpacing: 1, whiteSpace: 'nowrap'
                  }}>LEADING</div>
                )}
                <div style={{ fontSize: 20, marginBottom: 4 }}>{f.emoji}</div>
                <p style={{ fontSize: 12, color: f.color, fontWeight: 600, marginBottom: 4 }}>{f.name}</p>
                <p style={{ fontFamily: "'Syne'", fontSize: 28, fontWeight: 800, color: isLeading ? f.color : C.white }}>
                  {score.toFixed(1)}
                </p>
                <p style={{ fontSize: 10, color: C.muted }}>avg top 50%</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Individual */}
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
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 16px', marginBottom: 8, borderRadius: 10,
            background: i === 0 ? '#FFD70011' : C.surface,
            border: `1px solid ${i === 0 ? '#FFD70044' : C.border}`,
            borderLeft: `3px solid ${fColor}`,
          }}>
            <span style={{ fontSize: 18, width: 26, textAlign: 'center' }}>{medals[i] || i + 1}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</p>
              <p style={{ fontSize: 12, color: C.muted }}>
                <span style={{ color: fColor }}>{p.family || '—'}</span>
                {' · '}🎯 {p.exact} exact · ✓ {p.correct} correct · {p.entered}d
              </p>
            </div>
            <div style={{ fontFamily: "'Syne'", fontSize: 28, fontWeight: 800, color: i === 0 ? '#FFD700' : C.white }}>
              {p.total}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('play')
  const [name, setName] = useState(() => localStorage.getItem('fwc_name') || '')
  const [family, setFamily] = useState(() => localStorage.getItem('fwc_family') || '')
  const [nameInput, setNameInput] = useState('')
  const [familyInput, setFamilyInput] = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [adminUnlocked, setAdminUnlocked] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  const enter = () => {
    if (!nameInput.trim() || !familyInput) return
    localStorage.setItem('fwc_name', nameInput.trim())
    localStorage.setItem('fwc_family', familyInput)
    setName(nameInput.trim()); setFamily(familyInput)
  }

  const tryAdmin = () => {
    if (adminCode === ADMIN_CODE) { setAdminUnlocked(true); setShowAdmin(true) }
  }

  const fColor = family ? familyColor(family) : C.muted

  if (showAdmin && adminUnlocked) return (
    <>
      <style>{globalCSS}</style>
      <Header name={name} family={family} isAdmin onAdminClick={() => {}} />
      <AdminPanel onBack={() => setShowAdmin(false)} />
    </>
  )

  return (
    <>
      <style>{globalCSS}</style>
      <Header name={name} family={family} isAdmin={adminUnlocked} onAdminClick={() => setShowAdmin(true)} />

      <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: C.surface, borderRadius: 10, padding: 4, border: `1px solid ${C.border}` }}>
          {[['play', '⚽ Today'], ['board', '🏆 Leaderboard']].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
              background: view === v ? C.white : 'transparent',
              color: view === v ? C.bg : C.muted,
              fontFamily: "'Instrument Sans'", fontWeight: 600, fontSize: 14,
              cursor: 'pointer', transition: 'all .15s'
            }}>{label}</button>
          ))}
        </div>

        {/* Join gate */}
        {view === 'play' && (!name || !family) && (
          <Card style={{ textAlign: 'center', padding: 40 }} className="fade-up">
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚽</div>
            <p style={{ fontFamily: "'Syne'", fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Join the Challenge</p>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 28 }}>Pick your family and enter your name</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
              {FAMILIES.map(f => (
                <button key={f.name} onClick={() => setFamilyInput(f.name)} style={{
                  padding: '14px 8px', borderRadius: 10, cursor: 'pointer',
                  fontFamily: "'Instrument Sans'", fontWeight: 600, fontSize: 13,
                  border: `2px solid ${familyInput === f.name ? f.color : C.border}`,
                  background: familyInput === f.name ? f.color + '22' : 'transparent',
                  color: familyInput === f.name ? f.color : C.muted,
                  transition: 'all .15s'
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{f.emoji}</div>
                  {f.name}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, maxWidth: 280, margin: '0 auto' }}>
              <TextInput value={nameInput} onChange={setNameInput} placeholder="Your name" />
              <Btn onClick={enter} color={familyInput ? familyColor(familyInput) : C.white} disabled={!nameInput.trim() || !familyInput}>Go</Btn>
            </div>
          </Card>
        )}

        {view === 'play' && name && family && <PlayerView name={name} family={family} />}
        {view === 'board' && <Leaderboard />}

        {/* Admin */}
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

function Header({ name, family, isAdmin, onAdminClick }) {
  const fColor = family ? familyColor(family) : C.muted
  return (
    <div style={{
      background: C.surface, borderBottom: `1px solid ${C.border}`,
      padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div>
        <p style={{ fontFamily: "'Syne'", fontSize: 20, fontWeight: 800, lineHeight: 1 }}>⚽ World Cup 2026</p>
        <p style={{ fontSize: 11, color: C.muted, letterSpacing: 1 }}>FAMILY PREDICTOR</p>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {name && (
          <span style={{
            background: fColor + '22', color: fColor, border: `1px solid ${fColor}44`,
            borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600
          }}>{name}</span>
        )}
        {isAdmin && (
          <button onClick={onAdminClick} style={{
            background: '#F8514922', color: '#F85149', border: '1px solid #F8514944',
            borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700,
            cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase'
          }}>Admin</button>
        )}
      </div>
    </div>
  )
}
