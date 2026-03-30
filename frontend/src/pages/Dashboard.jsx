import { useEffect, useState, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { goalService, userService, teamService, cycleService, notificationService, feedbackService, probationService, adminService } from '../api';
import { GoalStatus } from '../constants/enums';
import { useAuthStore } from "../store/auth";
import toast from "react-hot-toast";
import { 
  AlertTriangle, ArrowDown, ArrowUp, CheckCircle, Flag, MessageSquare, Target, TrendingUp, 
  Activity, Zap, BarChart3, Clock
} from 'lucide-react';

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

const StatCard = ({ label, value, icon: Icon, trend, trendValue, color, to }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  return (
    <div 
      onClick={() => to && navigate(to)} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: COLORS.card, 
        border: `1.5px solid ${isHovered && to ? color : COLORS.border}`,
        borderRadius: 16, 
        padding: "20px 24px",
        display: "flex", 
        flexDirection: "column", 
        gap: 12,
        boxShadow: isHovered && to ? `0 12px 24px -10px ${color}20` : "0 1px 3px rgba(0,0,0,0.04)",
        cursor: to ? "pointer" : "default",
        transform: isHovered && to ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${color}10`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: COLORS.text }}>{value}</span>
        {trend && (
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 12, fontWeight: 700,
            color: trend === 'up' ? COLORS.emerald : COLORS.rose,
          }}>
            {trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {trendValue}
          </div>
        )}
      </div>
    </div>
  );
};

const ProgressBar = ({ progress, color }) => (
  <div style={{ width: "100%", height: 6, background: COLORS.bg, borderRadius: 10, overflow: "hidden" }}>
    <div style={{ width: `${Math.min(100, Math.max(0, progress || 0))}%`, height: "100%", background: color || COLORS.accent, borderRadius: 10, transition: "width 0.8s ease" }} />
  </div>
);

const StatusPill = ({ status }) => {
  const config = {
    [GoalStatus.ACTIVE]: { bg: `${COLORS.accent}12`, text: COLORS.accent, label: "Active" },
    [GoalStatus.COMPLETED]: { bg: `${COLORS.emerald}12`, text: COLORS.emerald, label: "Completed" },
    [GoalStatus.PENDING_APPROVAL]: { bg: `${COLORS.amber}12`, text: COLORS.amber, label: "Pending" },
    [GoalStatus.AWAITING_FEEDBACK]: { bg: `${COLORS.violet}12`, text: COLORS.violet, label: "Feedback" },
    [GoalStatus.SCORED]: { bg: `${COLORS.emerald}24`, text: COLORS.emerald, label: "Scored" },
    "On Track": { bg: `${COLORS.emerald}12`, text: COLORS.emerald, label: "On Track" },
    "At Risk": { bg: `${COLORS.rose}12`, text: COLORS.rose, label: "At Risk" },
  };
  const c = config[status] || { bg: COLORS.bg, text: COLORS.muted, label: status };
  return (
    <div style={{
      display: "inline-flex", padding: "4px 10px", borderRadius: 6,
      background: c.bg, color: c.text,
      fontSize: 11, fontWeight: 700, letterSpacing: "-0.01em",
    }}>
      {c.label}
    </div>
  );
};

import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [performanceForms, setPerformanceForms] = useState([]);
  const [myProbation, setMyProbation] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [automation, setAutomation] = useState(null);
  
  const currentUser = useAuthStore((state) => state.user);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const fetchProbationSafely = async () => {
        try {
          const res = await probationService.getMe(currentUser.id);
          return res.data;
        } catch (e) {
          return null;
        }
      };

      if (currentUser?.role === 'admin') {
        const [adminRes, notificationsRes] = await Promise.all([
          adminService.getDashboard().catch(() => ({ data: {} })),
          notificationService.getAll().catch(() => ({ data: [] }))
        ]);
        setAdminData(adminRes.data);
        setNotifications(notificationsRes.data || []);
      } else if (currentUser?.role === 'manager') {
        const [goalsRes, notificationsRes, performanceRes, probationRes] = await Promise.all([
          goalService.getAll().catch(() => ({ data: [] })),
          notificationService.getAll().catch(() => ({ data: [] })),
          feedbackService.getAll().catch(() => ({ data: [] })),
          fetchProbationSafely()
        ]);
        setGoals(Array.isArray(goalsRes.data) ? goalsRes.data : []);
        setNotifications(notificationsRes.data || []);
        setPerformanceForms(performanceRes.data || []);
        setMyProbation(probationRes || null);
      } else {
        const [goalsRes, notificationsRes, performanceRes, probationRes] = await Promise.all([
          goalService.getAll().catch(() => ({ data: [] })),
          notificationService.getAll().catch(() => ({ data: [] })),
          feedbackService.getAll().catch(() => ({ data: [] })),
          fetchProbationSafely()
        ]);
        setGoals(Array.isArray(goalsRes.data) ? goalsRes.data : []);
        setNotifications(notificationsRes.data || []);
        setPerformanceForms(performanceRes.data || []);
        setMyProbation(probationRes || null);
      }
    } catch (error) {
      console.error("Dashboard Load Error:", error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const defaultStats = {
      total: 0, completed: 0, remaining: 0, atRisk: 0, avgCompletion: 0, approvalRate: 0,
      orgPerformance: 0, pendingSubmissions: 0, openFlags: 0, criticalAlerts: 0
    };

    if (currentUser?.role === 'admin' && adminData) {
      const totalGoals = adminData.total_goals || 0;
      const completedGoals = adminData.completed_goals || 0;
      const orgPerf = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
      return {
        ...defaultStats,
        orgPerformance: orgPerf,
        pendingSubmissions: adminData.open_review_cycles || 0,
        openFlags: adminData.pending_escalations || 0,
        criticalAlerts: adminData.probation_in_progress || 0,
        totalEmployees: adminData.total_employees || 0,
        activeGoals: adminData.active_goals || 0,
        atRisk: adminData.at_risk_goals || 0,
      };
    }

    const safeGoals = Array.isArray(goals) ? goals : [];
    
    const completedCount = safeGoals.filter(g => g.status === GoalStatus.COMPLETED || g.completion_pct === 100).length;
    const avgComp = safeGoals.length > 0 
      ? Math.round(safeGoals.reduce((acc, g) => acc + (g.completion_pct || 0), 0) / safeGoals.length) 
      : 0;

    return {
      ...defaultStats,
      total: safeGoals.length,
      completed: completedCount,
      remaining: safeGoals.length - completedCount,
      atRisk: safeGoals.filter(g => g.is_at_risk).length,
      avgCompletion: avgComp,
      approvalRate: safeGoals.length > 0
        ? Math.round((safeGoals.filter(g => g.status !== GoalStatus.DRAFT).length / safeGoals.length) * 100)
        : 0
    };
  }, [currentUser, adminData, goals]);

  if (loading || !currentUser) return (
    <Layout>
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.accent, animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted }}>Aligning your strategic data…</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );

  if (currentUser.role === 'admin') {
    return (
      <Layout>
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: COLORS.text, letterSpacing: "-0.04em" }}>Strategic Command Center</h1>
              <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>Organizational health & execution telemetry</p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ background: `${COLORS.accent}10`, color: COLORS.accent, padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <Activity size={16} /> System Online
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            <StatCard label="Org Performance" value={`${stats.orgPerformance}%`} icon={TrendingUp} color={COLORS.accent} trend="up" trendValue="Global Avg" />
            <StatCard label="Open Review Cycles" value={stats.pendingSubmissions} icon={MessageSquare} color={COLORS.amber} trendValue="Cycles" to="/cycles" />
            <StatCard label="Open Flags" value={stats.openFlags} icon={Flag} color={COLORS.rose} trendValue="Requires Review" to="/flags" />
            <StatCard label="Probation Active" value={stats.criticalAlerts} icon={AlertTriangle} color={COLORS.violet} trendValue="In Progress" to="/probation" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 24, padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Clock size={20} color={COLORS.accent} />
                    <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.text, textTransform: "uppercase", letterSpacing: "0.03em" }}>Active Cycle Monitor</span>
                  </div>
                  <StatusPill status={adminData?.active_cycle?.name || "No Active Cycle"} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div style={{ padding: "20px", background: COLORS.bg, borderRadius: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{adminData?.active_cycle?.name || 'Annual Strategy Loop'}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.accent }}>{adminData?.feedback?.completion_rate || 0}% Complete</span>
                    </div>
                    <ProgressBar progress={adminData?.feedback?.completion_rate || 0} color={COLORS.accent} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ padding: "16px", border: `1px solid ${COLORS.border}`, borderRadius: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, marginBottom: 8 }}>PROBATION TRACK</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text }}>{adminData?.probation_in_progress || 0} <span style={{ fontSize: 12, color: COLORS.muted, fontWeight: 500 }}>Active</span></div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 24, padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <BarChart3 size={20} color={COLORS.emerald} />
                  <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.text, textTransform: "uppercase", letterSpacing: "0.03em" }}>Goal Distribution</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                  <div style={{ padding: "20px", background: `${COLORS.accent}08`, borderRadius: 18, border: `1px solid ${COLORS.accent}15` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.accent, marginBottom: 8 }}>COMPANY</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.text }}>{adminData?.total_goals || 0}</div>
                  </div>
                  <div style={{ padding: "20px", background: `${COLORS.violet}08`, borderRadius: 18, border: `1px solid ${COLORS.violet}15` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.violet, marginBottom: 8 }}>ACTIVE</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.text }}>{adminData?.active_goals || 0}</div>
                  </div>
                  <div style={{ padding: "20px", background: `${COLORS.emerald}08`, borderRadius: 18, border: `1px solid ${COLORS.emerald}15` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.emerald, marginBottom: 8 }}>COMPLETED</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.text }}>{adminData?.completed_goals || 0}</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 24, padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <Zap size={20} color={COLORS.rose} />
                  <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.text, textTransform: "uppercase", letterSpacing: "0.03em" }}>Escalation Queue</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ padding: "14px 18px", background: `${COLORS.rose}08`, borderRadius: 16, border: `1px solid ${COLORS.rose}15`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.rose }}>Pending Escalations ({adminData?.pending_escalations || 0})</div>
                    <AlertTriangle size={16} color={COLORS.rose} />
                  </div>
                  <div style={{ padding: "14px 18px", background: `${COLORS.amber}08`, borderRadius: 16, border: `1px solid ${COLORS.amber}15`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.amber }}>At Risk Goals ({adminData?.at_risk_goals || 0})</div>
                    <Clock size={16} color={COLORS.amber} />
                  </div>
                </div>
              </div>
              <div style={{ background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 24, padding: 28 }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                    <Activity size={20} color={COLORS.accent} />
                    <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.text, textTransform: "uppercase", letterSpacing: "0.03em" }}>Automation Pulse</span>
                 </div>
                 <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                       <span style={{ fontSize: 13, color: COLORS.muted }}>Goal Completion</span>
                       <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.emerald }}>{stats.orgPerformance}%</span>
                    </div>
                    <ProgressBar progress={stats.orgPerformance} color={COLORS.emerald} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                       <div style={{ padding: "12px", background: COLORS.bg, borderRadius: 12, textAlign: "center" }}>
                          <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4 }}>TOTAL EMPLOYEES</div>
                          <div style={{ fontSize: 16, fontWeight: 800 }}>{adminData?.total_employees || 0}</div>
                       </div>
                    </div>
                 </div>
              </div>
              <div style={{ background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDim} 100%)`, borderRadius: 24, padding: 28, color: "white" }}>
                 <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Report Center</h3>
                 <button onClick={() => navigate('/reports')} style={{ width: "100%", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 12, padding: "12px", color: "white", fontWeight: 700 }}>
                    GO TO REPORTS
                 </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text }}>{currentUser.role === 'manager' ? 'Team Performance' : 'My Dashboard'}</h1>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          <StatCard label="Tasks Completed" value={stats.completed} icon={CheckCircle} color={COLORS.emerald} />
          <StatCard label="Tasks Remaining" value={stats.remaining} icon={Target} color={COLORS.accent} />
          <StatCard label="Current Progress" value={`${stats.avgCompletion}%`} icon={TrendingUp} color={COLORS.accent} />
          <StatCard label="At Risk Items" value={stats.atRisk} icon={AlertTriangle} color={COLORS.rose} />
        </div>
      </div>
    </Layout>
  );
}
