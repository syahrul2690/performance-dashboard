import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotif } from '../context/NotifContext';
import {
  LayoutDashboard, DollarSign, Settings, Activity, Target,
  Users, CheckSquare, AlertTriangle, FileText, ClipboardList,
  Bell, Moon, Sun, LogOut, ChevronDown, Menu, X,
  Zap, Search, Download,
} from 'lucide-react';

const NAV_ITEMS = [
  { section: 'Aksi Saya', items: [
    { to: '/approvals', label: 'Persetujuan', icon: CheckSquare },
    { to: '/input-realisasi', label: 'Input Realisasi', icon: ClipboardList },
  ]},
  { section: 'Dashboard', items: [
    { to: '/', label: 'Executive Summary', icon: LayoutDashboard, end: true },
    { to: '/financial', label: 'Cost & Capex', icon: DollarSign },
    { to: '/operational', label: 'Operasional KPI', icon: Activity },
    { to: '/strategic', label: 'Target Strategis', icon: Target },
    { to: '/human-capital', label: 'Human Capital', icon: Users },
    { to: '/risk', label: 'Manajemen Risiko', icon: AlertTriangle },
  ]},
  { section: 'Workflow KM', items: [
    { to: '/workflow-km/usulan', label: 'Usulan KM', icon: FileText },
    { to: '/workflow-km/realisasi', label: 'Realisasi KM', icon: FileText },
  ]},
  { section: 'Pengaturan', items: [
    { to: '/settings', label: 'Pengaturan', icon: Settings },
  ]},
];

const ROLE_LABELS: Record<string, string> = {
  STAFF: 'Staff', ASMAN: 'Asman', MANAJER: 'Manajer',
  SRMANAJER: 'Sr. Manajer', GM: 'GM',
};

export function AppShell() {
  const { user, logout, viewAs, setViewAs } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const { items: notifs, unreadCount, markAllRead } = useNotif();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [warRoomActive, setWarRoomActive] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = () => { setNotifOpen(false); setUserMenuOpen(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/brand/logo_pln_simpp_data.png" alt="SIMPP" className="sidebar-logo" />
          {sidebarOpen && <span className="sidebar-brand">PUSMANPRO</span>}
          <button className="sidebar-toggle btn-ghost" onClick={() => setSidebarOpen((v) => !v)}>
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((section) => (
            <div key={section.section} className="nav-section">
              {sidebarOpen && <div className="nav-section-label">{section.section}</div>}
              {section.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  title={!sidebarOpen ? label : undefined}
                >
                  <Icon size={18} />
                  {sidebarOpen && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main column */}
      <div className="main-column">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="btn btn-primary btn-sm war-room-btn"
              onClick={() => setWarRoomActive(true)}
            >
              <Zap size={14} /> War Room
            </button>
          </div>

          <div className="topbar-right">
            {/* View As */}
            {user && (
              <div className="topbar-item view-as" onClick={(e) => e.stopPropagation()}>
                <span className={`role-badge role-${user.role.toLowerCase()}`}>
                  {viewAs ? ROLE_LABELS[viewAs] ?? viewAs : ROLE_LABELS[user.role] ?? user.role}
                </span>
                <select
                  className="view-as-select"
                  value={viewAs ?? user.role}
                  onChange={(e) => setViewAs(e.target.value === user.role ? null : e.target.value)}
                >
                  {Object.entries(ROLE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Search */}
            <button className="btn-ghost topbar-icon" title="Ctrl+K">
              <Search size={18} />
            </button>

            {/* Export */}
            <button className="btn-ghost topbar-icon" title="Export">
              <Download size={18} />
            </button>

            {/* Theme toggle */}
            <button className="btn-ghost topbar-icon" onClick={toggleTheme} title="Toggle tema">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Notifications */}
            <div className="topbar-item" onClick={(e) => { e.stopPropagation(); setNotifOpen((v) => !v); }}>
              <button className="btn-ghost topbar-icon notif-btn">
                <Bell size={18} />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </button>
              {notifOpen && (
                <div className="notif-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="notif-header">
                    <span>Notifikasi</span>
                    <button className="btn-ghost btn-sm" onClick={markAllRead}>Tandai semua dibaca</button>
                  </div>
                  <div className="notif-list">
                    {notifs.length === 0 && <div className="notif-empty">Tidak ada notifikasi</div>}
                    {notifs.map((n) => (
                      <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}
                        onClick={() => { if (n.route) navigate(n.route); setNotifOpen(false); }}
                      >
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-msg">{n.msg}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="topbar-item" onClick={(e) => { e.stopPropagation(); setUserMenuOpen((v) => !v); }}>
              <button className="btn-ghost user-menu-btn">
                <span className="avatar">{user?.name?.[0] ?? '?'}</span>
                {user && <span className="user-name">{user.name}</span>}
                <ChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div className="user-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="user-dropdown-info">
                    <div className="user-dropdown-name">{user?.name}</div>
                    <div className="user-dropdown-email">{user?.email}</div>
                  </div>
                  <NavLink to="/settings" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <Settings size={14} /> Pengaturan
                  </NavLink>
                  <button className="user-dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={14} /> Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* War Room overlay */}
      {warRoomActive && (
        <div className="warroom-overlay">
          <button className="warroom-close btn-ghost" onClick={() => setWarRoomActive(false)}>
            <X size={24} />
          </button>
          <div className="warroom-placeholder">
            <Zap size={48} />
            <p>War Room — Coming in next build</p>
          </div>
        </div>
      )}
    </div>
  );
}
