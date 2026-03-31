import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Filter, Target, ChevronRight, Search, 
  ArrowUpRight, Clock, CheckCircle2, AlertTriangle, Flag,
  XCircle, Zap, TrendingUp, Layers, User, Calendar
} from 'lucide-react';
import Layout from '../components/Layout';
import { goalService } from '../api';
import { GoalStatus } from '../constants/enums';
import { useAuthStore } from '../store/auth';
import { formatDate } from '../utils/format';
import toast from 'react-hot-toast';

const COLORS = {
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  card: "rgba(255, 255, 255, 0.8)",
  border: "rgba(229, 231, 235, 0.5)",
  accent: "#3B82F6",
  emerald: "#10B981",
  amber: "#F59E0B",
  rose: "#EF4444",
  violet: "#8B5CF6",
  text: "#111827",
  muted: "#4B5563",
  subtle: "#9CA3AF",
};

const StatusPill = ({ status, atRisk }) => {
  const displayStatus = atRisk ? 'At Risk' : status;
  const config = {
    [GoalStatus.ACTIVE]: { bg: `${COLORS.accent}15`, text: COLORS.accent, label: "Active" },
    [GoalStatus.COMPLETED]: { bg: `${COLORS.emerald}15`, text: COLORS.emerald, label: "Completed" },
    [GoalStatus.PENDING_APPROVAL]: { bg: `${COLORS.amber}15`, text: COLORS.amber, label: "Pending" },
    [GoalStatus.REJECTED]: { bg: `${COLORS.rose}15`, text: COLORS.rose, label: "Rejected" },
    'At Risk': { bg: `${COLORS.rose}15`, text: COLORS.rose, label: "At Risk" },
  };
  const c = config[displayStatus] || { bg: "rgba(0,0,0,0.05)", text: COLORS.muted, label: displayStatus };
  
  return (
    <div style={{
      display: "inline-flex", padding: "4px 12px", borderRadius: 20,
      background: c.bg, color: c.text,
      fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em",
      backdropFilter: "blur(4px)", border: `1px solid ${c.text}20`
    }}>{c.label}</div>
  );
};

