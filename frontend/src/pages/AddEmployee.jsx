import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';

const DEPARTMENTS = ['Development', 'Design', 'Marketing', 'HR', 'Finance', 'Sales', 'Operations', 'QA', 'DevOps'];

export default function AddEmployee() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', department: 'Development',
    performanceScore: '', experience: '', skillInput: '',
  });
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const addSkill = () => {
    const s = form.skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills(prev => [...prev, s]);
      setForm(f => ({ ...f, skillInput: '' }));
    }
  };

  const removeSkill = (s) => setSkills(prev => prev.filter(x => x !== s));

  const handleSkillKey = e => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); }
  };

  const submit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.name || !form.email || !form.department || form.performanceScore === '' || form.experience === '') {
      return setError('All fields are required');
    }
    setLoading(true);
    try {
      await API.post('/employees', {
        name: form.name,
        email: form.email,
        department: form.department,
        skills,
        performanceScore: Number(form.performanceScore),
        experience: Number(form.experience),
      });
      setSuccess('Employee added successfully! 🎉');
      setTimeout(() => navigate('/employees'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const score = Number(form.performanceScore);
  const scoreColor = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : score > 0 ? 'var(--red)' : 'var(--text-muted)';

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-container" style={{ maxWidth: 720 }}>
          <div className="page-header">
            <h1>➕ <span className="gradient-text">Add Employee</span></h1>
            <p>Register a new employee into the performance system</p>
          </div>

          <div className="card">
            {error && <div className="alert alert-error">⚠ {error}</div>}
            {success && <div className="alert alert-success">✅ {success}</div>}

            <form onSubmit={submit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input id="add-name" name="name" className="form-input" placeholder="Aman Verma" value={form.name} onChange={handle} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input id="add-email" name="email" type="email" className="form-input" placeholder="aman@gmail.com" value={form.email} onChange={handle} required />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select id="add-dept" name="department" className="form-select" value={form.department} onChange={handle}>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Years of Experience *</label>
                  <input id="add-exp" name="experience" type="number" min="0" max="50" className="form-input" placeholder="3" value={form.experience} onChange={handle} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Performance Score (0 – 100) *</span>
                  <span style={{ color: scoreColor, fontWeight: 700 }}>{form.performanceScore || '—'}</span>
                </label>
                <input
                  id="add-score"
                  name="performanceScore"
                  type="range" min="0" max="100"
                  className="form-input"
                  style={{ padding: 0, height: 6, cursor: 'pointer', accentColor: 'var(--cyan)' }}
                  value={form.performanceScore || 0}
                  onChange={handle}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  <span>0 — Needs Work</span><span>50 — Average</span><span>100 — Excellent</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Skills</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    id="add-skill-input"
                    name="skillInput"
                    className="form-input"
                    placeholder="Type skill and press Enter or comma (e.g. React)"
                    value={form.skillInput}
                    onChange={handle}
                    onKeyDown={handleSkillKey}
                  />
                  <button type="button" className="btn btn-secondary" onClick={addSkill}>Add</button>
                </div>
                <p className="form-hint">Press Enter or comma to add each skill</p>
                {skills.length > 0 && (
                  <div className="tags-wrap" style={{ marginTop: 10 }}>
                    {skills.map(s => (
                      <span key={s} className="tag" style={{ cursor: 'pointer' }} onClick={() => removeSkill(s)}>
                        {s} ✕
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <hr className="divider" />

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/employees')}>Cancel</button>
                <button id="add-submit" type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner spinner-sm" /> Saving...</> : '💾 Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
