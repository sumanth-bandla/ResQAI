import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Database, Eye, EyeOff, LockKeyhole, Mail, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Brand } from "../components/Brand";
import { HistoricalMapPreview } from "../components/HistoricalMapPreview";
import { StatusMessage } from "../components/Ui";
import { supabase, supabaseConfigured } from "../lib/supabase";

type AuthMode = "login" | "register";
const RESEND_COOLDOWN_SECONDS = 60;
const RATE_LIMIT_COOLDOWN_SECONDS = 300;
const COOLDOWN_STORAGE_KEY = "resqai.auth.emailCooldownUntil";

function readCooldown(): number {
  try {
    const until = Number(sessionStorage.getItem(COOLDOWN_STORAGE_KEY));
    return Number.isFinite(until) ? Math.max(0, Math.ceil((until - Date.now()) / 1000)) : 0;
  } catch {
    return 0;
  }
}

function writeCooldown(seconds: number): void {
  try {
    sessionStorage.setItem(COOLDOWN_STORAGE_KEY, String(Date.now() + seconds * 1000));
  } catch {
    // The in-memory cooldown still prevents repeated requests for this page session.
  }
}

function isEmailRateLimit(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const value = error as { status?: unknown; code?: unknown; message?: unknown };
  return value.status === 429
    || (typeof value.code === "string" && /rate.?limit|too_many/i.test(value.code))
    || (typeof value.message === "string" && /email rate limit|over_email_send_rate_limit|too many requests/i.test(value.message));
}

function authFailureMessage(error: unknown, action: "signup" | "signin" | "resend" | "recovery"): string {
  if (isEmailRateLimit(error)) {
    return action === "signin"
      ? "Too many sign-in attempts. Wait a few minutes before trying again."
      : "Supabase is temporarily rate-limiting email requests. Wait at least five minutes before trying again; repeated requests will not improve delivery.";
  }
  if (action === "signin") {
    return "Sign-in failed. Check your email and password. If you just registered, complete email verification first or use password recovery.";
  }
  if (action === "signup") {
    return "We couldn't submit this registration. Check the Supabase Email provider and redirect settings, then try again later.";
  }
  if (action === "resend") {
    return "Supabase could not accept the verification resend request. Check your connection and project email settings before trying again.";
  }
  return "Could not request a password reset. Check your connection and try again later.";
}

