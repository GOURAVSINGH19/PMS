import { useEffect, useState } from 'react';
import { 
  Flag, AlertTriangle, Shield, CheckCircle2, 
  ChevronRight, Search, Zap, AlertCircle, 
  User, Activity, MessageSquare, Filter, Briefcase
} from 'lucide-react';
import Layout from '../components/Layout';
import { feedbackService, goalService } from '../api';
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

export default function FeedbackFlags() {
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await goalService.getAll();
      // Filter for goals that are "at risk" to show as flags
      const safeData = Array.isArray(res.data) ? res.data : [];
      setFlags(safeData.filter(g => g.is_at_risk).map(g => ({
        ...g,
        escalation: "Level 1",
        reason: "Stagnant progress (70% time elapsed with < 50% completion)",
        detectedBy: "System Guardrail"
      })));
    } catch (error) {
      toast.error('Failed to load strategic flags');
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

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.03em" }}>Strategic Guardrails</h1>
            <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>Anomaly detection and performance intervention dashboard</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              color: COLORS.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
            }}>
              <Search size={14} /> Scan Repositories
            </button>
            <button style={{
              background: COLORS.rose, border: "none",
              padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              boxShadow: `0 4px 12px ${COLORS.rose}33`,
            }}>
              <Shield size={14} /> Global Override
            </button>
          </div>
        </div>

        {/* System Health */}
        <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr", gap: 24 }}>
          <div style={{
            background: COLORS.card, border: `1.5px solid ${COLORS.border}`,
            borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 24,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Flag size={18} color={COLORS.rose} />
                  <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.text }}>Active High-Risk Flags</span>
               </div>
               <div style={{ display: "flex", gap: 8 }}>
                  {["All Flags", "System", "Manual"].map((f, i) => (
                    <div key={i} style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 6, background: i === 0 ? COLORS.accent : COLORS.bg, color: i === 0 ? "#fff" : COLORS.muted, cursor: "pointer" }}>{f}</div>
                  ))}
               </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {flags.map((flag, i) => (
                <div key={i} style={{
                  padding: "16px 20px", borderRadius: 16, border: `1px solid ${COLORS.border}`,
                  display: "flex", flexDirection: "column", gap: 12,
                }}>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                         <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.rose, animation: "pulse 2s infinite" }} />
                         <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{flag.title}</span>
                         <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: `${COLORS.rose}12`, color: COLORS.rose }}>LEVEL 1 ESCALATION</span>
                      </div>
                      <span style={{ fontSize: 12, color: COLORS.subtle, fontWeight: 500 }}>Detected 2h ago</span>
                   </div>
                   <div style={{ fontSize: 12, color: COLORS.muted, background: COLORS.bg, padding: "10px 14px", borderRadius: 10, borderLeft: `3px solid ${COLORS.rose}` }}>
                      <b>Trigger:</b> {flag.reason}
                   </div>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                       <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <User size={14} color={COLORS.muted} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted }}>Employee #{flag.assignee_id}</span>
                          <span style={{ fontSize: 12, color: COLORS.subtle }}>·</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted }}>{flag.level}</span>
                       </div>
                      <div style={{ display: "flex", gap: 8 }}>
                         <button style={{ background: "none", border: `1px solid ${COLORS.border}`, padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, color: COLORS.muted, cursor: "pointer" }}>Dismiss</button>
                         <button style={{ background: COLORS.accent, border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "#fff", cursor: "pointer" }}>Intervene</button>
                      </div>
                   </div>
                </div>
              ))}
              {flags.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: COLORS.subtle, background: COLORS.bg, borderRadius: 16, border: `1.5px dashed ${COLORS.border}` }}>
                   Strategic alignment stable. No risks detected in current execution.
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
             {/* Escalation Stats */}
             <div style={{
               background: COLORS.card, border: `1.5px solid ${COLORS.border}`,
               borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 16,
             }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text }}>Organisational Friction</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                   <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.text }}>4.2%</div>
                   <div style={{ color: COLORS.rose, background: `${COLORS.rose}12`, padding: "4px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>+1.2% VS LY</div>
                </div>
                <div style={{ width: "100%", height: 6, background: COLORS.bg, borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ width: "45%", height: "100%", background: COLORS.rose }} />
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted }}>Calculated based on stagnant goals and late reviews.</div>
             </div>

             {/* System Log */}
             <div style={{
               background: COLORS.card, border: `1.5px solid ${COLORS.border}`,
               borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 16,
             }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text, display: "flex", alignItems: "center", gap: 8 }}>
                   <Activity size={16} color={COLORS.muted} /> System Pulse
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                   {[
                     "Guardrail: Scanned 124 objectives",
                     "Automation: Probation D-30 triggered for 2",
                     "Security: Admin login detected from IN",
                   ].map((log, i) => (
                     <div key={i} style={{ fontSize: 11, color: COLORS.muted, padding: "8px 10px", background: COLORS.bg, borderRadius: 8, borderLeft: `2px solid ${COLORS.accent}` }}>
                       {log}
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.5; }
            50% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.5; }
          }
        `}</style>

      </div>
    </Layout>
  );
}
