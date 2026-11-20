import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Eye, EyeOff, ArrowRight, Box, MessageCircle, Repeat, Sparkles, Mail, MailCheck, KeyRound, RotateCw } from 'lucide-react'
import { GOOGLE_CLIENT_ID, loadGis, loginGoogle, loginEmail, registerEmail, useAuth, clearNote, authConfig, sendCode, verifyCode } from '../engine/auth'
import { AnimalCell } from '../art/Cells'
import { Seg, useWide } from '../ui/kit'
import { Shape } from '../ui/flux'

type Mode = 'login' | 'register'

export default function Login() {
  const wide = useWide(960)
  const { note } = useAuth()
  return (
    <div className="login">
      <Shape kind="cookie" size={520} spin={90} className="ldeco" fill="var(--lime)" style={{ left: -220, top: -240, opacity: 0.85 }} />
      <Shape kind="flower" size={300} spin={70} className="ldeco" fill="var(--violet-c)" style={{ right: -110, bottom: -90 }} />
      <Shape kind="clover" size={150} spin={50} className="ldeco" fill="var(--coral-c)" style={{ right: '18%', top: 40 }} />
      <div className="login-grid">
        <Showcase compact={!wide} />
        <motion.div className="login-side" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.7, delay: 0.12 }}>
          <AuthCard note={note} />
        </motion.div>
      </div>
    </div>
  )
}

const POINTS = [
  { icon: <Box size={17} />, t: '3D cell', s: 'Rotate, cut open, tap an organelle' },
  { icon: <Repeat size={17} />, t: 'Reviews at the right time', s: 'FSRS, 16 task types' },
  { icon: <MessageCircle size={17} />, t: 'AI grades your explanation', s: 'Based on your notes, also by voice' },
]

