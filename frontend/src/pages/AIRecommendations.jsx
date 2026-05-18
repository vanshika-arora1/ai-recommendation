import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';

export default function AIRecommendations() {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('id');
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState(preselectedId || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [empLoading, setEmpLoading] = useState(true);

  useEffect(() => {
    API.get('/employees').then(({ data }) => setEmployees(data.data || [])).catch(() => {}).finally(() => setEmpLoading(false));
  }, []);

  useEffect(() => { if (preselectedId) setSelectedId(preselectedId); }, [preselectedId]);

  const generate = async () => {
    if (!selectedId) return setError('Please select an employee');
    setError(''); setResult(null); setLoading(true);
    try {
      const { data } = await API.post('/ai/recommend', { employeeId: selectedId });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'AI error. Please add your OpenRouter API key in backend .env');
    } finally {
      setLoading(false);
    }
  };

  const selected = employees.find(e => e._id === selectedId);
  const rec = result?.recommendation;
  const ratingColor = { Excellent: 'var(--green)', Good: 'var(--cyan)', Average: 'var(--amber)', 'Needs Improvement': 'var(--red)' };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <h1>🤖 <span className="gradient-text">AI Recommendations</span></h1>
            <p>Generate AI-powered promotion, training, and feedback insights</p>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Select Employee for Analysis</h3>
            {empLoading ? <div className="loading-center" style={{ padding: 20 }}><div className="spinner" /></div> : (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <select id="ai-emp-select" className="form-select" style={{ flex: 1, minWidth: 240 }} value={selectedId}
                  onChange={e => { setSelectedId(e.target.value); setResult(null); setError(''); }}>
                  <option value="">— Choose an employee —</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.name} — {e.department} (Score: {e.performanceScore})</option>)}
                </select>
                <button id="ai-generate-btn" className="btn btn-primary glow-pulse" onClick={generate} disabled={loading || !selectedId}>
                  {loading ? <><span className="spinner spinner-sm" /> Analyzing...</> : '✨ Generate Analysis'}
                </button>
              </div>
            )}
            {error && <div className="alert alert-error" style={{ marginTop: 12 }}>⚠ {error}</div>}
          </div>

          {selected && (
            <div className="card" style={{ marginBottom: 20, background: 'var(--gradient-card)', borderColor: 'var(--border-hover)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="emp-avatar" style={{ width: 52, height: 52, fontSize: 18 }}>
                  {selected.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{selected.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    🏢 {selected.department} &nbsp;·&nbsp; ⏱ {selected.experience} yrs &nbsp;·&nbsp; ✉ {selected.email}
                  </div>
                  <div className="tags-wrap" style={{ marginTop: 8 }}>
                    {selected.skills.map(s => <span key={s} className="tag">{s}</span>)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: selected.performanceScore >= 75 ? 'var(--green)' : selected.performanceScore >= 50 ? 'var(--amber)' : 'var(--red)' }}>
                    {selected.performanceScore}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Performance Score</div>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-secondary)' }}>AI is analyzing employee data...</p>
            </div>
          )}

          {rec && !loading && (
            <div className="ai-result fade-in-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800 }}>🧠 AI Analysis Results</h2>
                {rec.overallRating && (
                  <span style={{ padding: '6px 14px', borderRadius: 999, fontWeight: 700, fontSize: 13, color: ratingColor[rec.overallRating] || 'var(--cyan)', background: 'var(--bg-secondary)', border: `1px solid ${ratingColor[rec.overallRating] || 'var(--cyan)'}33` }}>
                    ⭐ {rec.overallRating}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 18, border: '1px solid var(--border)' }}>
                  <div className="ai-section-title">🚀 Promotion Recommendation</div>
                  {rec.promotionRecommendation && (
                    <>
                      <div className={`ai-badge-promo ${rec.promotionRecommendation.eligible ? 'yes' : 'no'}`} style={{ marginBottom: 12 }}>
                        {rec.promotionRecommendation.eligible ? '✅ Eligible for Promotion' : '❌ Not Ready Yet'}
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rec.promotionRecommendation.reason}</p>
                    </>
                  )}
                </div>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 18, border: '1px solid var(--border)' }}>
                  <div className="ai-section-title">📊 Performance Summary</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    <div>👤 <strong>{result.employee?.name}</strong></div>
                    <div>🏢 {result.employee?.department}</div>
                    <div>📈 Score: <strong style={{ color: 'var(--cyan)' }}>{result.employee?.performanceScore}/100</strong></div>
                    <div>⏱ {result.employee?.experience} years experience</div>
                  </div>
                </div>
              </div>

              {rec.trainingSuggestions?.length > 0 && (
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 18, border: '1px solid var(--border)', marginBottom: 16 }}>
                  <div className="ai-section-title">📚 Training Suggestions</div>
                  <div className="tags-wrap">
                    {rec.trainingSuggestions.map((t, i) => <span key={i} className="training-chip">📌 {t}</span>)}
                  </div>
                </div>
              )}

              {rec.aiFeedback && (
                <div>
                  <div className="ai-section-title">💬 AI Feedback</div>
                  <div className="ai-feedback-box">{rec.aiFeedback}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
