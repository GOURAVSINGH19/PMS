import { useEffect, useState } from 'react';
import { 
  Plus, Calendar, Users, Clock, Zap, AlertTriangle
} from 'lucide-react';
import Layout from '../components/Layout';
import { cycleService } from '../api';
import { formatDate } from '../utils/format';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';

const COLORS = {
  bg: "#F5F4F0", surface: "#FFFFFF", card: "#FFFFFF", border: "#E4E2DC",
  accent: "#2563EB", accentDim: "#1D4ED8", emerald: "#059669",
  amber: "#D97706", rose: "#DC2626", violet: "#7C3AED",
  text: "#111111", muted: "#6B7280", subtle: "#9CA3AF",
};

export default function Cycles() {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => { loadCycles(); }, []);

  const loadCycles = async () => {
    try {
      const res = await cycleService.getAll();
      setCycles(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load cycles');
    } finally {
      setLoading(false);
    }
  };

  const handleTrigger = async (id) => {
    try {
      await cycleService.trigger(id);
      toast.success('Cycle triggered');
      loadCycles();
    } catch {
      toast.error('Trigger failed');
    }
  };

  const handleClose = async (id) => {
    try {
      await cycleService.close(id);
      toast.success('Cycle closed');
      loadCycles();
    } catch {
      toast.error('Close failed');
    }
  };

  if (currentUser?.role !== 'admin' && currentUser?.role !== 'manager') {
    return (
      <Layout>
        <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
          <AlertTriangle size={40} color={COLORS.rose} />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.text }}>Access Restricted</h2>
          <p style={{ fontSize: 14, color: COLORS.muted }}>Review cycle management is reserved for administrative personnel.</p>
        </div>
      </Layout>
    );
  }

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

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.03em" }}>Review Cycles</h1>
            <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>Manage performance evaluation windows and review schedules</p>
          </div>
          {currentUser?.role === 'admin' && (
            <button onClick={() => setShowModal(true)} style={{
              background: COLORS.accent, border: "none", padding: "10px 20px",
              borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#fff",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: `0 4px 12px ${COLORS.accent}33`, cursor: "pointer",
            }}>
              <Plus size={16} /> Create Cycle
            </button>
          )}
        </div>

        {/* Summary bar */}
        <div style={{ display: "flex", gap: 16, padding: "16px", background: `${COLORS.accent}08`, borderRadius: 16, border: `1px dashed ${COLORS.accent}40` }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={16} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.accent }}>Cycle Overview</div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
              <b>{cycles.filter(c => c.status === 'active').length} active</b> · <b>{cycles.filter(c => c.status === 'pending').length} pending</b> · <b>{cycles.filter(c => c.status === 'closed').length} closed</b>
            </div>
          </div>
        </div>

        {/* Cycle List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {cycles.map((cycle) => {
            const completion = cycle.total_forms > 0
              ? Math.round((cycle.submitted_forms / cycle.total_forms) * 100) : 0;
            const statusColor = cycle.status === 'active' ? COLORS.emerald : cycle.status === 'closed' ? COLORS.muted : COLORS.amber;
            return (
              <div key={cycle.id} style={{
                background: COLORS.card, border: `1.5px solid ${COLORS.border}`,
                borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 20,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)", position: "relative",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 4, background: statusColor, borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: COLORS.text }}>{cycle.cycle_name}</h2>
                      <div style={{
                        padding: "4px 10px", borderRadius: 6,
                        background: `${statusColor}15`, color: statusColor,
                        fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                      }}>{cycle.status}</div>
                      <div style={{
                        padding: "4px 10px", borderRadius: 6,
                        background: COLORS.bg, color: COLORS.muted,
                        fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                      }}>{(cycle.cycle_type || '').replace('_', ' ')}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.muted }}>
                        <Calendar size={13} /> {formatDate(cycle.start_date)} — {formatDate(cycle.end_date)}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.muted }}>
                        <Clock size={13} /> Self review by: <b>{formatDate(cycle.self_review_deadline)}</b>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.muted }}>
                        <Users size={13} /> Forms: <b>{cycle.submitted_forms}/{cycle.total_forms}</b>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    {currentUser?.role === 'admin' && cycle.status === 'pending' && (
                      <button onClick={() => handleTrigger(cycle.id)} style={{
                        background: COLORS.accent, border: "none", padding: "8px 16px",
                        borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer",
                      }}>Trigger Cycle</button>
                    )}
                    {currentUser?.role === 'admin' && cycle.status === 'active' && (
                      <button onClick={() => handleClose(cycle.id)} style={{
                        background: COLORS.rose, border: "none", padding: "8px 16px",
                        borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer",
                      }}>Close Cycle</button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {cycle.total_forms > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700 }}>
                      <span style={{ color: COLORS.muted }}>SUBMISSION PROGRESS</span>
                      <span style={{ color: COLORS.text }}>{completion}%</span>
                    </div>
                    <div style={{ width: "100%", height: 6, background: COLORS.bg, borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ width: `${completion}%`, height: "100%", background: COLORS.accent, borderRadius: 10, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {cycles.length === 0 && (
            <div style={{ border: `2px dashed ${COLORS.border}`, borderRadius: 20, padding: 64, textAlign: "center", color: COLORS.subtle }}>
              No review cycles found. Create one to get started.
            </div>
          )}
        </div>

        {showModal && (
          <CycleModal
            onClose={() => setShowModal(false)}
            onSuccess={() => { loadCycles(); setShowModal(false); }}
          />
        )}
      </div>
    </Layout>
  );
}

function CycleModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    cycle_name: '', cycle_type: 'quarterly',
    start_date: '', end_date: '',
    self_review_deadline: '', manager_review_deadline: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await cycleService.create(formData);
      toast.success('Review cycle created');
      onSuccess();
    } catch {
      toast.error('Failed to create cycle');
    }
  };

  const field = (label, key, type = "text", opts = {}) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>{label}</label>
      <input type={type} value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
        style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, outline: "none" }}
        required {...opts} />
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: COLORS.surface, borderRadius: 20, padding: 32, width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 24, boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: COLORS.text }}>Create Review Cycle</h3>
          <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>Define a new performance evaluation window</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {field("Cycle Name", "cycle_name", "text", { placeholder: "e.g. Q2 2026 Performance Review" })}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Cycle Type</label>
            <select value={formData.cycle_type} onChange={(e) => setFormData({ ...formData, cycle_type: e.target.value })}
              style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, outline: "none", background: "#fff" }}>
              <option value="quarterly">Quarterly</option>
              <option value="bi_annual">Bi-Annual</option>
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {field("Start Date", "start_date", "date")}
            {field("End Date", "end_date", "date")}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {field("Self Review Deadline", "self_review_deadline", "date")}
            {field("Manager Review Deadline", "manager_review_deadline", "date")}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 11, border: `1.5px solid ${COLORS.border}`, background: "#fff", color: COLORS.muted, fontWeight: 700, cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" style={{ flex: 2, padding: "12px", borderRadius: 11, border: "none", background: COLORS.accent, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
              Create Cycle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
