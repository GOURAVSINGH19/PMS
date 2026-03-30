import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, User, Shield, CheckCircle, Clock, 
  AlertCircle, ChevronRight, Activity, Zap, Star
} from 'lucide-react';
import Layout from '../components/Layout';
import { goalService, feedbackService } from '../api';
import { formatDate } from '../utils/format';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';

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

export default function PerformanceReview() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const response = await feedbackService.getMyForms();
      setForms(response.data);
    } catch (error) {
      toast.error('Failed to load performance pipeline');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Layout>
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.accent, animation: "spin 1s linear infinite" }} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );

  const pendingSelf = forms.filter(f => f.form_type === 'SELF_ASSESSMENT' && f.status !== 'submitted');
  const pendingManager = forms.filter(f => f.form_type === 'MANAGER_FEEDBACK' && f.status !== 'submitted');
  const submitted = forms.filter(f => f.status === 'submitted');

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.03em" }}>Performance Feedback</h1>
            <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>Review cycle orchestration and personal performance history</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
              color: COLORS.muted, display: "flex", alignItems: "center", gap: 8,
            }}>
               <Activity size={14} /> Total Cycles: {forms.length}
            </div>
          </div>
        </div>

        {/* Action Required Section */}
        {(pendingSelf.length > 0 || pendingManager.length > 0) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800, color: COLORS.amber }}>
              <AlertCircle size={16} />
              <span style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Critical Action Required</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {pendingSelf.map(form => (
                <FeedbackCard key={form.id} form={form} isAction />
              ))}
              {pendingManager.map(form => (
                <FeedbackCard key={form.id} form={form} isAction />
              ))}
            </div>
          </div>
        )}

        {/* History / Completed Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800, color: COLORS.muted }}>
            <Clock size={16} />
            <span style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Review Archive & Completed</span>
          </div>
          {submitted.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {submitted.map(form => (
                <FeedbackCard key={form.id} form={form} />
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: "center", padding: 64, border: `2px dashed ${COLORS.border}`, 
              borderRadius: 20, color: COLORS.subtle, fontSize: 14,
            }}>
               No historical records detected in current data layer.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function FeedbackCard({ form, isAction }) {
  const isSelf = form.form_type === 'SELF_ASSESSMENT';
  
  return (
    <div style={{
      background: COLORS.card, border: isAction ? `1.5px solid ${COLORS.amber}40` : `1.5px solid ${COLORS.border}`,
      borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 16,
      position: "relative", boxShadow: isAction ? "0 4px 12px rgba(217, 119, 6, 0.05)" : "0 1px 3px rgba(0,0,0,0.03)",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ 
            width: 40, height: 40, borderRadius: 10, 
            background: isSelf ? `${COLORS.accent}10` : `${COLORS.emerald}10`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {isSelf ? <User size={20} color={COLORS.accent} /> : <Shield size={20} color={COLORS.emerald} />}
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: COLORS.text }}>
              {isSelf ? 'Self-Review Reflection' : 'Manager Review'}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
               <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>{form.context} Track</span>
            </div>
          </div>
        </div>
        <div style={{
          padding: "4px 10px", borderRadius: 6,
          background: form.status === 'pending' ? `${COLORS.amber}12` : `${COLORS.emerald}12`,
          color: form.status === 'pending' ? COLORS.amber : COLORS.emerald,
          fontSize: 10, fontWeight: 800, textTransform: "uppercase",
        }}>
          {form.status}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{form.cycle?.name || 'Standard Orchestration Window'}</div>
        <div style={{ fontSize: 11, color: COLORS.muted }}>
           {isAction ? "Due for submission" : `Finalized on ${formatDate(form.submitted_at)}`}
        </div>
      </div>

      <Link 
        to={`/performance/form/${form.id}`} 
        style={{ 
          marginTop: 8, padding: "10px", borderRadius: 10, textDecoration: "none",
          background: isAction ? COLORS.accent : COLORS.bg,
          color: isAction ? "#fff" : COLORS.text,
          fontSize: 13, fontWeight: 700, textAlign: "center",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "background 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = isAction ? COLORS.accentDim : COLORS.border}
        onMouseLeave={e => e.currentTarget.style.background = isAction ? COLORS.accent : COLORS.bg}
      >
        {form.status === 'pending' ? (
          <>Action Form <Zap size={14} /></>
        ) : (
          <>View Records <Star size={14} /></>
        )}
      </Link>
    </div>
  );
}
