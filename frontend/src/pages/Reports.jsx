import { useEffect, useState } from 'react';
import { FileText, Download, TrendingUp, Users, Target, Shield, Filter, Activity, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import { adminService } from '../api';
import toast from 'react-hot-toast';

const COLORS = {
  bg: "#F5F4F0", surface: "#FFFFFF", card: "#FFFFFF", border: "#E4E2DC",
  accent: "#2563EB", emerald: "#059669", amber: "#D97706", rose: "#DC2626",
  violet: "#7C3AED", text: "#111111", muted: "#6B7280", subtle: "#9CA3AF",
};

export default function Reports() {
  const [goalsData, setGoalsData] = useState({ data: [], total: 0 });
  const [probationData, setProbationData] = useState({ data: [], total: 0 });
  const [reviewsData, setReviewsData] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [g, p, r] = await Promise.all([
        adminService.getReportsGoals(),
        adminService.getReportsProbation(),
        adminService.getReportsReviews(),
      ]);
      setGoalsData(g.data);
      setProbationData(p.data);
      setReviewsData(r.data);
    } catch {
      toast.error('Failed to load reports');
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

  const goals = goalsData.data || [];
  const probations = probationData.data || [];
  const reviews = reviewsData.data || [];

  const activeGoals = goals.filter(g => g.status === 'active').length;
  const completedGoals = goals.filter(g => g.status === 'scored').length;
  const atRiskGoals = goals.filter(g => g.is_at_risk).length;
  const activeProbations = probations.filter(p => p.status === 'in_probation').length;
  const activeReviews = reviews.filter(r => r.status === 'active').length;

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.03em" }}>Reports & Analytics</h1>
            <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>Organisation-wide performance analytics and audit trails</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {[
            { label: "Total Goals", value: goals.length, icon: Target, color: COLORS.accent },
            { label: "Active Goals", value: activeGoals, icon: Activity, color: COLORS.emerald },
            { label: "At Risk Goals", value: atRiskGoals, icon: AlertTriangle, color: COLORS.rose },
            { label: "Active Probations", value: activeProbations, icon: Shield, color: COLORS.amber },
          ].map((stat, i) => (
            <div key={i} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${stat.color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <stat.icon size={18} color={stat.color} />
                </div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.text }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Goals Report */}
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 20, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 10 }}>
            <Target size={18} color={COLORS.accent} />
            <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.text }}>Goals Report</span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: COLORS.muted }}>{goals.length} total</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: COLORS.bg }}>
                {["Title", "Level", "Status", "Priority", "Completion", "At Risk"].map(h => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {goals.slice(0, 10).map(g => (
                <tr key={g.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: COLORS.text }}>{g.title}</td>
                  <td style={{ padding: "14px 20px", fontSize: 12, color: COLORS.muted, textTransform: "capitalize" }}>{g.level}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: g.status === 'active' ? `${COLORS.emerald}12` : `${COLORS.muted}12`, color: g.status === 'active' ? COLORS.emerald : COLORS.muted, textTransform: "capitalize" }}>{g.status}</span>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 12, color: COLORS.muted, textTransform: "capitalize" }}>{g.priority}</td>
                  <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: COLORS.accent }}>{g.completion_pct || 0}%</td>
                  <td style={{ padding: "14px 20px" }}>
                    {g.is_at_risk ? <span style={{ color: COLORS.rose, fontSize: 11, fontWeight: 700 }}>⚠ AT RISK</span> : <span style={{ color: COLORS.emerald, fontSize: 11, fontWeight: 700 }}>✓ OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Probation & Reviews side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Probation Report */}
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <Shield size={18} color={COLORS.amber} />
              <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.text }}>Probation Report</span>
              <span style={{ marginLeft: "auto", fontSize: 12, color: COLORS.muted }}>{probations.length} records</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {probations.map(p => (
                <div key={p.id} style={{ padding: "14px 20px", borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>Employee #{p.employee_id}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted }}>Joined: {p.date_of_joining}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: `${COLORS.amber}12`, color: COLORS.amber, textTransform: "capitalize" }}>{p.status}</span>
                    <span style={{ fontSize: 11, color: COLORS.muted }}>{p.triggers_count} triggers</span>
                  </div>
                </div>
              ))}
              {probations.length === 0 && <div style={{ padding: 32, textAlign: "center", color: COLORS.subtle }}>No probation records</div>}
            </div>
          </div>

          {/* Reviews Report */}
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <FileText size={18} color={COLORS.violet} />
              <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.text }}>Review Cycles Report</span>
              <span style={{ marginLeft: "auto", fontSize: 12, color: COLORS.muted }}>{reviews.length} cycles</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {reviews.map(r => (
                <div key={r.cycle_id} style={{ padding: "14px 20px", borderTop: `1px solid ${COLORS.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{r.cycle_name}</div>
                    <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: `${COLORS.muted}12`, color: COLORS.muted, textTransform: "capitalize" }}>{r.status}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.muted, marginBottom: 6 }}>
                    <span>Forms: {r.submitted_forms}/{r.total_forms}</span>
                    <span>{r.completion_rate}% complete</span>
                  </div>
                  <div style={{ width: "100%", height: 4, background: COLORS.bg, borderRadius: 10 }}>
                    <div style={{ width: `${r.completion_rate}%`, height: "100%", background: COLORS.accent, borderRadius: 10 }} />
                  </div>
                </div>
              ))}
              {reviews.length === 0 && <div style={{ padding: 32, textAlign: "center", color: COLORS.subtle }}>No review cycles</div>}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
