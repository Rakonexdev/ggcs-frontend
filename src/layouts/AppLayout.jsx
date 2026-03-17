import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  User, 
  Files, 
  Clock, 
  FileText, 
  BadgeDollarSign, 
  Wallet, 
  TrendingUp, 
  Users, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const navSections = [
  {
    title: 'Main',
    items: [
      { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    ],
  },
  {
    title: 'CRM',
    items: [
      { to: '/companies', icon: <Building2 size={20} />, label: 'Companies' },
      { to: '/persons', icon: <User size={20} />, label: 'Persons' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/projects', icon: <Files size={20} />, label: 'Projects' },
      { to: '/timesheets', icon: <Clock size={20} />, label: 'Timesheets' },
    ],
  },
  {
    title: 'Finance',
    items: [
      { to: '/invoices', icon: <FileText size={20} />, label: 'Invoices' },
      { to: '/collections', icon: <BadgeDollarSign size={20} />, label: 'Collections' },
      { to: '/expenses', icon: <Wallet size={20} />, label: 'Expenses' },
    ],
  },
  {
    title: 'Reports',
    items: [
      { to: '/reports', icon: <TrendingUp size={20} />, label: 'Reports' },
    ],
  },
  {
    title: 'Admin',
    items: [
      { to: '/users', icon: <Users size={20} />, label: 'Users' },
      { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    ],
  },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar overlay is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  const roleName = user?.roles?.[0]?.name || 'User';

  // Get current page title from nav sections
  const currentPage = navSections
    .flatMap((s) => s.items)
    .find((item) =>
      item.to === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(item.to)
    );
  const pageTitle = currentPage?.label || '';

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">GG</div>
          <h1>GGCS</h1>
          {/* Close button visible only on mobile */}
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div className="sidebar-section" key={section.title}>
              <div className="sidebar-section-title">{section.title}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{roleName}</div>
            </div>
            <button className="btn-icon" onClick={handleLogout} title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="main-header">
          <button
            className="btn-icon hamburger-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
          <h2 className="header-title">{pageTitle}</h2>
          <div className="header-right">
            <span className="header-role">{roleName}</span>
            <div className="header-avatar" onClick={handleLogout} title="Logout">
              {initials}
            </div>
          </div>
        </header>
        <main className="main-content animate-fade">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
