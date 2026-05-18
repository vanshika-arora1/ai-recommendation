import { NavLink, useNavigate } from 'react-router-dom';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/employees', label: 'Employees', icon: '👥' },
  { to: '/employees/add', label: 'Add Employee', icon: '➕' },
  { to: '/ai', label: 'AI Recommendations', icon: '🤖' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const raw = localStorage.getItem('user');
  const user = raw ? JSON.parse(raw) : { name: 'User', role: 'hr' };

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🧠</div>
        <div className="sidebar-logo-text">
          <h2>PerfAI</h2>
          <span>HR Analytics Platform</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-pill">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <p>{user.name}</p>
            <span>{user.role?.toUpperCase()}</span>
          </div>
        </div>
        <button className="btn-logout" onClick={logout}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
