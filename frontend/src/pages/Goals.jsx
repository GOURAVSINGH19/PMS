import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Plus, Filter, Target, ChevronRight, Search, 
  ArrowUpRight, Clock, CheckCircle2, AlertTriangle, Flag
} from 'lucide-react';
import Layout from '../components/Layout';
import { teamService, userService, goalService } from '../api';
import { GoalStatus } from '../constants/enums';
import { formatDate } from '../utils/format';
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

const StatusPill = ({ status }) => {
  const config = {
    [GoalStatus.ACTIVE]: { bg: `${COLORS.accent}12`, text: COLORS.accent, label: "Active" },
    [GoalStatus.COMPLETED]: { bg: `${COLORS.emerald}12`, text: COLORS.emerald, label: "Completed" },
    [GoalStatus.PENDING_APPROVAL]: { bg: `${COLORS.amber}12`, text: COLORS.amber, label: "Pending" },
    "At Risk": { bg: `${COLORS.rose}12`, text: COLORS.rose, label: "At Risk" },
  };
  const c = config[status] || { bg: COLORS.bg, text: COLORS.muted, label: status };
  return (
    <div style={{
      display: "inline-flex", padding: "4px 10px", borderRadius: 6,
      background: c.bg, color: c.text,
      fontSize: 11, fontWeight: 700,
    }}>{c.label}</div>
  );
};

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadGoals();
  }, [searchParams]);

  const loadGoals = async () => {
    try {
      const response = await goalService.getAll();
      setGoals(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const levels = ["company", "team", "individual"];

  if (loading) return (
    <Layout>
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.accent, animation: "spin 1s linear infinite" }} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );

  const safeGoals = Array.isArray(goals) ? goals : [];

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.03em" }}>Goals</h1>
            <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>Track and manage goals across the organization</p>
          </div>
          <Link to="/goals/new" style={{
            background: COLORS.accent, border: "none", textDecoration: "none",
            padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700,
            color: "#fff", display: "flex", alignItems: "center", gap: 8,
            boxShadow: `0 4px 12px ${COLORS.accent}33`,
          }}>
            <Plus size={16} /> Create Goal
          </Link>
        </div>

        {/* Filters */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 16px", background: COLORS.surface,
          border: `1px solid ${COLORS.border}`, borderRadius: 14,
        }}>
          <Search size={16} color={COLORS.subtle} />
          <input type="text" placeholder="Search by title or owner..." style={{
            border: "none", background: "none", fontSize: 13, flex: 1, outline: "none",
          }} />
          <div style={{ width: 1, height: 20, background: COLORS.border }} />
          {/* <button style={{
            background: "none", border: "none", fontSize: 13, fontWeight: 600,
            color: COLORS.muted, display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
          }}>
            <Filter size={14} /> Filter
          </button> */}
        </div>

        {/* Level Pipeline */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {levels.map(level => {
            const levelGoals = safeGoals.filter(g => g.level === level);
            return (
              <div key={level} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: level === 'company' ? COLORS.violet : (level === 'team' ? COLORS.accent : COLORS.emerald) }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: COLORS.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>{level}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted }}>{levelGoals.length} Goals</span>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {levelGoals.map(goal => (
                    <Link key={goal.id} to={`/goals/${goal.id}`} style={{
                      display: "flex", flexDirection: "column", gap: 14, 
                      padding: 20, background: COLORS.card,
                      border: `1.5px solid ${COLORS.border}`, borderRadius: 16,
                      textDecoration: "none", transition: "all 0.2s",
                    }} onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.accent} onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{goal.title}</span>
                          <span style={{ fontSize: 11, fontWeight: 500, color: COLORS.subtle }}>Due: {formatDate(goal.due_date)}</span>
                        </div>
                        {goal.is_at_risk && <Flag size={14} color={COLORS.rose} />}
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted }}>Progress</span>
                          <span style={{ fontSize: 11, fontWeight: 800, color: COLORS.accent }}>{goal.completion_pct}%</span>
                        </div>
                        <div style={{ width: "100%", height: 5, background: COLORS.bg, borderRadius: 10, overflow: "hidden" }}>
                          <div style={{ width: `${goal.completion_pct}%`, height: "100%", background: goal.is_at_risk ? COLORS.rose : COLORS.accent, borderRadius: 10 }} />
                        </div>
                      </div>

                      <div style={{ display: "flex", items: "center", justifyContent: "space-between", paddingTop: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 18, height: 18, borderRadius: 5, background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: COLORS.muted }}>
                            {goal.owner?.name?.charAt(0) || "U"}
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted }}>{goal.owner?.name || "Unassigned"}</span>
                        </div>
                        <StatusPill status={goal.is_at_risk ? "At Risk" : goal.status} />
                      </div>
                    </Link>
                  ))}
                  {levelGoals.length === 0 && (
                    <div style={{ border: `1.5px dashed ${COLORS.border}`, borderRadius: 16, padding: 32, textAlign: "center", color: COLORS.subtle, fontSize: 12 }}>
                      No {level} goals yet
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </Layout>
  );
}
