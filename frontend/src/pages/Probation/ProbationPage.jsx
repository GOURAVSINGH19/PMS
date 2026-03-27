import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/client';
import { Calendar, User, Clock, AlertTriangle } from 'lucide-react';

export default function ProbationPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === 'admin' || user.role === 'manager') {
          const res = await api.get('/probation');
          setData(res.data);
        } else {
          const res = await api.get('/probation/me');
          setData([res.data]);
        }
      } catch (e) {}
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Probation Monitoring</h1>
          <p className="page-subtitle">Track Day 30/60/80 cycles and confirmations</p>
        </div>
      </div>

      <div className="grid-2">
        {data.length === 0 && <div className="empty-state card">No probation records found.</div>}
        
        {data.map(record => (
          <div key={record.id} className="card">
            <div className="card-header" style={{ paddingBottom: 16 }}>
              <div>
                <h3 className="card-title">Employee ID: {record.employee_id}</h3>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Joined: {record.effective_doj}
                  {record.leave_days_accumulated > 0 && <span style={{ color: 'var(--accent-orange)', marginLeft: 8 }}><AlertTriangle size={10}/> {record.leave_days_accumulated} leave days logged</span>}
                </div>
              </div>
              <span className={`badge badge-${record.status}`}>{record.status.toUpperCase()}</span>
            </div>
            
            <div className="card-body">
              <div className="timeline">
                {record.triggers.sort((a,b) => a.day - b.day).map(trigger => (
                  <div key={trigger.id} className="timeline-item">
                    <div className={`timeline-dot ${trigger.status}`}>
                      {trigger.status === 'sent' && '✓'}
                      {trigger.status === 'pending' && <Clock size={8}/>}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-day">Day {trigger.day} Review</div>
                      <div className="timeline-date">
                        Scheduled: {trigger.scheduled_date} 
                        {trigger.triggered_at && <span style={{ color: 'var(--accent-green)', marginLeft: 8 }}>Sent: {new Date(trigger.triggered_at).toLocaleDateString()}</span>}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <span className={`badge badge-${trigger.status}`}>{trigger.status.toUpperCase()}</span>
                        {trigger.escalated_to_admin && <span className="badge badge-escalated" style={{ marginLeft: 6 }}>ESCALATED</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
