import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Database, LoaderCircle } from "lucide-react";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { OperationsShell } from "./components/OperationsShell";
import { LoginPage } from "./pages/LoginPage";
import { OverviewPage } from "./pages/OverviewPage";
import { IncidentsPage } from "./pages/IncidentsPage";
import { IncidentDetailPage } from "./pages/IncidentDetailPage";
import { NewIncidentPage } from "./pages/NewIncidentPage";
import { ReviewPage } from "./pages/ReviewPage";
import { MapPage } from "./pages/MapPage";
import { DispatchPage } from "./pages/DispatchPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { GenericPage } from "./pages/GenericPage";
import { MobilePage } from "./pages/MobilePage";
import { SourcesPage } from "./pages/SourcesPage";
import { TrainingIncidentPage } from "./pages/TrainingIncidentPage";
import { AppStateProvider } from "./state";
import { PublicDataProvider } from "./dataContext";
import { supabase, supabaseConfigured } from "./lib/supabase";

function App() {
  const location = useLocation();
  const recoveryMode = new URLSearchParams(location.search).get("recovery") === "1";
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(supabaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setAuthError(error.message);
        setSession(null);
      } else {
        setSession(data.session);
      }
      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    document.title = location.pathname.startsWith("/mobile")
      ? "ResQAI — Mobile training simulator"
      : location.pathname === "/register"
        ? "ResQAI — Create account"
        : location.pathname === "/login"
          ? "ResQAI — Sign in"
          : "ResQAI — Historical public archive";
  }, [location.pathname]);

  return (
    <Routes>
          <Route path="/login" element={authLoading ? <AuthChecking /> : session && !recoveryMode ? <Navigate to="/overview" replace /> : <LoginPage mode="login" />} />
          <Route path="/register" element={authLoading ? <AuthChecking /> : session ? <Navigate to="/overview" replace /> : <LoginPage mode="register" />} />
          <Route element={<RequireAuth session={session} loading={authLoading} error={authError} />}>
            <Route path="/mobile" element={<MobilePage mode="overview" />} />
            <Route path="/mobile/incidents/:id" element={<MobilePage mode="incident" />} />
            <Route path="/mobile/review/:id" element={<MobilePage mode="review" />} />
            <Route path="/" element={<OperationsShell onSignOut={async () => { const { error } = await supabase!.auth.signOut(); if (error) throw error; }} />}>
              <Route index element={<Navigate to="/overview" replace />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="incidents" element={<IncidentsPage />} />
              <Route path="incidents/new" element={<Navigate to="/sources" replace />} />
              <Route path="incidents/public/:id" element={<IncidentDetailPage />} />
              <Route path="incidents/:id" element={<IncidentDetailPage />} />
              <Route path="training/report" element={<NewIncidentPage />} />
              <Route path="training/incidents/:id" element={<TrainingIncidentPage />} />
              <Route path="review" element={<Navigate to="/training/review" replace />} />
              <Route path="training/review" element={<ReviewPage />} />
              <Route path="training/settings" element={<SettingsPage />} />
              <Route path="training/team" element={<GenericPage section="team" />} />
              <Route path="training/activity" element={<GenericPage section="activity" />} />
              <Route path="settings" element={<Navigate to="/training/settings" replace />} />
              <Route path="team" element={<Navigate to="/training/team" replace />} />
              <Route path="activity" element={<Navigate to="/training/activity" replace />} />
              <Route path="map" element={<MapPage />} />
              <Route path="dispatch" element={<Navigate to="/training/dispatch" replace />} />
              <Route path="training/dispatch" element={<DispatchPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="sources" element={<SourcesPage />} />
              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Route>
          </Route>
    </Routes>
  );
}

function RequireAuth({ session, loading, error }: { session: Session | null; loading: boolean; error: string | null }) {
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return <main className="auth-gate"><LoaderCircle className="spin" size={22} /><span>Checking your Supabase session…</span></main>;
  }

  if (error) {
    return <main className="auth-gate auth-gate--error"><Database size={22} /><h1>Could not check account session</h1><p>{error}</p><button className="button button--secondary" onClick={() => navigate("/login", { replace: true })}>Return to sign in</button></main>;
  }

  return session
    ? <PublicDataProvider><AppStateProvider><Outlet /></AppStateProvider></PublicDataProvider>
    : <Navigate to="/login" state={{ from: location }} replace />;
}

function AuthChecking() {
  return <main className="auth-gate"><LoaderCircle className="spin" size={22} /><span>Checking your Supabase session…</span></main>;
}

export default App;
