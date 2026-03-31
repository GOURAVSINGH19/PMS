import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, CheckCircle2, 
  AlertTriangle, MessageSquare, Send, Zap,
  TrendingUp, User, ShieldCheck, UserMinus,
  ChevronRight, MoreHorizontal, FileText
} from 'lucide-react';
import Layout from '../components/Layout';
import { probationService } from '../api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/auth';

const COLORS = {
  bg: "#F5F4F0",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  border: "#E4E2DC",
  accent: "#2563EB",
  accentDim: "#1D4ED8",
  emerald: "#059669",
  amber: "#D97706",
  rose: "#DC2626",
  violet: "#7C3AED",
  text: "#111111",
  muted: "#6B7280",
  subtle: "#9CA3AF",
};

export default function ProbationDetail() {
  const { id: employeeId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [recommendation, setRecommendation] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await probationService.getByEmployee(employeeId);
      setRecord(res.data);
      if (res.data.recommendation) setRecommendation(res.data.recommendation);
      if (res.data.recommendation_notes) setNotes(res.data.recommendation_notes);
    } catch (error) {
      toast.error('Failed to load probation details');
      navigate('/probation');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRecommendation = async (e) => {
    e.preventDefault();
    if (!recommendation) return toast.error('Please select a recommendation');
    
    setSubmitting(true);
    try {
      await probationService.recommend(record.id, {
        recommendation,
        recommendation_notes: notes
      });
      toast.success('Recommendation submitted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to submit recommendation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <Layout>
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.accent, animation: "spin 1s linear infinite" }} />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
        
        {/* Navigation & Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => navigate('/probation')} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 8, color: COLORS.muted, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
            <ArrowLeft size={18} /> Back to Tracker
          </button>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ padding: '6px 14px', background: `${COLORS.accent}10`, color: COLORS.accent, borderRadius: 10, fontSize: 12, fontWeight: 700 }}>
              {record.calculated_status}
            </div>
          </div>
        </div>

        {/* Profile Summary Card */}
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: 32, display: "flex", gap: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: COLORS.muted, border: `2px solid ${COLORS.border}` }}>
            {record.employee?.name?.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: COLORS.text, letterSpacing: "-0.04em" }}>{record.employee?.name}</h1>
            <p style={{ fontSize: 15, color: COLORS.muted, marginTop: 4 }}>{record.employee?.email} | Joined On: <b>{record.date_of_joining}</b></p>
            <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.subtle, textTransform: "uppercase" }}>Days Elapsed</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, marginTop: 4 }}>{record.working_days_elapsed} <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.muted }}>/ 90 Days</span></div>
              </div>
              <div style={{ width: 1, background: COLORS.border }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.subtle, textTransform: "uppercase" }}>Estimated Confirmation</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, marginTop: 4 }}>{record.probation_end_date || '—'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${COLORS.accent}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TrendingUp size={18} color={COLORS.accent} />
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: COLORS.text }}>Milestone Roadmap</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {record.triggers?.map((milestone, idx) => (
                  <div key={milestone.id} style={{ display: "flex", gap: 20 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: milestone.status === 'submitted' ? COLORS.emerald : COLORS.bg, border: `2px solid ${milestone.status === 'submitted' ? COLORS.emerald : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                        {milestone.status === 'submitted' && <CheckCircle2 size={14} color="#fff" />}
                      </div>
                      {idx !== record.triggers.length - 1 && <div style={{ flex: 1, width: 2, background: COLORS.border, margin: "4px 0" }} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: 32 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>Day {milestone.trigger_day} Check-in</div>
                      <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{milestone.status === 'submitted' ? 'Feedback Submitted' : 'Scheduled for ' + milestone.scheduled_date}</div>
                      
                      {milestone.status === 'submitted' && (
                        <div style={{ marginTop: 12, padding: 16, background: COLORS.bg, borderRadius: 16, border: `1px solid ${COLORS.border}` }}>
                          <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.6, fontStyle: "italic" }}>
                            "Employee is integrating well with the React stack. Showing strong initiative in team standups."
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendation Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${COLORS.violet}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShieldCheck size={18} color={COLORS.violet} />
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: COLORS.text }}>Manager Recommendation</span>
              </div>

              <form onSubmit={handleSubmitRecommendation} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted }}>FINAL DECISION</label>
                  <select 
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    style={{ padding: "12px", borderRadius: 12, border: `1.5px solid ${COLORS.border}`, background: COLORS.bg, outline: "none", fontSize: 14, fontWeight: 600 }}
                    required
                  >
                    <option value="">Select an outcome...</option>
                    <option value="Confirm">Confirm Employee</option>
                    <option value="Extend Probation">Extend Probation</option>
                    <option value="Terminate">Discontinue / Terminate</option>
                    <option value="Needs Improvement">Needs Improvement PIP</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted }}>JUSTIFICATION NOTES</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide detailed rationale for your decision..."
                    style={{ padding: "12px", borderRadius: 12, border: `1.5px solid ${COLORS.border}`, background: COLORS.bg, outline: "none", fontSize: 14, minHeight: 120, resize: "none" }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{
                    padding: "14px", borderRadius: 14, border: "none",
                    background: record.recommendation ? COLORS.muted : COLORS.accent, 
                    color: "#fff", fontWeight: 700, fontSize: 14,
                    cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: record.recommendation ? "none" : `0 8px 20px ${COLORS.accent}33`,
                    opacity: submitting ? 0.7 : 1, transition: "all 0.2s"
                  }}
                >
                  {submitting ? 'Processing...' : record.recommendation ? 'Update Recommendation' : 'Submit Recommendation'}
                </button>
              </form>
            </div>

            {/* Quick Actions Card */}
            <div style={{ background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.violet})`, borderRadius: 24, padding: 28, color: "#fff" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Action Center</h3>
              <p style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6, marginBottom: 20 }}>Need to discuss this employee with HR or escalate a performance concern?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  Schedule 1-on-1 Sync
                </button>
                <button style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "#fff", color: COLORS.accent, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  Request HR Consultation
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