function Showcase({ compact }: { compact: boolean }) {
  return (
    <div className={`login-show ${compact ? 'compact' : ''}`}>
      <motion.div className="brand" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <img src="/icon.svg" alt="" width={34} height={34} />
        <span>Bios</span>
      </motion.div>
      <motion.div className="login-cell" initial={{ opacity: 0, scale: 0.92, rotate: -4 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.15, duration: 1.1 }}>
        <div className="float"><AnimalCell kind="animal" /></div>
      </motion.div>
      <motion.h1 className="login-h" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.7, delay: 0.08 }}>
        Biology<br />you can <em>see</em>.
      </motion.h1>
      <motion.p className="login-p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>A 3D cell, tasks from your notes and AI that grades your explanation.</motion.p>
      {!compact && (
        <div className="login-points">
          {POINTS.map((p, i) => (
            <motion.div key={p.t} className="row" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.6, delay: 0.25 + i * 0.08 }}>
              <span className="ico" style={{ background: 'var(--ink)', color: 'var(--lime)' }}>{p.icon}</span>
              <span><span className="hl" style={{ display: 'block', fontSize: 16 }}>{p.t}</span><span className="fn">{p.s}</span></span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function AuthCard({ note }: { note?: string }) {
  const [codeOn, setCodeOn] = useState<boolean | null>(null)
  const [pwMode, setPwMode] = useState(false)
  useEffect(() => { authConfig().then(c => setCodeOn(c.code)) }, [])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const usePw = codeOn === false || pwMode

  return (
    <div className="auth glass">
      <GoogleButton mode="login" onBusy={setBusy} onError={setErr} />
      <div className="divider"><span>or with email</span></div>
      {codeOn === null ? <div className="gbtn-ph" style={{ height: 58, borderRadius: 20 }} />
        : usePw ? <PasswordForm note={note} outerErr={err} onCode={codeOn ? () => { setPwMode(false); setErr('') } : undefined} />
        : <CodeFlow note={note} outerErr={err} onPassword={() => { setPwMode(true); setErr('') }} />}
      {busy && <div className="fn" style={{ marginTop: 10, textAlign: 'center' }}><Sparkles size={13} style={{ verticalAlign: -2 }} /> Signing in with Google …</div>}
    </div>
  )
}

function Msg({ text, bad }: { text?: string; bad?: boolean }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div key={text} className={`auth-msg ${bad ? 'bad' : ''}`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0, x: bad ? [0, -6, 6, -3, 3, 0] : 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>{text}</motion.div>
      )}
    </AnimatePresence>
  )
}

const nameFromMail = (email: string) => {
  const w = email.split('@')[0].replace(/[._\d-]+/g, ' ').trim().split(' ')[0] ?? ''
  return w.length >= 3 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''
}

/* ───────── email with a code ───────── */
function CodeFlow({ note, outerErr, onPassword }: { note?: string; outerErr: string; onPassword: () => void }) {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isNew, setIsNew] = useState(false)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [wait, setWait] = useState(0)
  const [state, setState] = useState<'' | 'bad' | 'good'>('')

  useEffect(() => {
    if (wait <= 0) return
    const t = setTimeout(() => setWait(w => w - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  const send = async (e?: FormEvent) => {
    e?.preventDefault()
    setErr(''); clearNote()
    setBusy(true)
    try {
      const r = await sendCode(email.trim())
      setIsNew(r.isNew)
      if (r.isNew && !name) setName(nameFromMail(email))
      setStep('code'); setCode(''); setState(''); setWait(30)
    } catch (x) {
      const d = (x as { data?: { wait?: number } }).data
      if (d?.wait) { setWait(d.wait); if (step === 'email') setStep('code') }
      setErr((x as Error).message)
    }
    setBusy(false)
  }

  const verify = async (c: string) => {
    if (c.length !== 6 || busy) return
    setErr(''); setBusy(true)
    try {
      await verifyCode(email.trim(), c, isNew ? name : undefined)
      setState('good')
    } catch (x) {
      setState('bad')
      setErr((x as Error).message)
      const d = (x as { data?: { expired?: boolean } }).data
      setTimeout(() => { setCode(''); setState('') }, 650)
      if (d?.expired) setWait(0)
    }
    setBusy(false)
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {step === 'email' ? (
        <motion.form key="email" onSubmit={send} className="stack" style={{ gap: 10 }} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ type: 'spring', bounce: 0, duration: 0.42 }}>
          <input className="field" type="email" placeholder="Email address" autoComplete="email" inputMode="email" required value={email} onChange={e => setEmail(e.target.value)} />
          <Msg text={err || outerErr || note} bad={!!(err || outerErr)} />
          <button className="btn full accent" disabled={busy || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())} type="submit">
            {busy ? <span className="spin" /> : <><Mail size={18} /> Send code</>}
          </button>
          <div className="fn" style={{ textAlign: 'center', marginTop: 2 }}>You get a six digit code by email. No password to remember, the account is created automatically.</div>
          <button type="button" className="fn link" style={{ alignSelf: 'center', marginTop: 4 }} onClick={onPassword}><KeyRound size={13} style={{ verticalAlign: -2 }} /> Sign in with password</button>
        </motion.form>
      ) : (
        <motion.div key="code" className="stack" style={{ gap: 12 }} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ type: 'spring', bounce: 0, duration: 0.42 }}>
          <div className="otp-head">
            <motion.span className="otp-ico" initial={{ scale: 0.4, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.5, duration: 0.7 }}><MailCheck size={22} /></motion.span>
            <div>
              <div className="hl" style={{ fontSize: 19 }}>Check your email</div>
              <div className="fn">We sent the code to <b style={{ color: 'var(--ink)' }}>{email.trim()}</b>. <button className="link fn" onClick={() => { setStep('email'); setErr('') }}>Change</button></div>
            </div>
          </div>
          <AnimatePresence initial={false}>
            {isNew && (
              <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                <label className="fn" style={{ display: 'block', margin: '0 0 6px 4px' }}>New account. What is your name?</label>
                <input className="field" placeholder="Name" autoComplete="given-name" value={name} onChange={e => setName(e.target.value)} maxLength={40} />
              </motion.div>
            )}
          </AnimatePresence>
          <OtpInput value={code} state={state} disabled={busy} onChange={v => { setCode(v); setErr(''); if (v.length === 6 && (!isNew || name.trim())) verify(v) }} />
          <Msg text={err} bad />
          {isNew && <button className="btn full accent" disabled={busy || code.length !== 6 || !name.trim()} onClick={() => verify(code)}>{busy ? <span className="spin" /> : <>Create account <ArrowRight size={18} /></>}</button>}
          {!isNew && busy && <div className="fn" style={{ textAlign: 'center' }}><span className="spin" style={{ width: 14, height: 14, borderWidth: 2, verticalAlign: -2 }} /> Checking …</div>}
          <div className="otp-foot">
            <button className="link fn" disabled={wait > 0 || busy} onClick={() => send()} style={{ opacity: wait > 0 ? 0.55 : 1 }}>
              <RotateCw size={13} style={{ verticalAlign: -2 }} /> {wait > 0 ? `Resend in ${wait} s` : 'Send a new code'}
            </button>
            <span className="fn">No message? Check your spam folder.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Six boxes for the code: one real input field over the boxes (pasting and autofill from email both work) */
function OtpInput({ value, onChange, state, disabled }: { value: string; onChange: (v: string) => void; state: '' | 'bad' | 'good'; disabled?: boolean }) {
  const ref = useRef<HTMLInputElement>(null)
  const [focus, setFocus] = useState(false)
  useEffect(() => { const t = setTimeout(() => ref.current?.focus(), 380); return () => clearTimeout(t) }, [])
  return (
    <motion.div className={`otp ${state}`} onClick={() => ref.current?.focus()} animate={state === 'bad' ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
      <input ref={ref} className="otp-input" value={value} disabled={disabled} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={6} aria-label="Six digit code"
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))} />
      {Array.from({ length: 6 }, (_, i) => {
        const ch = value[i]
        const cur = focus && (i === value.length || (i === 5 && value.length === 6))
        return (
          <div key={i} className={`otp-box ${ch ? 'on' : ''} ${cur ? 'cur' : ''} ${i === 2 ? 'mid' : ''}`} style={{ transitionDelay: state === 'good' ? `${i * 45}ms` : '0ms' }}>
            <AnimatePresence>
              {ch && <motion.span key={ch + i} initial={{ y: 14, opacity: 0, scale: 0.6 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ type: 'spring', bounce: 0.45, duration: 0.42 }}>{ch}</motion.span>}
            </AnimatePresence>
            {cur && !ch && <i className="otp-caret" />}
          </div>
        )
      })}
    </motion.div>
  )
}

/* ───────── email with a password (existing accounts with a password) ───────── */
function PasswordForm({ note, outerErr, onCode }: { note?: string; outerErr: string; onCode?: () => void }) {
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [forgot, setForgot] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErr(''); clearNote()
    if (mode === 'register' && pw.length < 8) { setErr('The password must have at least 8 characters.'); return }
    setBusy(true)
    try {
      if (mode === 'login') await loginEmail(email, pw)
      else await registerEmail(name, email, pw)
    } catch (x) { setErr((x as Error).message || 'Sign in failed.') }
    setBusy(false)
  }

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.42 }}>
      {!onCode && <Seg value={mode} onChange={m => { setMode(m); setErr(''); setForgot(false) }} options={[{ v: 'login', label: 'Sign in' }, { v: 'register', label: 'New account' }]} />}
      <form onSubmit={submit} className="stack" style={{ gap: 10, marginTop: onCode ? 0 : 12 }}>
        <AnimatePresence initial={false}>
          {mode === 'register' && (
            <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} style={{ overflow: 'hidden' }}>
              <input className="field" placeholder="Name" autoComplete="given-name" value={name} onChange={e => setName(e.target.value)} maxLength={40} />
            </motion.div>
          )}
        </AnimatePresence>
        <input className="field" type="email" placeholder="Email address" autoComplete="email" inputMode="email" required value={email} onChange={e => setEmail(e.target.value)} />
        <div style={{ position: 'relative' }}>
          <input className="field" type={show ? 'text' : 'password'} placeholder={mode === 'register' ? 'Password (at least 8 characters)' : 'Password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'register' ? 8 : 1} value={pw} onChange={e => setPw(e.target.value)} style={{ paddingRight: 52 }} />
          <button type="button" className="iconbtn" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 8, top: 8 }}>{show ? <EyeOff size={19} /> : <Eye size={19} />}</button>
        </div>
        <Msg text={err || outerErr || note} bad={!!(err || outerErr)} />
        <button className="btn full accent" disabled={busy || !email || !pw} type="submit">
          {busy ? <span className="spin" /> : <>{mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={18} /></>}
        </button>
      </form>
      <div style={{ marginTop: 12, textAlign: 'center' }} className="stack">
        {onCode && <button className="fn link" style={{ alignSelf: 'center' }} onClick={onCode}><Mail size={13} style={{ verticalAlign: -2 }} /> Use an email code instead</button>}
        {mode === 'login' && <button className="fn link" style={{ alignSelf: 'center', marginTop: 6 }} onClick={() => setForgot(f => !f)}>Forgot password?</button>}
        <AnimatePresence>
          {forgot && (
            <motion.div className="fn" style={{ marginTop: 8, textAlign: 'left' }} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              {onCode ? 'Sign in with an email code; then set a new password under Progress.' : <>If your address is a Gmail address, sign in with Google; the account links and you set a new password under Progress. Otherwise contact the app administrator.</>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function GoogleButton({ mode, onBusy, onError }: { mode: Mode; onBusy: (b: boolean) => void; onError: (e: string) => void }) {
  const host = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'load' | 'ok' | 'fail'>('load')
  const cb = useRef({ onBusy, onError })
  cb.current = { onBusy, onError }

  useEffect(() => {
    let alive = true
    let ro: ResizeObserver | undefined
    let onDark: (() => void) | undefined
    const dark = window.matchMedia('(prefers-color-scheme: dark)')
    loadGis().then(g => {
      if (!alive || !host.current) return
      g.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (r: { credential?: string }) => {
          if (!r.credential) return
          cb.current.onBusy(true); cb.current.onError('')
          try { await loginGoogle(r.credential) } catch (x) { cb.current.onError((x as Error).message) }
          cb.current.onBusy(false)
        },
        ux_mode: 'popup', auto_select: false, cancel_on_tap_outside: true, itp_support: true,
        context: mode === 'login' ? 'signin' : 'signup', use_fedcm_for_prompt: true,
      })
      const render = () => {
        if (!host.current) return
        host.current.innerHTML = ''
        g.accounts.id.renderButton(host.current, {
          type: 'standard', theme: dark.matches ? 'filled_black' : 'outline', size: 'large', shape: 'pill',
          text: mode === 'login' ? 'signin_with' : 'signup_with', logo_alignment: 'center', locale: 'en',
          width: Math.max(220, Math.min(400, Math.floor(host.current.clientWidth))),
        })
      }
      render()
      setState('ok')
      let lastW = host.current.clientWidth
      ro = new ResizeObserver(() => { const w = host.current?.clientWidth ?? 0; if (Math.abs(w - lastW) > 24) { lastW = w; render() } })
      ro.observe(host.current)
      onDark = render
      dark.addEventListener('change', render)
    }).catch(() => { if (alive) setState('fail') })
    return () => { alive = false; ro?.disconnect(); if (onDark) dark.removeEventListener('change', onDark) }
  }, [mode])

  return (
    <div className="gbtn">
      <div ref={host} className="gbtn-host" style={{ display: state === 'fail' ? 'none' : undefined }} />
      {state === 'load' && <div className="gbtn-ph" />}
      {state === 'fail' && <div className="auth-msg">Google sign in did not load (an extension may be blocking it). Use email or reload the page.</div>}
    </div>
  )
}
