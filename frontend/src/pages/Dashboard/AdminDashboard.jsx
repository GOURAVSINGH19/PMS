import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/client';
import { 
  Users, Target, AlertTriangle, CheckCircle, 
  TrendingUp, Clock, AlertCircle 
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setData(res.data);
      } catch (e) {}
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;
  if (!data) return <div className="empty-state">Failed to load data</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Command Center</h1>
          <p className="page-subtitle">Real-time organizational compliance and performance metrics</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon cyan"><Users /></div>
          <div>
            <div className="stat-value">{data.overview.total_employees}</div>
            <div className="stat-label">Active Employees</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon violet"><Target /></div>
          <div>
            <div className="stat-value">{data.goals.active}</div>
            <div className="stat-label">Active Goals</div>
            <div className="stat-change up">{data.goals.pending_approval} Pending</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle /></div>
          <div>
            <div className="stat-value">{data.feedback.completion_rate}%</div>
            <div className="stat-label">Review Completion</div>
            <div className="stat-change">{data.feedback.submitted} / {data.feedback.total_forms}</div>
          </div>
        </div>

        <div className="stat-card" style={data.flags.open > 0 ? { borderColor: 'var(--accent-red)', boxShadow: '0 0 10px rgba(239,68,68,0.1)' } : {}}>
          <div className="stat-icon red"><AlertTriangle /></div>
          <div>
            <div className="stat-value">{data.flags.open}</div>
            <div className="stat-label">Open Red Flags</div>
            {data.flags.aging_gt_5_days > 0 ? 
              <div className="stat-change down">{data.flags.aging_gt_5_days} Aging &gt; 5 days</div> : 
              <div className="stat-change">All healthy</div>
            }
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Action Center</h3>
          </div>
          <div className="card-body">
            {data.flags.open === 0 && data.goals.stalled_approvals === 0 && data.probation.no_manager_assigned === 0 && (
              <div className="empty-state" style={{ padding: '20px' }}>
                <CheckCircle size={32} style={{ color: 'var(--accent-green)', marginBottom: 8 }} />
                <p>No pending escalations.</p>
              </div>
            )}
            
            {data.flags.open > 0 && (
              <div className="alert alert-error">
                <AlertTriangle size={16} /> 
                <div style={{ flex: 1 }}>
                  <strong>{data.flags.open} Red Flags require review.</strong>
                  <div style={{ marginTop: 4 }}><a href="/admin/flags">Go to Flag Queue &rarr;</a></div>
                </div>
              </div>
            )}
            
            {data.goals.stalled_approvals > 0 && (
              <div className="alert alert-warning">
                <Clock size={16} />
                <div style={{ flex: 1 }}>
                  <strong>{data.goals.stalled_approvals} Goal Approvals are stalled (&gt; 5 days).</strong>
                  <div style={{ marginTop: 4 }}>Managers are delaying objective setting.</div>
                </div>
              </div>
            )}
            
            {data.probation.no_manager_assigned > 0 && (
              <div className="alert alert-warning" style={{ borderColor: 'var(--accent-orange)' }}>
                <AlertCircle size={16} style={{ color: 'var(--accent-orange)' }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ color: 'var(--accent-orange)' }}>{data.probation.no_manager_assigned} Employee(s) missing a manager.</strong>
                  <div style={{ marginTop: 4 }}>Probation triggers are blocked.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Active Review Cycle</h3>
          </div>
          <div className="card-body">
            {data.active_cycle.id ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{data.active_cycle.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
                  Closes on: {data.active_cycle.close_date}
                </div>
                
                <div style={{ padding: '0 40px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>
                    <span>Completion</span>
                    <span>{data.feedback.completion_rate}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: 10 }}>
                    <div className="progress-fill" style={{ width: `${data.feedback.completion_rate}%` }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '20px' }}>
                <p>No active review cycle at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
