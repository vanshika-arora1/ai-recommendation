import { useState, useEffect } from 'react';
import API from '../services/api';
import Navbar from '../components/Navbar';

export default function Analytics() {
  const [employees, setEmployees] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rankLoading, setRankLoading] = useState(false);
  const [rankError, setRankError] = useState('');

  useEffect(() => {
    API.get('/employees')
      .then(({ data }) => setEmployees(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const generateRankings = async () => {
    setRankLoading(true); setRankError('');
    try {
      const { data } = await API.post('/ai/rank');
      setRankings(data.rankings || []);
    } catch (err) {
      setRankError(err.response?.data?.message || 'AI ranking failed. Check your OpenRouter API key.');
    } finally {
      setRankLoading(false);
    }
  };

  // Compute dept distribution
  const deptMap = {};
  employees.forEach(e => { deptMap[e.department] = (deptMap[e.department] || 0) + 1; });
  const depts = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);

  // Score distribution buckets
  const buckets = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
  employees.forEach(e => {
    const s = e.performanceScore;
    if (s <= 20) buckets['0-20']++;
    else if (s <= 40) buckets['21-40']++;
    else if (s <= 60) buckets['41-60']++;
    else if (s <= 80) buckets['61-80']++;
    else buckets['81-100']++;
  });

  const maxBucket = Math.max(...Object.values(buckets), 1);
  const maxDept = Math.max(...depts.map(d => d[1]), 1);

  const sorted = [...employees].sort((a, b) => b.performanceScore - a.performanceScore);
  const top5 = sorted.slice(0, 5);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <h1>📈 <span className="gradient-text">Analytics</span></h1>
            <p>Performance insights and employee rankings</p>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="stats-grid" style={{ marginBottom: 24 }}>
                {[
                  { icon: '👥', label: 'Total Employees', val: employees.length, cls: 'cyan' },
                  { icon: '📊', label: 'Avg Score', val: employees.length ? (employees.reduce((s, e) => s + e.performanceScore, 0) / employees.length).toFixed(1) : 0, cls: 'green' },
                  { icon: '🏆', label: 'Top Score', val: sorted[0]?.performanceScore ?? '—', cls: 'amber' },
                  { icon: '🏢', label: 'Departments', val: depts.length, cls: 'purple' },
                ].map(({ icon, label, val, cls }) => (
                  <div key={label} className="stat-card">
                    <div className={`stat-icon ${cls}`}>{icon}</div>
                    <div className="stat-info"><p>{val}</p><span>{label}</span></div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                {/* Score Distribution */}
                <div className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>📊 Score Distribution</h3>
                  <div className="bar-chart">
                    {Object.entries(buckets).map(([range, count]) => (
                      <div key={range} className="bar-col">
                        <div className="bar-val">{count}</div>
                        <div className="bar-fill" style={{ height: `${(count / maxBucket) * 100}%` }} />
                        <div className="bar-label">{range}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Department Distribution */}
                <div className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🏢 By Department</h3>
                  {depts.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No data yet</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {depts.map(([dept, count]) => (
                        <div key={dept}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                            <span>{dept}</span>
                            <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{count}</span>
                          </div>
                          <div style={{ height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(count / maxDept) * 100}%`, background: 'var(--gradient-main)', borderRadius: 999, transition: 'width 0.6s ease' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Top 5 Leaderboard */}
              <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🏆 Performance Leaderboard</h3>
                {top5.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No employees yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {top5.map((emp, i) => {
                      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
                      const scoreColor = emp.performanceScore >= 75 ? 'var(--green)' : emp.performanceScore >= 50 ? 'var(--amber)' : 'var(--red)';
                      return (
                        <div key={emp._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: 20, minWidth: 30, textAlign: 'center' }}>{medal}</span>
                          <div className="emp-avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
                            {emp.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{emp.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{emp.department} · {emp.experience} yrs</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, fontSize: 18, color: scoreColor }}>{emp.performanceScore}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>/ 100</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* AI Ranking Section */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>🤖 AI Employee Rankings</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>AI-powered ranking with promotion eligibility</p>
                  </div>
                  <button id="analytics-rank-btn" className="btn btn-primary" onClick={generateRankings} disabled={rankLoading || employees.length === 0}>
                    {rankLoading ? <><span className="spinner spinner-sm" /> Ranking...</> : '🤖 Generate AI Rankings'}
                  </button>
                </div>

                {rankError && <div className="alert alert-error">⚠ {rankError}</div>}

                {rankings.length > 0 && (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr><th>Rank</th><th>Employee</th><th>Dept</th><th>Score</th><th>Promotion</th><th>AI Rating</th><th>Key Strength</th></tr>
                      </thead>
                      <tbody>
                        {rankings.map(({ rank, employee: emp, aiInsights }) => {
                          const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                          return (
                            <tr key={emp._id}>
                              <td style={{ fontWeight: 700, fontSize: 16 }}>{medal}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div className="emp-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
                                    {emp.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                                  </div>
                                  <span style={{ fontWeight: 600, fontSize: 13 }}>{emp.name}</span>
                                </div>
                              </td>
                              <td><span className="tag">{emp.department}</span></td>
                              <td><span style={{ fontWeight: 700, color: emp.performanceScore >= 75 ? 'var(--green)' : emp.performanceScore >= 50 ? 'var(--amber)' : 'var(--red)' }}>{emp.performanceScore}</span></td>
                              <td>
                                <span className={`tag ${aiInsights?.promotionEligible ? 'tag-green' : 'tag-red'}`}>
                                  {aiInsights?.promotionEligible ? '✅ Yes' : '❌ No'}
                                </span>
                              </td>
                              <td><span className="tag tag-purple">{aiInsights?.rating || '—'}</span></td>
                              <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 180 }}>{aiInsights?.keyStrength || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {!rankLoading && rankings.length === 0 && !rankError && (
                  <div className="empty-state" style={{ padding: 30 }}>
                    <div className="empty-icon">🤖</div>
                    <h3>No rankings yet</h3>
                    <p>Click "Generate AI Rankings" to rank all employees using AI</p>
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
