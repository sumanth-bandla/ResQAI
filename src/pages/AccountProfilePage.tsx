import { useEffect, useRef, useState, type FormEvent } from "react";
import { CalendarDays, Check, Copy, LoaderCircle, Mail, RefreshCw, Save, ShieldCheck, UserRound } from "lucide-react";
import { Card, PageHeader, StatusMessage } from "../components/Ui";
import { supabase } from "../lib/supabase";

type Profile = {
  public_user_id: string;
  full_name: string;
  created_at: string;
  updated_at: string;
};

export function AccountProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const requestInFlight = useRef(false);

  async function loadProfile(isActive: () => boolean = () => true) {
    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { data: userResult, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userResult.user) throw new Error("Your session could not be verified. Sign in again to view your account.");

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("public_user_id, full_name, created_at, updated_at")
        .eq("id", userResult.user.id)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!isActive()) return;
      if (!data) {
        setProfile(null);
        setError("Your profile is not available yet. Ask the project administrator to apply the user profiles migration, then reload this page.");
        return;
      }

      const nextProfile = data as Profile;
      setProfile(nextProfile);
      setFullName(nextProfile.full_name);
      setEmail(userResult.user.email ?? "");
    } catch (loadError) {
      if (isActive()) {
        setError(loadError instanceof Error ? loadError.message : "Could not load your profile. Try again.");
      }
    } finally {
      if (isActive()) setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    void loadProfile(() => active);
    return () => { active = false; };
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInFlight.current || !profile || !supabase) return;
    const normalizedName = fullName.trim();
    if (normalizedName.length < 1 || normalizedName.length > 100) {
      setError("Your full name must contain between 1 and 100 characters.");
      return;
    }

    requestInFlight.current = true;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const { data: userResult, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userResult.user) throw new Error("Your session could not be verified. Sign in again to update your profile.");

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: normalizedName })
        .eq("id", userResult.user.id)
        .select("public_user_id, full_name, created_at, updated_at")
        .single();
      if (updateError) throw updateError;

      const updatedProfile = data as Profile;
      setProfile(updatedProfile);
      setFullName(updatedProfile.full_name);
      setNotice("Your profile was updated. Your public User ID remains unchanged.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save your profile. Try again.");
    } finally {
      requestInFlight.current = false;
      setSaving(false);
    }
  }

  async function copyPublicId() {
    if (!profile) return;
    setError("");
    setNotice("");
    try {
      await navigator.clipboard.writeText(profile.public_user_id);
      setNotice("Public User ID copied.");
    } catch {
      setError("Could not copy the User ID. Select and copy it manually.");
    }
  }

  return (
    <div className="page-stack account-profile">
      <PageHeader
        eyebrow="ACCOUNT / PROFILE"
        title="Your account"
        description="Manage your ResQAI archive account. This profile does not grant agency identity or operational permissions."
      />
      <div className="account-boundary"><ShieldCheck size={15} /><span><strong>Personal archive account</strong> · Supabase email authentication · No agency authorization</span></div>
      {error && <div role="alert"><StatusMessage tone="warning">{error}</StatusMessage></div>}
      {notice && <div role="status"><StatusMessage tone="success"><Check size={14} />{notice}</StatusMessage></div>}
      {loading ? (
        <div className="account-loading" role="status"><LoaderCircle className="spin" size={20} />Loading your account profile…</div>
      ) : profile ? (
        <div className="account-profile-grid">
          <Card title="Public User ID" subtitle="Permanent display identifier generated by the database">
            <div className="account-id-panel">
              <span className="account-id-icon"><ShieldCheck size={18} /></span>
              <code>{profile.public_user_id}</code>
              <button className="button button--secondary" type="button" onClick={() => void copyPublicId()} aria-label="Copy public User ID"><Copy size={14} />Copy</button>
            </div>
            <p className="account-id-note">This identifier is unique to your profile and does not expose your internal authentication ID.</p>
          </Card>
          <Card title="Profile details" subtitle="Only your display name can be changed here">
            <form className="account-profile-form" onSubmit={saveProfile}>
              <label htmlFor="account-full-name">Full name</label>
              <div className="account-input"><UserRound size={15} /><input id="account-full-name" autoComplete="name" maxLength={100} value={fullName} onChange={(event) => setFullName(event.target.value)} disabled={saving} /></div>
              <label htmlFor="account-email">Email address</label>
              <div className="account-input account-input--readonly"><Mail size={15} /><input id="account-email" type="email" value={email} readOnly aria-describedby="account-email-note" /></div>
              <small id="account-email-note">Email changes are managed by Supabase Auth and are not available on this page.</small>
              <button className="button button--primary" type="submit" disabled={saving || !fullName.trim() || fullName.trim() === profile.full_name}>
                {saving ? <><LoaderCircle className="spin" size={14} />Saving…</> : <><Save size={14} />Save profile</>}
              </button>
            </form>
          </Card>
          <Card title="Account details" subtitle="Identity and profile lifecycle">
            <div className="account-meta-list">
              <div><CalendarDays size={15} /><span><small>Account created</small><strong>{formatDate(profile.created_at)}</strong></span></div>
              <div><RefreshCw size={15} /><span><small>Profile last updated</small><strong>{formatDate(profile.updated_at)}</strong></span></div>
              <div><ShieldCheck size={15} /><span><small>Authentication</small><strong>Supabase email account</strong></span></div>
            </div>
          </Card>
        </div>
      ) : (
        !error && <StatusMessage tone="warning">Your profile could not be found. Reload the page or contact the project administrator.</StatusMessage>
      )}
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unavailable"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}
