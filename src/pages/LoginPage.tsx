import { useState, type FormEvent } from "react";
import { ArrowRight, Database, Eye, EyeOff, LockKeyhole, Mail, MapPin, ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Brand } from "../components/Brand";
import { StatusMessage } from "../components/Ui";
import { supabase, supabaseConfigured } from "../lib/supabase";

type AuthMode = "login" | "register";

export function LoginPage({ mode }: { mode: AuthMode }) {
  const [searchParams] = useSearchParams();
  const recoveryMode = searchParams.get("recovery") === "1";

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
            <div className="archive-map-empty">Read-only historic records and map locations are available after authentication.</div>
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
            ? "Choose a new password for your account."
            : mode === "register"
              ? "Register with your email to access the read-only historical archive. Email verification may be required."
              : "Sign in to access the read-only historical archive."}</p>
          <div className="agency-identity"><div className="agency-seal"><MapPin size={17} /></div><div><strong>San Francisco Fire Incidents</strong><small>Public historical records · no operational data</small></div></div>
          {!supabaseConfigured && <StatusMessage tone="warning"><Database size={15} /><span><strong>Authentication is not configured.</strong> Add the Supabase project URL and publishable key to your local <code>.env.local</code> file, then restart the app.</span></StatusMessage>}
          <AuthForm mode={mode} recoveryMode={recoveryMode} />
          {!recoveryMode && <div className="login-auth-switch">{mode === "register" ? <>Already registered? <Link to="/login">Sign in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}</div>}
          <div className="login-security"><ShieldCheck size={14} /><span>Supabase-managed authentication</span><i /> No service-role key in browser</div>
          <p className="login-legal">This is not an emergency service. It has no agency identity provider, live incident feed, CAD, responder GPS, or 911 connection. Registration grants archive access only and does not create agency authorization.</p>
        </div>
        <footer className="login-auth__footer"><span>ResQAI · Public archive</span><nav><a href="https://data.sfgov.org/d/wr8u-xric" target="_blank" rel="noreferrer">City dataset</a></nav></footer>
      </section>
    </main>
  );
}

function AuthForm({ mode, recoveryMode }: { mode: AuthMode; recoveryMode: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
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
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          navigate("/overview", { replace: true });
        } else {
          setMessage("Account request received. Check your email for the verification link before signing in.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (signInError) throw signInError;
        const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
        navigate(from && from !== "/login" && from !== "/register" ? from : "/overview", { replace: true });
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed. Try again or contact the project administrator.");
    } finally {
      setBusy(false);
    }
  }

  async function requestPasswordReset() {
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
    setBusy(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/login?recovery=1`,
      });
      if (resetError) throw resetError;
      setMessage("If an account exists for this email, a password reset link has been sent.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Could not request a password reset.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="login-form" onSubmit={submit} noValidate>
      {!recoveryMode && <div className="login-field"><label htmlFor="auth-email">Email</label><div className="login-input"><Mail size={16} /><input id="auth-email" type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={!supabaseConfigured || busy} /></div></div>}
      <div className="login-field">
        <div className="login-password-label"><label htmlFor="auth-password">{recoveryMode ? "New password" : "Password"}</label>{mode === "login" && !recoveryMode && <button type="button" className="link-button" onClick={requestPasswordReset} disabled={busy || !supabaseConfigured}>Forgot password?</button>}</div>
        <div className="login-input"><LockKeyhole size={16} /><input id="auth-password" type={showPassword ? "text" : "password"} autoComplete={recoveryMode ? "new-password" : mode === "register" ? "new-password" : "current-password"} placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} disabled={!supabaseConfigured || busy} /><button type="button" className="password-eye" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
      </div>
      {(mode === "register" || recoveryMode) && <div className="login-field"><label htmlFor="auth-confirm-password">Confirm password</label><div className="login-input"><LockKeyhole size={16} /><input id="auth-confirm-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Re-enter your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={!supabaseConfigured || busy} /></div></div>}
      {error && <div className="login-message login-message--error" role="alert">{error}</div>}
      {message && <div className="login-message" role="status"><ShieldCheck size={15} />{message}</div>}
      <button type="submit" className="button button--primary login-submit" disabled={busy || !supabaseConfigured}>
        {busy ? <><span className="button-spinner" /> Working…</> : <>{recoveryMode ? "Update password" : mode === "register" ? "Create account" : "Sign in"} <ArrowRight size={16} /></>}
      </button>
      {recoveryMode && <Link className="login-auth-switch" to="/login">Return to sign in</Link>}
    </form>
  );
}
