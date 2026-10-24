import { useEffect, useRef, useState } from "react";
import { ArrowRight, CircleCheck, LoaderCircle, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Brand } from "../components/Brand";
import { supabase } from "../lib/supabase";

type CallbackState =
  | { status: "checking" }
  | { status: "success" }
  | { status: "error"; message: string };

function clearCallbackCredentials(pathname: string) {
  window.history.replaceState(null, document.title, pathname);
}

async function verifyCallback(url: URL): Promise<CallbackState> {
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  const hasCallbackError = url.searchParams.has("error")
    || url.searchParams.has("error_description")
    || hash.has("error")
    || hash.has("error_description");

  if (hasCallbackError) {
    clearCallbackCredentials(url.pathname);
    return {
      status: "error",
      message: "This verification link is invalid, expired, or has already been used. Return to sign in if you have already verified, or request a fresh link from registration.",
    };
  }

  if (!supabase) {
    return { status: "error", message: "Account verification is unavailable because Supabase is not configured in this app." };
  }

  try {
    const tokenHash = url.searchParams.get("token_hash");
    const verificationType = url.searchParams.get("type");
    let session;
    if (tokenHash) {
      if (verificationType !== "signup" && verificationType !== "email") {
        throw new Error("Unsupported verification type.");
      }
      const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: verificationType });
      if (error) throw error;
      session = data.session;
    } else {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      session = data.session;
    }
    if (!session) throw new Error("No verified session was returned.");
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!data.user?.email_confirmed_at) throw new Error("The email has not been confirmed.");
    clearCallbackCredentials(url.pathname);
    return { status: "success" };
  } catch {
    clearCallbackCredentials(url.pathname);
    return {
      status: "error",
      message: "We couldn't verify this link. It may be expired, invalid, already used, or missing from the Supabase redirect allow-list. Request a fresh link or sign in if your email is already verified.",
    };
  }
}

export function AuthCallbackPage() {
  const [state, setState] = useState<CallbackState>({ status: "checking" });
  const [signingOut, setSigningOut] = useState(false);
  const verificationRef = useRef<Promise<CallbackState> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    if (!verificationRef.current) {
      verificationRef.current = verifyCallback(new URL(window.location.href));
    }
    void verificationRef.current.then((result) => {
      if (active) setState(result);
    });
    return () => { active = false; };
  }, []);

  async function continueToSignIn() {
    setSigningOut(true);
    try {
      if (supabase) {
        const { error } = await supabase.auth.signOut({ scope: "local" });
        if (error) throw error;
      }
      navigate("/login", { replace: true });
    } catch {
      setState({ status: "error", message: "Your email is verified, but we couldn't end this browser session. Close this tab and return to sign in." });
      setSigningOut(false);
    }
  }

  return (
    <main className="auth-result-page">
      <section className="auth-result-panel" aria-live="polite">
        <Brand />
        {state.status === "checking" ? (
          <>
            <LoaderCircle className="spin" size={25} aria-hidden="true" />
            <h1>Verifying your email</h1>
            <p>Please wait while Supabase checks this verification link.</p>
          </>
        ) : state.status === "success" ? (
          <>
            <CircleCheck className="auth-result-icon auth-result-icon--success" size={30} aria-hidden="true" />
            <h1>Email verified</h1>
            <p>Your email address has been confirmed. You can now sign in to the ResQAI historical archive.</p>
            <button className="button button--primary" type="button" onClick={() => void continueToSignIn()} disabled={signingOut}>
              {signingOut ? <><span className="button-spinner" /> Returning…</> : <>Continue to sign in <ArrowRight size={15} /></>}
            </button>
          </>
        ) : (
          <>
            <ShieldAlert className="auth-result-icon auth-result-icon--error" size={30} aria-hidden="true" />
            <h1>Verification link not accepted</h1>
            <p role="alert">{state.message}</p>
            <div className="auth-result-actions">
              <button className="button button--secondary" type="button" onClick={() => navigate("/login", { replace: true })}>Return to sign in</button>
              <button className="button button--primary" type="button" onClick={() => navigate("/register", { replace: true })}>Return to registration</button>
            </div>
          </>
        )}
        <small>ResQAI is a non-operational historical public-records demonstration.</small>
      </section>
    </main>
  );
}
