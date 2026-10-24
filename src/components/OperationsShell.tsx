import { useState } from "react";
import {
  Activity, BookOpenCheck, ClipboardCheck, Database, LayoutDashboard, LifeBuoy, LogOut, Map as MapIcon,
  Menu, Search, Settings, Siren, Users, UserRound, X,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Brand } from "./Brand";
import { DemoFooter, StatusMessage } from "./Ui";

const archiveNavigation = [
  { to: "/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/incidents", label: "Public records", icon: Siren },
  { to: "/map", label: "Historical map", icon: MapIcon },
  { to: "/analytics", label: "Archive analytics", icon: Activity },
];
const trainingNavigation = [
  { to: "/training/review", label: "Manual review exercise", icon: ClipboardCheck },
  { to: "/training/dispatch", label: "Dispatch simulator", icon: LifeBuoy },
  { to: "/training/report", label: "Report simulator", icon: BookOpenCheck },
  { to: "/training/activity", label: "Sample activity", icon: Activity },
  { to: "/training/team", label: "Sample team", icon: Users },
  { to: "/training/settings", label: "Training settings", icon: Settings },
];

export function OperationsShell({ onSignOut }: { onSignOut: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  async function signOut() {
    setSignOutError("");
    try {
      await onSignOut();
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : "Unable to sign out. Please try again.");
    }
  }
  const navLinks = (items: typeof archiveNavigation) => items.map(({ to, label, icon: Icon }) => (
    <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className={({ isActive }) => `side-link${isActive ? " side-link--active" : ""}`}>
      <Icon size={16} strokeWidth={1.8} /><span>{label}</span>
    </NavLink>
  ));

  return (
    <div className="app-frame">
      {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
      <aside className={`sidebar${mobileOpen ? " sidebar--open" : ""}`}>
        <div className="sidebar__brand"><Brand /><button className="sidebar__close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
        <nav className="side-nav" aria-label="Main navigation">
          <div className="nav-section-label">PUBLIC ARCHIVE</div>
          {navLinks(archiveNavigation)}
          <NavLink to="/sources" onClick={() => setMobileOpen(false)} className={({ isActive }) => `side-link${isActive ? " side-link--active" : ""}`}><Database size={16} strokeWidth={1.8} /><span>Sources & setup</span></NavLink>
          <NavLink to="/account" onClick={() => setMobileOpen(false)} className={({ isActive }) => `side-link${isActive ? " side-link--active" : ""}`}><UserRound size={16} strokeWidth={1.8} /><span>My account</span></NavLink>
          <div className="nav-separator" />
          <div className="nav-section-label">SEPARATE TRAINING DEMOS</div>
          {navLinks(trainingNavigation)}
        </nav>
        <div className="sidebar__bottom">
          <div className="archive-boundary-card"><Database size={14} /><strong>Read-only archive</strong><small>No live agency systems connected</small></div>
          <Link className="sidebar-source-link" to="/sources"><Database size={13} /> Data source details</Link>
          <button className="sidebar-source-link sidebar-signout" onClick={() => void signOut()}><LogOut size={13} /> Sign out</button>
        </div>
      </aside>
      <div className="app-column">
        <header className="topbar">
          <button className="mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={19} /></button>
          <div className="topbar__location"><span className="agency-mark"><Database size={13} /></span><strong>San Francisco</strong><span className="topbar-divider">/</span><span>Public historical archive</span></div>
          <div className="topbar__tools">
            <span className="demo-workspace">PUBLIC DATA · READ ONLY</span>
            <Link className="global-search" to="/incidents"><Search size={14} /><span>Search public records</span></Link>
            <span className="archive-status"><i /> CLOSED RECORDS ONLY</span>
          </div>
        </header>
        <main className="page-main"><Outlet /></main>
        {signOutError && <div className="signout-error"><StatusMessage tone="warning">{signOutError}</StatusMessage></div>}
        <DemoFooter />
      </div>
      <nav className="mobile-bottom-nav" aria-label="Archive navigation">
        {archiveNavigation.slice(0, 4).map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `mobile-bottom-nav__link${isActive ? " is-active" : ""}`}><Icon size={17} /><span>{label}</span></NavLink>
        ))}
      </nav>
    </div>
  );
}
