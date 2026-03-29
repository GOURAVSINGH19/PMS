import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, Save, ClipboardCheck, User, 
  Shield, AlertTriangle, ChevronLeft, Zap,
  Activity, Award, Target, MessageSquare
} from 'lucide-react';
import Layout from '../components/Layout';
import { goalService, feedbackService } from '../api';
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

export default function FeedbackForm() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({});
  const [rating, setRating] = useState('meets');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadForm();
  }, [id]);

  const loadForm = async () => {
    try {
      const response = await feedbackService.getById(id);
      setForm(response.data);
      if (response.data.responses) setResponses(response.data.responses);
      if (response.data.rating) setRating(response.data.rating);
    } catch (error) {
      toast.error('Failed to load performance window');
      navigate('/performance');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (question, value) => {
    setResponses({ ...responses, [question]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        responses,
        rating,
        overall_score: calculateScore(responses)
      };
      await feedbackService.submitForm(id, data);
      toast.success('Strategy feedback submitted');
      navigate('/performance');
    } catch (error) {
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateScore = (res) => {
    const scores = Object.values(res).filter(v => typeof v === 'number');
    if (scores.length === 0) return 0;
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  };

  if (loading) return (
    <Layout>
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.accent, animation: "spin 1s linear infinite" }} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );

  const isSelf = form.form_type === 'self';
  const isSubmitted = form.status === 'submitted';

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 900, margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
           <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: isSelf ? `${COLORS.accent}12` : `${COLORS.emerald}12`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {isSelf ? <User size={28} color={COLORS.accent} /> : <Shield size={28} color={COLORS.emerald} />}
              </div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.04em" }}>
                   {isSelf ? 'Self-Review Reflection' : `Evaluating: ${form.employee?.name}`}
                </h1>
                <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>{form.cycle?.name || `${form.context} Review`} — Period Q1 2026</p>
              </div>
           </div>
           {isSubmitted && (
              <div style={{
                padding: "8px 16px", background: `${COLORS.emerald}12`,
                color: COLORS.emerald, borderRadius: 10, fontSize: 13, fontWeight: 800,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <ClipboardCheck size={16} /> RECORD FINALIZED
              </div>
           )}
        </div>

        {/* Anonymity Alert */}
        {form.status === 'pending' && !isSelf && (
          <div style={{
            background: `${COLORS.amber}08`, border: `1.5px solid ${COLORS.amber}30`,
            borderRadius: 16, padding: "16px 20px", display: "flex", gap: 12, alignItems: "flex-start",
          }}>
             <AlertTriangle size={18} color={COLORS.amber} style={{ flexShrink: 0, marginTop: 2 }} />
             <p style={{ fontSize: 13, color: COLORS.amber, fontWeight: 600, lineHeight: 1.5 }}>
                <b>Anonymity Protocol:</b> Your feedback will remain restricted from the member until they have also submitted their self-review form for this cycle.
             </p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 100 }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <Section title="Competency & Results" icon={Activity}>
              <RatingQuestion label="Quality of Deliverables" name="quality_deliverables" value={responses.quality_deliverables} onChange={handleResponseChange} disabled={isSubmitted} />
              <RatingQuestion label="Task Execution Velocity" name="timeliness" value={responses.timeliness} onChange={handleResponseChange} disabled={isSubmitted} />
              <RatingQuestion label="Innovation & Solving" name="innovation" value={responses.innovation} onChange={handleResponseChange} disabled={isSubmitted} />
            </Section>

            <Section title="Collaboration & Impact" icon={Target}>
              <RatingQuestion label="Teamwork & Alignment" name="collaboration" value={responses.collaboration} onChange={handleResponseChange} disabled={isSubmitted} />
              <RatingQuestion label="Strategic Influence" name="impact" value={responses.impact} onChange={handleResponseChange} disabled={isSubmitted} />
              <div style={{ height: 60 }} /> {/* Spacer */}
            </Section>
          </div>

          <Section title="Narrative & Evolution" icon={MessageSquare}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Key Achievements & Growth Areas</label>
              <textarea
                value={responses.comments || ''}
                onChange={(e) => handleResponseChange('comments', e.target.value)}
                disabled={isSubmitted}
                rows="6"
                placeholder="Discuss key wins, specific examples, and future trajectory..."
                style={{ 
                  padding: "16px", borderRadius: 16, border: `1.5px solid ${COLORS.border}`, 
                  fontSize: 14, outline: "none", background: COLORS.bg, resize: "none", lineHeight: 1.6,
                }}
              />
            </div>
          </Section>

          {!isSelf && (
             <Section title="Administrative Verdict" icon={Award}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                   <label style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Overall Rank Recommendation</label>
                   <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                      {['below_expectations', 'meets', 'above_expectations'].map(r => (
                        <button
                          key={r} type="button" onClick={() => setRating(r)} disabled={isSubmitted}
                          style={{
                            padding: "16px", borderRadius: 14, border: rating === r ? `2px solid ${COLORS.accent}` : `1.5px solid ${COLORS.border}`,
                            background: rating === r ? `${COLORS.accent}08` : "#fff",
                            color: rating === r ? COLORS.accent : COLORS.muted,
                            fontWeight: 700, fontSize: 13, textTransform: "capitalize", cursor: isSubmitted ? "default" : "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          {r.replace('_', ' ')}
                        </button>
                      ))}
                   </div>
                </div>
             </Section>
          )}

          {!isSubmitted && (
            <div style={{
              position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
              width: "100%", maxWidth: 900, padding: "0 24px", zIndex: 100,
            }}>
               <div style={{
                 background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)",
                 border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "16px 24px",
                 display: "flex", justifyContent: "space-between", alignItems: "center",
                 boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
               }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                     <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.muted }}>EXECUTION SCORE:</div>
                     <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.accent }}>{calculateScore(responses)} <span style={{ fontSize: 14, color: COLORS.muted }}>/ 5.0</span></div>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                     <button type="button" onClick={() => navigate(-1)}
                       style={{ padding: "12px 24px", borderRadius: 12, border: `1.5px solid ${COLORS.border}`, background: "#fff", fontWeight: 700, cursor: "pointer" }}>
                       Dismiss
                     </button>
                     <button type="submit" disabled={submitting}
                       style={{ 
                         padding: "12px 32px", borderRadius: 12, border: "none", background: COLORS.accent, color: "#fff", 
                         fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                         boxShadow: `0 8px 20px ${COLORS.accent}33`, opacity: submitting ? 0.7 : 1,
                       }}>
                        {submitting ? "Deploying..." : "Submit Record"} <Save size={16} />
                     </button>
                  </div>
               </div>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div style={{
      background: COLORS.card, border: `1.5px solid ${COLORS.border}`,
      borderRadius: 24, padding: 32, display: "flex", flexDirection: "column", gap: 24,
      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${COLORS.bg}`, paddingBottom: 20 }}>
         <div style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={16} color={COLORS.muted} />
         </div>
         <h2 style={{ fontSize: 16, fontWeight: 800, color: COLORS.text }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function RatingQuestion({ label, name, value, onChange, disabled }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>{label}</label>
      <div style={{ display: "flex", gap: 8 }}>
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num} type="button" disabled={disabled} onClick={() => onChange(name, num)}
            style={{
              width: 44, h: 44, borderRadius: 12, border: "none",
              background: value === num ? COLORS.accent : COLORS.bg,
              color: value === num ? "#fff" : COLORS.muted,
              fontSize: 14, fontWeight: 800, cursor: disabled ? "default" : "pointer",
              transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: value === num ? `0 4px 10px ${COLORS.accent}40` : "none",
            }}
          >
            {value === num ? <Star size={18} fill="currentColor" /> : num}
          </button>
        ))}
      </div>
    </div>
  );
}
