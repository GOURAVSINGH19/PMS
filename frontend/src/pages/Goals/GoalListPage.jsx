import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/client';
import { Target, Plus, CheckCircle, Clock } from 'lucide-react';

export default function GoalListPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleApprove = async (id) => {
    try {
      await api.post(`/goals/${id}/approve`, { action: 'approved', comment: 'Approved via dashboard' });
      fetchGoals();
    } catch (e) {}
  };

  const handleSubmit = async (id) => {
    try {
      await api.post(`/goals/${id}/submit`);
      fetchGoals();
    } catch (e) {}
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Goal Management (GMS)</h1>
          <p className="page-subtitle">Align, track, and accomplish objectives</p>
        </div>
        <button className="btn btn-primary"><Plus size={16} /> New Goal</button>
      </div>

      <div className="card">
        <div className="card-header" style={{ paddingBottom: 16 }}>
          <h3 className="card-title">All Objectives</h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Objective Name</th>
                <th>Level</th>
                <th>Weightage</th>
                <th>Status</th>
                <th>Progress</th>
                {(user.role === 'manager' || user.role === 'admin') && <th>Owner ID</th>}
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {goals.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No goals found. Create one to get started.</td>
                </tr>
              )}
              {goals.map(g => (
                <tr key={g.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{g.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{g.description || 'No description'}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{g.level}</span>
                  </td>
                  <td>
                    <span className={`weightage-counter ${g.weightage > 0 ? 'ok' : ''}`}>{g.weightage}%</span>
                  </td>
                  <td>
                    <span className={`badge badge-${g.status.replace('_', '-')}`}>{g.status.replace('_', ' ').toUpperCase()}</span>
                  </td>
                  <td style={{ width: 150 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${g.completion_pct}%` }}></div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{g.completion_pct}%</span>
                    </div>
                  </td>
                  {(user.role === 'manager' || user.role === 'admin') && <td>User {g.owner_id}</td>}
                  <td style={{ textAlign: 'right' }}>
                    {g.status === 'draft' && g.owner_id === user.id && (
                      <button className="btn btn-secondary btn-sm" onClick={() => handleSubmit(g.id)}>Submit</button>
                    )}
                    {g.status === 'pending_approval' && (user.role === 'manager' || user.role === 'admin') && (
                        <button className="btn btn-success btn-sm" onClick={() => handleApprove(g.id)}>Approve</button>
                    )}
                     {g.status === 'active' && g.owner_id === user.id && (
                      <button className="btn btn-secondary btn-sm" onClick={() => {
                        api.patch(`/goals/${g.id}/completion`, { completion_pct: Math.min(100, g.completion_pct + 10) }).then(fetchGoals);
                      }}>+10%</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
