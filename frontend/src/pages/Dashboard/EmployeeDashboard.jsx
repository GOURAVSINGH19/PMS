import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/client';
import { Target, Calendar, Inbox, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [probation, setProbation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [goalsRes, probRes] = await Promise.all([
          api.get('/goals'),
          api.get('/probation/me').catch(() => ({ data: null }))
        ]);
        setGoals(goalsRes.data);
        setProbation(probRes.data);
      } catch (e) {}
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  const activeGoals = goals.filter(g => g.status === 'active');
  const avgCompletion = activeGoals.length 
    ? activeGoals.reduce((acc, g) => acc + g.completion_pct, 0) / activeGoals.length 
    : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user.name}</h1>
          <p className="page-subtitle">Here is your performance overview</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon cyan"><Target /></div>
          <div>
            <div className="stat-value">{activeGoals.length}</div>
            <div className="stat-label">Active Goals</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon violet"><CheckCircle /></div>
          <div>
            <div className="stat-value">{Math.round(avgCompletion)}%</div>
            <div className="stat-label">Avg Completion</div>
          </div>
        </div>

        {probation && (
          <div className="stat-card" style={{ borderColor: probation.status === 'active' ? 'var(--accent-green)' : 'var(--accent-gold)' }}>
            <div className="stat-icon green"><Calendar /></div>
            <div>
              <div className="stat-value" style={{ fontSize: 20, paddingTop: 6 }}>Day {Math.min(80, Math.floor((new Date() - new Date(user.doj)) / (1000 * 60 * 60 * 24)))}</div>
              <div className="stat-label">Probation Track</div>
              <div className={`stat-change ${probation.status === 'paused' ? 'down' : 'up'}`}>Status: {probation.status}</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">My Goals Overview</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/goals')}>View All</button>
          </div>
          <div className="card-body">
            {activeGoals.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px' }}>
                <p>No active goals. Time to set some targets!</p>
                <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/goals')}>+ Create Goal</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {activeGoals.slice(0, 3).map(g => (
                  <div key={g.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{g.title}</span>
                      <span>{g.completion_pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${g.completion_pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pending Tasks & Feedback</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/feedback')}>Open Inbox</button>
          </div>
          <div className="card-body">
             <div className="empty-state" style={{ padding: '20px' }}>
                <CheckCircle size={32} style={{ color: 'var(--text-secondary)', marginBottom: 8, opacity: 0.5 }} />
                <p>You're all caught up!</p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
