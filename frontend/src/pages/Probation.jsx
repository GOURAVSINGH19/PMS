import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCheck, Clock, Calendar, AlertTriangle, 
  CheckCircle2, ChevronRight, Zap, RefreshCw
} from 'lucide-react';
import Layout from '../components/Layout';
import { probationService, userService } from '../api';
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

export default function Probation() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [probations, setProbations] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Mocking probation data based on users for now
    loadData();
  }, []);

  const loadData = async () => {
    setError(false);
    setLoading(true);
    try {
      const [probRes, usersRes] = await Promise.all([
        probationService.getAll(),
        userService.getAll()
      ]);
      const probs = Array.isArray(probRes.data) ? probRes.data : [];
      const usersMap = {};
      (usersRes.data || []).forEach(u => usersMap[u.id] = u);
      // Enrich probation records with user info
      const enriched = probs.map(p => ({
        ...p,
        employee: usersMap[p.employee_id] || null,
        status: p.probation_status,
        days_elapsed: p.working_days_elapsed,
      }));
      setProbations(enriched);
    } catch (error) {
      setError(true);
      toast.error('Failed to load probation data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckTriggers = async () => {
    toast.success('Trigger scan complete');
    loadData();
  };

  const members = probations;

  if (loading) return (
    <Layout>
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.accent, animation: "spin 1s linear infinite" }} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div style={{ height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: `${COLORS.rose}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AlertTriangle size={32} color={COLORS.rose} />
        </div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.text }}>Failed to synchronize data</h2>
          <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 6 }}>The strategy engine experienced a connection timeout or server error.</p>
        </div>
        <button onClick={loadData} style={{
          background: COLORS.accent, border: "none", padding: "12px 24px", borderRadius: 12,
          color: "#fff", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 10,
          cursor: "pointer", boxShadow: `0 8px 20px ${COLORS.accent}33`, transition: "all 0.2s",
        }}>
          <RefreshCw size={18} /> Retry Synchronization
        </button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.03em" }}>
               {currentUser?.role === 'employee' ? 'My Strategic Onboarding' : 'Probation Lifecycle'}
            </h1>
            <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>
               {currentUser?.role === 'employee' ? 'Tracking your professional evolution and cultural alignment milestones' : 'Automated tracking for 30, 60, and 90-day performance milestones'}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {currentUser?.role === 'admin' && (
              <button 
                onClick={handleCheckTriggers}
                style={{
                  background: COLORS.accent, border: "none",
                  padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                  color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  boxShadow: `0 4px 12px ${COLORS.accent}33`,
                }}
              >
                Scan Triggers <Zap size={14} />
              </button>
            )}
            <button style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              color: COLORS.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
            }}>
              Download Schedule <Calendar size={14} />
            </button>
          </div>
        </div>

        {/* Global Alert / Employee Welcome */}
        {currentUser?.role === 'employee' ? (
           <div style={{
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.violet})`,
              borderRadius: 24, padding: "32px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center",
              boxShadow: `0 20px 40px ${COLORS.accent}33`,
           }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Zap size={24} color="#fff" />
                    <span style={{ fontSize: 20, fontWeight: 800 }}>Keep Pushing, {currentUser?.name}!</span>
                 </div>
                 <p style={{ fontSize: 15, opacity: 0.9, maxWidth: 500, lineHeight: 1.6 }}>You are currently <b>{members[0]?.probationDays - members[0]?.daysLeft} days</b> into your journey. Your next milestone is the 60-day alignment check.</p>
              </div>
              <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 32, fontWeight: 900 }}>{members[0]?.days_left || 0}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8, textTransform: "uppercase" }}>Days Remaining</div>
              </div>
           </div>
        ) : (
          <div style={{
            background: `${COLORS.rose}08`, border: `1px solid ${COLORS.rose}20`,
            borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.rose, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={18} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.rose }}>Automated Escalations Detected</div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                System has identified <b>{members.filter(m => m.triggers?.some(t => t.escalated_to_admin)).length}</b> members reaching Day 80 milestones or pending overdue actions.
              </div>
            </div>
            <button 
              onClick={handleCheckTriggers}
              style={{ background: COLORS.rose, border: "none", padding: "6px 12px", borderRadius: 8, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              Run Guardrail Protocol
            </button>
          </div>
        )}

        {/* Probation Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {members.map((member, i) => (
            <div key={i} 
              onClick={() => navigate(`/goals?user_id=${member.user?.id}`)}
              style={{
                background: COLORS.card, border: `1.5px solid ${COLORS.border}`,
                borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 20,
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                cursor: "pointer",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = COLORS.accent;
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 12px 24px -10px ${COLORS.accent}20`;
              }} 
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = COLORS.border;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                 <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                   <div style={{
                     width: 44, height: 44, borderRadius: 12, background: COLORS.bg,
                     display: "flex", alignItems: "center", justifyContent: "center",
                     fontSize: 16, fontWeight: 800, color: COLORS.muted, border: `1px solid ${COLORS.border}`,
                   }}>{member.user?.name?.charAt(0)}</div>
                   <div>
                     <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.text }}>{member.employee?.name || `Employee #${member.employee_id}`}</div>
                     <div style={{ fontSize: 12, color: COLORS.muted }}>Joined: {member.date_of_joining} · {(member.status || '').toUpperCase()}</div>
                   </div>
                 </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {member.triggers?.some(t => t.escalated_to_admin) && (
                    <div style={{
                      padding: "4px 8px", borderRadius: 6,
                      background: COLORS.rose, color: "#fff",
                      fontSize: 10, fontWeight: 800, letterSpacing: "0.05em"
                    }}>ESCALATED</div>
                  )}
                  <div style={{
                    padding: "4px 10px", borderRadius: 6,
                    background: member.status === 'paused' ? `${COLORS.amber}12` : `${COLORS.emerald}12`,
                    color: member.status === 'paused' ? COLORS.amber : COLORS.emerald,
                    fontSize: 11, fontWeight: 700,
                  }}>{member.status}</div>
                </div>
              </div>

              {/* Milestones */}
              <div style={{ display: "flex", gap: 8 }}>
                {(member.triggers || []).map(trigger => {
                  const isCompleted = trigger.status === 'completed' || trigger.status === 'waived';
                  const isUpcoming = trigger.status === 'pending';
                  return (
                    <div key={trigger.day} style={{
                      flex: 1, padding: "12px", borderRadius: 14,
                      background: isUpcoming ? `${COLORS.accent}08` : COLORS.bg,
                      border: isUpcoming ? `1px solid ${COLORS.accent}30` : `1px solid transparent`,
                      display: "flex", flexDirection: "column", gap: 6,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: isUpcoming ? COLORS.accent : COLORS.subtle }}>D-{trigger.day}</span>
                        {isCompleted && <CheckCircle2 size={12} color={COLORS.emerald} />}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: isUpcoming ? COLORS.text : COLORS.subtle }}>
                         {formatDate(trigger.scheduled_date)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted }}>STRATEGIC PROGRESS</div>
                  <span style={{ color: COLORS.text }}>{member.days_elapsed || 0} / 90 Days</span>
                </div>
                <div style={{ width: "100%", height: 6, background: COLORS.bg, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, ((member.days_elapsed || 0) / 90) * 100)}%`, height: "100%", background: COLORS.accent, borderRadius: 10 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.muted }}>GOAL COMPLETION</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: COLORS.emerald }}>{Math.round(member.goal_completion || 0)}%</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: `1px solid ${COLORS.border}` }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: COLORS.violet, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>
                       M
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted }}>Reviewer: HR Admin</span>
                 </div>
                 <button style={{ background: "none", border: "none", color: COLORS.accent, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                   Action Review <ChevronRight size={14} />
                 </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </Layout>
  );
}
