import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const raw = localStorage.getItem('user');
  const user = raw ? JSON.parse(raw) : { name: 'User' };

  useEffect(() => {
    API.get('/employees')
      .then(({ data }) => setEmployees(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avgScore = employees.length
    ? (employees.reduce((s, e) => s + e.performanceScore, 0) / employees.length).toFixed(1)
    : 0;
  const topPerformer = employees[0];
  const depts = [...new Set(employees.map(e => e.department))].length;
  const promotionReady = employees.filter(e => e.performanceScore >= 80).length;

  const recent = [...employees].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <h1>Good {getGreeting()}, <span className="gradient-text">{user.name?.split(' ')[0]} 👋</span></h1>
            <p>Here's your employee performance overview</p>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon cyan">👥</div>
                  <div className="stat-info">
                    <p>{employees.length}</p>
                    <span>Total Employees</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green">📊</div>
                  <div className="stat-info">
                    <p>{avgScore}</p>
                    <span>Avg Performance</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon purple">🏢</div>
                  <div className="stat-info">
                    <p>{depts}</p>
                    <span>Departments</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon amber">🚀</div>
                  <div className="stat-info">
                    <p>{promotionReady}</p>
                    <span>Promotion Ready</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                {/* Top Performer */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>🏆 Top Performer</h3>
                  </div>
                  {topPerformer ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div className="emp-avatar" style={{ width: 52, height: 52, fontSize: 18 }}>
                        {topPerformer.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{topPerformer.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{topPerformer.department}</div>
                        <div style={{ marginTop: 6 }}>
                          <span className="tag tag-green">Score: {topPerformer.performanceScore}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No employees yet</p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>⚡ Quick Actions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Link to="/employees/add" className="btn btn-primary" id="dash-add-emp">➕ Add New Employee</Link>
                    <Link to="/ai" className="btn btn-secondary" id="dash-ai-rec">🤖 Generate AI Recommendations</Link>
                    <Link to="/analytics" className="btn btn-secondary" id="dash-analytics">📈 View Analytics</Link>
                  </div>
                </div>
              </div>

              {/* Recent Employees */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>📋 Recent Employees</h3>
                  <Link to="/employees" className="btn btn-secondary btn-sm">View All</Link>
                </div>
                {recent.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">👤</div>
                    <h3>No employees yet</h3>
                    <p>Start by adding your first employee</p>
                    <Link to="/employees/add" className="btn btn-primary">Add Employee</Link>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>Department</th>
                          <th>Score</th>
                          <th>Experience</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recent.map(emp => (
                          <tr key={emp._id}>
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
                              }}>{emp.performanceScore}</span>
                            </td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{emp.experience} yrs</td>
                            <td>
                              <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/ai?id=${emp._id}`)}>🤖 Analyze</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