const GoalCard = ({ goal, currentUser, onApprove, onReject }) => {
  const navigate = useNavigate();
  const role = currentUser?.role?.toString().toLowerCase().split('.').pop() || '';
  const canApprove = (role === 'admin' || role === 'manager') && goal.assignee_id !== currentUser?.id;
  
  const levelColors = {
    company: COLORS.violet,
    team: COLORS.accent,
    individual: COLORS.emerald
  };
  const themeColor = levelColors[goal.level] || COLORS.accent;

  return (
    <div 
      onClick={() => navigate(`/goals/${goal.id}`)}
      style={{
        display: "flex", flexDirection: "column", gap: 16, 
        padding: 24, background: COLORS.card,
        border: `1.5px solid ${COLORS.border}`, borderRadius: 24,
        textDecoration: "none", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer", position: "relative", overflow: "hidden",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)"
      }} 
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = themeColor + "40";
        e.currentTarget.style.boxShadow = `0 20px 25px -5px ${themeColor}15`;
      }} 
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)";
      }}
    >
      {/* Level Gradient Accent */}
      <div style={{ 
        position: "absolute", top: 0, left: 0, right: 0, height: 4, 
        background: `linear-gradient(90deg, ${themeColor}00, ${themeColor}, ${themeColor}00)` 
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: themeColor, textTransform: "uppercase", letterSpacing: "0.1em" }}>{goal.level}</span>
            {goal.is_at_risk && <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.rose, boxShadow: `0 0 10px ${COLORS.rose}` }} />}
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, lineHeight: 1.3 }}>{goal.title}</h3>
        </div>
        <div style={{ p: 8, borderRadius: 12, background: `${themeColor}10`, color: themeColor }}>
          <ArrowUpRight size={18} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <TrendingUp size={14} color={COLORS.subtle} />
            <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted }}>Progress</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 900, color: themeColor }}>{goal.completion_percentage}%</span>
        </div>
        <div style={{ width: "100%", height: 8, background: "rgba(0,0,0,0.04)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ 
            width: `${goal.completion_percentage}%`, height: "100%", 
            background: `linear-gradient(90deg, ${themeColor}, ${themeColor}dd)`, 
            borderRadius: 10, transition: "width 1s ease-out" 
          }} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ 
            width: 32, height: 32, borderRadius: 10, background: `${COLORS.accent}10`, 
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${COLORS.accent}20`
          }}>
            <User size={14} color={COLORS.accent} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.text }}>{goal.assignee?.name || "Unassigned"}</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: COLORS.subtle }}>Owner</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {goal.status === GoalStatus.PENDING_APPROVAL && canApprove && (
            <div style={{ display: "flex", gap: 4, marginRight: 4 }}>
              <button onClick={(e) => onApprove(e, goal.id)} style={{ background: COLORS.emerald, border: "none", width: 28, height: 28, borderRadius: 8, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                <CheckCircle2 size={14} />
              </button>
            </div>
          )}
          <StatusPill status={goal.status} atRisk={goal.is_at_risk} />
        </div>
      </div>
    </div>
  );
};

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const currentUser = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleApprove = async (e, goalId) => {
    e.preventDefault(); e.stopPropagation();
    try {
      await goalService.approve(goalId);
      toast.success('Objective Strategy Validated');
      loadGoals();
    } catch (e) { toast.error('Approval failed'); }
  };

  const handleReject = async (e, goalId) => {
    e.preventDefault(); e.stopPropagation();
    const reason = prompt("Enter specific feedback for rejection:");
    if (!reason) return;
    try {
      await goalService.reject(goalId, reason);
      toast.success('Intervention recorded');
      loadGoals();
    } catch (e) { toast.error('Intervention failed'); }
  };

  useEffect(() => {
    loadGoals();
  }, [searchParams]);

  const loadGoals = async () => {
    try {
      const response = await goalService.getAll();
      setGoals(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Strategic Pipeline unavailable');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Layout>
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.accent, animation: "spin 1s linear infinite" }} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );

  const levels = ["company", "team", "individual"];

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingBottom: 40 }}>
        
        {/* Modern Header */}
        <div style={{ 
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderRadius: 24, color: "#fff", position: "relative", overflow: "hidden",
        }}>
          {/* Decorative background shapes */}
          

          <Link to="/goals/new" style={{
            background: "#fff", border: "none", textDecoration: "none",
            padding: "12px 24px", borderRadius: 14, fontSize: 14, fontWeight: 800,
            color: COLORS.accent, display: "flex", alignItems: "center", gap: 8,
            transition: "0.2s", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"
          }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
            <Plus size={18} strokeWidth={3} /> create goal
          </Link>
        </div>

        {/* Global Pipeline View */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {levels.map(level => {
            const levelGoals = goals.filter(g => g.level === level);
            return (
              <div key={level} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ 
                      width: 40, height: 40, borderRadius: 14, 
                      background: level === 'company' ? `${COLORS.violet}15` : (level === 'team' ? `${COLORS.accent}15` : `${COLORS.emerald}15`),
                      display: "flex", alignItems: "center", justifyContent: "center" 
                    }}>
                      {level === 'company' ? <Layers size={20} color={COLORS.violet} /> : (level === 'team' ? <User size={20} color={COLORS.accent} /> : <Target size={20} color={COLORS.emerald} />)}
                    </div>
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, textTransform: "capitalize" }}>{level} Pipeline</h2>
                      <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.subtle }}>{levelGoals.length} Active Modules</span>
                    </div>
                  </div>
                </div>
                
                {levelGoals.length > 0 ? (
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
                    gap: 24 
                  }}>
                    {levelGoals.map(goal => (
                      <GoalCard 
                        key={goal.id} 
                        goal={goal} 
                        currentUser={currentUser}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    padding: 40, borderRadius: 24, background: "rgba(0,0,0,0.02)", 
                    border: `2px dashed ${COLORS.border}`, display: "flex", 
                    flexDirection: "column", alignItems: "center", gap: 12, color: COLORS.subtle
                  }}>
                    <div style={{ p: 12, background: "#fff", borderRadius: "50%", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                       <Target size={24} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>No tactical objectives defined for this pipeline</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
