import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import EmployeeCard from '../components/EmployeeCard';

const DEPARTMENTS = ['All', 'Development', 'Design', 'Marketing', 'HR', 'Finance', 'Sales', 'Operations'];

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [view, setView] = useState('grid');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dept !== 'All') params.append('department', dept);
      if (minScore) params.append('minScore', minScore);
      if (maxScore) params.append('maxScore', maxScore);
      const url = params.toString() ? `/employees/search?${params}` : '/employees';
      const { data } = await API.get(url);
      setEmployees(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, [dept, minScore, maxScore]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    try {
      await API.delete(`/employees/${id}`);
      setEmployees(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1>👥 <span className="gradient-text">Employees</span></h1>
              <p>{filtered.length} employee{filtered.length !== 1 ? 's' : ''} found</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className={`btn btn-secondary btn-sm`} onClick={() => setView(v => v === 'grid' ? 'table' : 'grid')}>
                {view === 'grid' ? '📋 Table' : '🃏 Cards'}
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/employees/add')}>➕ Add Employee</button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="card" style={{ marginBottom: 20, padding: 16 }}>
            <div className="search-bar">
              <div className="search-input-wrap" style={{ flex: 2 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                <input
                  id="emp-search"
                  className="form-input search-input"
                  placeholder="Search by name, email, department..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select id="emp-dept-filter" className="form-select filter-select" value={dept} onChange={e => setDept(e.target.value)}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
              <input
                id="emp-min-score"
                className="form-input"
                style={{ width: 110 }}
                type="number"
                placeholder="Min score"
                min={0} max={100}
                value={minScore}
                onChange={e => setMinScore(e.target.value)}
              />
              <input
                id="emp-max-score"
                className="form-input"
                style={{ width: 110 }}
                type="number"
                placeholder="Max score"
                min={0} max={100}
                value={maxScore}
                onChange={e => setMaxScore(e.target.value)}
              />
              <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setDept('All'); setMinScore(''); setMaxScore(''); }}>Clear</button>
            </div>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No employees found</h3>
              <p>Try adjusting your search or filters</p>
              <button className="btn btn-primary" onClick={() => navigate('/employees/add')}>➕ Add Employee</button>
            </div>
          ) : view === 'grid' ? (
            <div className="employee-grid">
              {filtered.map((emp, i) => (
                <EmployeeCard
                  key={emp._id}
                  employee={emp}
                  rank={i + 1}
                  onDelete={handleDelete}
                  onAI={id => navigate(`/ai?id=${id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Employee</th><th>Department</th>
                    <th>Score</th><th>Experience</th><th>Skills</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp, i) => (
                    <tr key={emp._id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="emp-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                            {emp.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{emp.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="tag">{emp.department}</span></td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: emp.performanceScore >= 75 ? 'var(--green)' : emp.performanceScore >= 50 ? 'var(--amber)' : 'var(--red)'
                        }}>{emp.performanceScore}/100</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{emp.experience} yrs</td>
                      <td>
                        <div className="tags-wrap">
                          {emp.skills.slice(0, 3).map(s => <span key={s} className="tag" style={{ fontSize: 11 }}>{s}</span>)}
                          {emp.skills.length > 3 && <span className="tag tag-purple">+{emp.skills.length - 3}</span>}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/ai?id=${emp._id}`)}>🤖</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp._id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
