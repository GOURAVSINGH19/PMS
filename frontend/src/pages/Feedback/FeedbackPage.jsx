import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/client';
import { Inbox, CheckCircle, AlertTriangle } from 'lucide-react';

export default function FeedbackPage() {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchForms = async () => {
    try {
      const res = await api.get('/feedback');
      setForms(res.data);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { fetchForms(); }, []);

  const handleSubmit = async (id, score, comments) => {
    try {
      await api.post(`/feedback/${id}/submit`, {
        responses: { comments },
        overall_score: score,
        rating: score >= 4 ? 'above_expectations' : score >= 3 ? 'meets' : 'below_expectations'
      });
      fetchForms();
    } catch (e) {}
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Feedback Forms</h1>
          <p className="page-subtitle">Submit self-feedback and review manager feedback (cross-shared when completed)</p>
        </div>
      </div>

      <div className="grid-2">
        {forms.length === 0 && <div className="empty-state card">No feedback forms assigned to you.</div>}
        
        {forms.map(form => (
          <div key={form.id} className="card">
             <div className="card-header" style={{ paddingBottom: 16 }}>
              <div>
                <h3 className="card-title">{form.context.replace('_', ' ').toUpperCase()} REVIEW</h3>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Type: <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{form.form_type}</span>
                </div>
              </div>
              <span className={`badge badge-${form.status}`}>{form.status.toUpperCase()}</span>
            </div>

            <div className="card-body">
              {form.status === 'pending' && form.reviewer_id === user.id ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(form.id, parseFloat(e.target.score.value), e.target.comments.value);
                }}>
                  <div className="form-group">
                    <label className="form-label">Overall Score (1-5)</label>
                    <select name="score" className="form-select" required defaultValue="3">
                      <option value="5">5 - Outstanding</option>
                      <option value="4">4 - Exceeds Expectations</option>
                      <option value="3">3 - Meets Expectations</option>
                      <option value="2">2 - Needs Improvement</option>
                      <option value="1">1 - Unacceptable</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Key Achievements & Areas for Growth</label>
                    <textarea name="comments" className="form-textarea" required placeholder="What went well? What could be better?"></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary">Submit Feedback</button>
                </form>
              ) : form.status === 'pending' ? (
                <div className="empty-state" style={{ padding: '20px' }}>
                  <Clock size={32} style={{ color: 'var(--text-secondary)', marginBottom: 8, opacity: 0.5 }} />
                  <p>Waiting for submission from Reviewer ID: {form.reviewer_id}</p>
                </div>
              ) : (
                <div>
                  <div className="crossshare-banner" style={{ background: 'var(--accent-green-soft)', color: 'var(--accent-green)', borderColor: 'rgba(16,185,129,0.2)' }}>
                    <CheckCircle size={16} /> Both parties have submitted. Answers unlocked.
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <div className="form-label">Submitted Score</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: form.overall_score <= 2 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                      {form.overall_score} / 5
                    </div>
                  </div>

                  <div>
                    <div className="form-label">Comments</div>
                    <div style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: 13, whiteSpace: 'pre-wrap' }}>
                      {form.responses?.comments || 'No comments provided.'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