export function LoginPage({ mode }: { mode: AuthMode }) {
  const [searchParams] = useSearchParams();
  const recoveryMode = searchParams.get("recovery") === "1";
  const invalidRecoveryLink = recoveryMode && (searchParams.has("error") || searchParams.has("error_description"));

  return (
    <main className="login-layout">
      <section className="login-story">
        <div className="login-story__inner">
          <header className="login-brand-row"><Brand inverse /><span className="demo-badge"><i /> PUBLIC ARCHIVE</span></header>
          <div className="login-story__copy">
            <p className="login-kicker"><span /> SAN FRANCISCO <b>·</b> HISTORICAL RECORDS</p>
            <h1>A shared picture.<br />Grounded in <span>history.</span></h1>
            <p className="login-lead">Explore public, closed San Francisco fire incident records on a real street map. This read-only archive is for learning and exploration—not emergency response.</p>
          </div>
          <div className="login-map-wrap">
            <div className="login-map-head"><span><i /> HISTORICAL PUBLIC RECORDS</span><span><Database size={12} /> SIGN IN TO BROWSE</span></div>
            <HistoricalMapPreview />
            <p className="login-map-caption">Illustrated street map · actual archived locations appear after sign-in.</p>
            <div className="login-map-legend"><span><i className="legend-red" /> Closed public records</span><span><MapPin size={12} /> Historical only</span></div>
          </div>
          <footer className="login-story__footer"><ShieldCheck size={15} /><span>Public records · read-only access</span><span className="login-operational">HISTORICAL DATA ONLY</span></footer>
        </div>
      </section>
      <section className="login-auth">
        <header className="login-auth__top"><Brand /><a href="https://data.sfgov.org/d/wr8u-xric" target="_blank" rel="noreferrer">City data source</a></header>
        <div className="login-auth__content">
          <div className="authorized-badge"><span><LockKeyhole size={11} /></span> SUPABASE ACCOUNT ACCESS</div>
          <h2>{recoveryMode ? "Set a new password" : mode === "register" ? "Create account" : "Welcome back"}<span>.</span></h2>
          <p className="login-subtitle">{recoveryMode
            ? "Open this page from the password-reset link sent to your registered email, then choose a new password."
            : mode === "register"
              ? "Register with your email to access the read-only historical archive. Email verification may be required."
              : "Sign in to access the read-only historical archive."}</p>
          <div className="agency-identity"><div className="agency-seal"><MapPin size={17} /></div><div><strong>San Francisco Fire Incidents</strong><small>Public historical records · no operational data</small></div></div>
          {!supabaseConfigured && <StatusMessage tone="warning"><Database size={15} /><span><strong>Authentication is not configured.</strong> Copy <code>.env.example</code> to <code>.env.local</code>, confirm its Supabase project URL is the project you intend to use, and add that project's publishable key as <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>. Get the key from <a href="https://supabase.com/dashboard/project/hopopcdfpjwjshkrfmki/settings/api-keys" target="_blank" rel="noreferrer">Supabase API settings</a>; use a publishable/anon key only, never a service-role key. Restart the dev server after saving.</span></StatusMessage>}
          <AuthForm mode={mode} recoveryMode={recoveryMode} invalidRecoveryLink={invalidRecoveryLink} />
          {!recoveryMode && <div className="login-auth-switch">{mode === "register" ? <>Already registered? <Link to="/login">Sign in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}</div>}
          <div className="login-security"><ShieldCheck size={14} /><span>Supabase-managed authentication</span><i /> No service-role key in browser</div>
          <p className="login-legal">This is not an emergency service. It has no agency identity provider, live incident feed, CAD, responder GPS, or 911 connection. Registration grants archive access only and does not create agency authorization.</p>
        </div>
        <footer className="login-auth__footer"><span>ResQAI · Public archive</span><nav><a href="https://data.sfgov.org/d/wr8u-xric" target="_blank" rel="noreferrer">City dataset</a></nav></footer>
      </section>
    </main>
  );
}

function AuthForm({ mode, recoveryMode, invalidRecoveryLink }: { mode: AuthMode; recoveryMode: boolean; invalidRecoveryLink: boolean }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(invalidRecoveryLink ? "This password-reset link is invalid, expired, or already used. Return to sign in and request a new link." : "");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(readCooldown);
  const requestInFlight = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setTimeout(() => setCooldown(readCooldown()), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  function startCooldown(seconds: number) {
    writeCooldown(seconds);
    setCooldown(seconds);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInFlight.current) return;
    setMessage("");
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedFullName = fullName.trim();
    if (mode === "register" && !recoveryMode && (normalizedFullName.length < 1 || normalizedFullName.length > 100)) {
      setError("Enter your full name using 1 to 100 characters.");
      return;
    }
    if (!recoveryMode && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }
    if ((mode === "register" || recoveryMode) && password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    if (!supabase) {
      setError("Supabase is not configured. Add the browser-safe project URL and publishable key to .env.local.");
      return;
    }

    requestInFlight.current = true;
    setBusy(true);
    try {
      if (recoveryMode) {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        setMessage("Your password was updated. You are signed in.");
        navigate("/overview", { replace: true });
      } else if (mode === "register") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { full_name: normalizedFullName },
          },
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          navigate("/overview", { replace: true });
        } else if (data.user) {
          setPendingEmail(normalizedEmail);
          startCooldown(RESEND_COOLDOWN_SECONDS);
        } else {
          setError("Supabase did not return a registration result. Wait briefly, then try once more or contact the project administrator.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (signInError) throw signInError;
        const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
        navigate(from && from !== "/login" && from !== "/register" ? from : "/overview", { replace: true });
      }
    } catch (authError) {
      if (isEmailRateLimit(authError)) startCooldown(RATE_LIMIT_COOLDOWN_SECONDS);
      setError(authFailureMessage(authError, recoveryMode ? "recovery" : mode === "register" ? "signup" : "signin"));
    } finally {
      requestInFlight.current = false;
      setBusy(false);
    }
  }

  async function resendVerification() {
    if (!pendingEmail || !supabase || requestInFlight.current || cooldown > 0) return;
    setMessage("");
    setError("");
    requestInFlight.current = true;
    setBusy(true);
    startCooldown(RESEND_COOLDOWN_SECONDS);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: pendingEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (resendError) throw resendError;
      setMessage("Supabase accepted the verification resend request. Email delivery is not confirmed; check your inbox and spam folder.");
    } catch (resendError) {
      if (isEmailRateLimit(resendError)) startCooldown(RATE_LIMIT_COOLDOWN_SECONDS);
      setError(authFailureMessage(resendError, "resend"));
    } finally {
      requestInFlight.current = false;
      setBusy(false);
    }
  }

  async function requestPasswordReset() {
    if (requestInFlight.current) return;
    setMessage("");
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter your account email first.");
      return;
    }
    if (!supabase) {
      setError("Supabase is not configured. Add the project URL and publishable key to .env.local.");
      return;
    }
    requestInFlight.current = true;
    setBusy(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/login?recovery=1`,
      });
      if (resetError) throw resetError;
      startCooldown(RESEND_COOLDOWN_SECONDS);
      setMessage("If an account exists for this email, Supabase accepted a password-reset request. Email delivery is not confirmed.");
    } catch (authError) {
      if (isEmailRateLimit(authError)) startCooldown(RATE_LIMIT_COOLDOWN_SECONDS);
      setError(authFailureMessage(authError, "recovery"));
    } finally {
      requestInFlight.current = false;
      setBusy(false);
    }
  }

  if (pendingEmail) {
    return (
      <section className="verification-pending" aria-live="polite">
        <div className="verification-pending__icon"><Mail size={19} /></div>
        <h3>Registration request received</h3>
        <p>Registration was submitted for <strong>{pendingEmail}</strong>. If this address needs verification, check its inbox and spam folder for a link. This response cannot confirm account creation or email delivery. If you already have an account, sign in or use password recovery.</p>
        {error && <div className="login-message login-message--error" role="alert">{error}</div>}
        {message && <div className="login-message" role="status"><ShieldCheck size={15} />{message}</div>}
        <button type="button" className="button button--primary login-submit" onClick={() => void resendVerification()} disabled={busy || cooldown > 0}>
          {busy ? <><span className="button-spinner" /> Requesting…</> : cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend verification email"}
        </button>
        <button type="button" className="link-button verification-edit" onClick={() => { setPendingEmail(null); setError(""); setMessage(""); }} disabled={busy}>Use a different email</button>
        <p className="verification-help">If messages do not arrive after the cooldown, check the Supabase project’s email/SMTP configuration rather than repeatedly submitting registration.</p>
      </section>
    );
  }

  return (
    <form className="login-form" onSubmit={submit} noValidate>
      {mode === "register" && !recoveryMode && <div className="login-field"><label htmlFor="auth-full-name">Full name</label><div className="login-input"><UserRound size={16} /><input id="auth-full-name" type="text" autoComplete="name" maxLength={100} placeholder="Your full name" value={fullName} onChange={(event) => setFullName(event.target.value)} disabled={!supabaseConfigured || busy} /></div></div>}
      {!recoveryMode && <div className="login-field"><label htmlFor="auth-email">Email</label><div className="login-input"><Mail size={16} /><input id="auth-email" type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={!supabaseConfigured || busy} /></div></div>}
      <div className="login-field">
        <div className="login-password-label"><label htmlFor="auth-password">{recoveryMode ? "New password" : "Password"}</label>{mode === "login" && !recoveryMode && <button type="button" className="link-button" onClick={requestPasswordReset} disabled={busy || !supabaseConfigured || cooldown > 0}>{cooldown > 0 ? `Wait ${cooldown}s` : "Forgot password?"}</button>}</div>
        <div className="login-input"><LockKeyhole size={16} /><input id="auth-password" type={showPassword ? "text" : "password"} autoComplete={recoveryMode ? "new-password" : mode === "register" ? "new-password" : "current-password"} placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} disabled={!supabaseConfigured || busy} /><button type="button" className="password-eye" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
      </div>
      {(mode === "register" || recoveryMode) && <div className="login-field"><label htmlFor="auth-confirm-password">Confirm password</label><div className="login-input"><LockKeyhole size={16} /><input id="auth-confirm-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Re-enter your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={!supabaseConfigured || busy} /></div></div>}
      {error && <div className="login-message login-message--error" role="alert">{error}</div>}
      {message && <div className="login-message" role="status"><ShieldCheck size={15} />{message}</div>}
      {mode === "register" && cooldown > 0 && <p className="verification-help" role="status">Registration is temporarily paused after an email rate limit. Try again in {cooldown}s; do not submit repeated signup requests.</p>}
      <button type="submit" className="button button--primary login-submit" disabled={busy || !supabaseConfigured || (mode === "register" && cooldown > 0)}>
        {busy ? <><span className="button-spinner" /> Working…</> : <>{recoveryMode ? "Update password" : mode === "register" ? "Create account" : "Sign in"} <ArrowRight size={16} /></>}
      </button>
      {recoveryMode && <Link className="login-auth-switch" to="/login">Return to sign in</Link>}
    </form>
  );
}
