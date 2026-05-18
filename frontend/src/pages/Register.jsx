import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'hr' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      return setError('Passwords do not match');
    }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', {
        name: form.name, email: form.email, password: form.password, role: form.role,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in-up">
        <div className="auth-logo">
          <div className="auth-logo-icon">🧠</div>
          <div className="auth-logo-text">
            <h1>PerfAI</h1>
            <p>HR Analytics Platform</p>
          </div>
        </div>

        <h2 className="auth-title">Create account</h2>
        <p className="auth-subtitle">Start managing employee performance with AI</p>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input id="reg-name" name="name" type="text" className="form-input" placeholder="Jane Smith" value={form.name} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select id="reg-role" name="role" className="form-select" value={form.role} onChange={handle}>
                <option value="hr">HR Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="reg-email" name="email" type="email" className="form-input" placeholder="hr@company.com" value={form.email} onChange={handle} required />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input id="reg-password" name="password" type="password" className="form-input" placeholder="Min 6 characters" value={form.password} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input id="reg-confirm" name="confirm" type="password" className="form-input" placeholder="Repeat password" value={form.confirm} onChange={handle} required />
            </div>
          </div>
          <button id="reg-submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? <><span className="spinner spinner-sm" /> Creating account...</> : '✨ Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
