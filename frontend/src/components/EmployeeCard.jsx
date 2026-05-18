export default function EmployeeCard({ employee, rank, onDelete, onAI }) {
  const { _id, name, email, department, skills = [], performanceScore, experience } = employee;

  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const scoreClass = performanceScore >= 75 ? 'high' : performanceScore >= 50 ? 'mid' : 'low';
  const scoreColor = performanceScore >= 75 ? 'var(--green)' : performanceScore >= 50 ? 'var(--amber)' : 'var(--red)';

  const rankLabel = rank === 1 ? '🥇 #1' : rank === 2 ? '🥈 #2' : rank === 3 ? '🥉 #3' : `#${rank}`;
  const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-n';

  return (
    <div className="emp-card fade-in-up">
      <div className="emp-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="emp-avatar">{initials}</div>
          <div>
            <div className="emp-name">{name}</div>
            <div className="emp-dept">🏢 {department}</div>
          </div>
        </div>
        {rank && <span className={`rank-badge ${rankClass}`}>{rankLabel}</span>}
      </div>

      <div style={{ marginBottom: 12 }}>
        <div className="score-bar">
          <div className="score-bar-track">
            <div
              className={`score-bar-fill ${scoreClass}`}
              style={{ width: `${performanceScore}%` }}
            />
          </div>
          <span className="score-val" style={{ color: scoreColor }}>{performanceScore}</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Performance Score</div>
      </div>

      <div className="tags-wrap" style={{ marginBottom: 14 }}>
        {skills.slice(0, 4).map(s => <span key={s} className="tag">{s}</span>)}
        {skills.length > 4 && <span className="tag tag-purple">+{skills.length - 4}</span>}
        {skills.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No skills listed</span>}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
        ⏱ {experience} yr{experience !== 1 ? 's' : ''} exp &nbsp;·&nbsp; ✉ {email}
      </div>

      <div className="emp-card-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => onAI(_id)}>🤖 AI Analysis</button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(_id)}>🗑 Delete</button>
      </div>
    </div>
  );
}
