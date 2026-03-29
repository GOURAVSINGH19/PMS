import { useEffect, useState } from 'react';
import { 
  FileText, Download, TrendingUp, Users, Target, Shield, 
  ChevronRight, Calendar, Filter, Zap, Activity, Briefcase,
  BarChart2, PieChart as PieChartIcon, AlertTriangle
} from 'lucide-react';
import Layout from '../components/Layout';
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



export default function Reports() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const orgPerformance = [
    { name: "Jan", execution: 45, compliance: 88, risk: 12 },
    { name: "Feb", execution: 52, compliance: 92, risk: 8 },
    { name: "Mar", execution: 68, compliance: 95, risk: 5 },
  ];

  const distribution = [
    { name: 'Exceeding', value: 24, color: COLORS.emerald },
    { name: 'On Track', value: 58, color: COLORS.accent },
    { name: 'Below Target', value: 12, color: COLORS.amber },
    { name: 'At Risk', value: 6, color: COLORS.rose },
  ];

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
            <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.03em" }}>Intelligence & Reports</h1>
            <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>Organisation-wide performance analytics and audit trails</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              color: COLORS.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
            }}>
              <Filter size={14} /> Global Filters
            </button>
            <button style={{
              background: COLORS.accent, border: "none",
              padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              boxShadow: `0 4px 12px ${COLORS.accent}33`,
            }}>
              <Download size={14} /> Generate Organisational PDF
            </button>
          </div>
        </div>

        {/* Global KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
           {[
             { label: "Overall Organisation Health", value: "92.4%", icon: Activity, color: COLORS.emerald, desc: "Based on goal completion & feedback" },
             { label: "Review Compliance", value: "98.1%", icon: Shield, color: COLORS.accent, desc: "On-time review submissions" },
             { label: "At-Risk Strategic Items", value: "6", icon: AlertTriangle, color: COLORS.rose, desc: "Requires immediate intervention" },
           ].map((stat, i) => (
             <div key={i} style={{
               background: COLORS.card, border: `1px solid ${COLORS.border}`,
               borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 12,
               boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
             }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                   <div style={{ width: 40, height: 40, borderRadius: 12, background: `${stat.color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <stat.icon size={20} color={stat.color} />
                   </div>
                   <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.emerald }}>+2.4% vs LY</span>
                </div>
                <div style={{ marginTop: 4 }}>
                   <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.text }}>{stat.value}</div>
                   <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted }}>{stat.label}</div>
                   <div style={{ fontSize: 11, color: COLORS.subtle, marginTop: 4 }}>{stat.desc}</div>
                </div>
             </div>
           ))}
        </div>



        {/* Report Sections */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          {[
            { label: "Cycle Audit Log", count: "24 Logs today", detail: "Track every approval move" },
            { label: "Goal Variance Report", count: "14 Items flagged", detail: "Identify divergent goals" },
            { label: "Feedback Compliance", count: "98% Completed", detail: "Response rate tracking" },
          ].map((r, i) => (
            <div key={i} style={{
              background: COLORS.card, border: `1px solid ${COLORS.border}`,
              borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16,
              cursor: "pointer", transition: "background 0.2s",
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                 <FileText size={18} color={COLORS.muted} />
              </div>
              <div>
                 <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text }}>{r.label}</div>
                 <div style={{ fontSize: 12, color: COLORS.emerald, fontWeight: 600 }}>{r.count}</div>
                 <div style={{ fontSize: 11, color: COLORS.subtle, marginTop: 1 }}>{r.detail}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </Layout>
  );
}
