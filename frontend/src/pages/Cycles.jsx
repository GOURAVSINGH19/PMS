import { useEffect, useState } from 'react';
import { 
  Plus, Calendar, Users, Activity, CheckCircle, 
  Clock, RefreshCw, Zap, ChevronRight, AlertTriangle
} from 'lucide-react';
import Layout from '../components/Layout';
import { cycleService } from '../api';
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

export default function Cycles() {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    loadCycles();
  }, []);

  const loadCycles = async () => {
    try {
      const response = await cycleService.getAll();
      setCycles(response.data);
    } catch (error) {
      toast.error('Failed to load cycles');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await cycleService.updateStatus(id, status);
      toast.success(`Cycle ${status}`);
      loadCycles();
    } catch (error) {
      toast.error('Status update failed');
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
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.03em" }}>Review Cycles</h1>
            <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>Manage performance orchestration and automated evaluation windows</p>
          </div>
          {currentUser?.role === 'admin' && (
            <button onClick={() => setShowModal(true)}
              style={{
                background: COLORS.accent, border: "none",
                padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                color: "#fff", display: "flex", alignItems: "center", gap: 8,
                boxShadow: `0 4px 12px ${COLORS.accent}33`, cursor: "pointer",
              }}>
              <Plus size={16} /> Create Cycle
            </button>
          )}
        </div>

        {/* Global Summary */}
        <div style={{ display: "flex", gap: 16, padding: "16px", background: `${COLORS.accent}08`, borderRadius: 16, border: `1px dashed ${COLORS.accent}40` }}>
           <div style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={16} color="#fff" />
           </div>
           <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.accent }}>Cycle Intelligence</div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                Currently <b>{(Array.isArray(cycles) ? cycles : []).filter(c => c.status === 'active').length} active</b> modules and <b>{(Array.isArray(cycles) ? cycles : []).filter(c => c.status === 'upcoming').length} scheduled</b> windows detected.
              </div>
           </div>
        </div>

        {/* Cycle List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {(Array.isArray(cycles) ? cycles : []).map((cycle) => (
            <div key={cycle.id} style={{
              background: COLORS.card, border: `1.5px solid ${COLORS.border}`,
              borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 20,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)", position: "relative",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 4, background: cycle.status === 'active' ? COLORS.emerald : (cycle.status === 'upcoming' ? COLORS.accent : COLORS.muted), borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: COLORS.text }}>{cycle.name}</h2>
                    <div style={{
                      padding: "4px 10px", borderRadius: 6,
                      background: cycle.status === 'active' ? `${COLORS.emerald}12` : (cycle.status === 'upcoming' ? `${COLORS.accent}12` : `${COLORS.muted}12`),
                      color: cycle.status === 'active' ? COLORS.emerald : (cycle.status === 'upcoming' ? COLORS.accent : COLORS.muted),
                      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    }}>
                      {cycle.status}
                    </div>
                    <div style={{
                      padding: "4px 10px", borderRadius: 6,
                      background: COLORS.bg, color: COLORS.muted,
                      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    }}>
                      {cycle.track.replace('_', ' ')}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.muted }}>
                      <Calendar size={14} /> Period: <b>{formatDate(cycle.period_start)} - {formatDate(cycle.period_end)}</b>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.muted }}>
                      <Zap size={14} /> Execution: <b>{formatDate(cycle.trigger_date)}</b>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  {currentUser?.role === 'admin' && cycle.status === 'upcoming' && (
                    <button onClick={() => handleUpdateStatus(cycle.id, 'active')}
                      style={{ background: COLORS.accent, border: "none", padding: "8px 16px", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                      Activate Cycle
                    </button>
                  )}
                  {currentUser?.role === 'admin' && cycle.status === 'active' && (
                    <button onClick={() => handleUpdateStatus(cycle.id, 'closed')}
                      style={{ background: COLORS.rose, border: "none", padding: "8px 16px", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                      Shutdown Cycle
                    </button>
                  )}
                  <button style={{ background: COLORS.bg, border: `1.5px solid ${COLORS.border}`, padding: "8px 16px", borderRadius: 10, color: COLORS.text, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                    View Metrics
                  </button>
                </div>
              </div>
            </div>
          ))}

          {cycles.length === 0 && !loading && (
            <div style={{ border: `2px dashed ${COLORS.border}`, borderRadius: 20, padding: 64, textAlign: "center", color: COLORS.subtle }}>
               No review orchestration windows defined.
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
    name: '',
    track: 'bi_annual',
    period_start: '',
    period_end: '',
    trigger_date: '',
    close_date: '',
    status: 'upcoming'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await cycleService.create(formData);
      toast.success('Review cycle commissioned');
      onSuccess();
    } catch (error) {
      toast.error('Commissioning failed');
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: COLORS.surface, borderRadius: 20, padding: 32,
        width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 24,
        boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
      }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: COLORS.text }}>Commission Review Window</h3>
          <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>Define performance monitoring periods and automated triggers</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Cycle Identity</label>
            <input type="text" placeholder="e.g. H1 2026 Strategy Review" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, outline: "none" }} required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
             <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
               <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Orchestration Track</label>
               <select value={formData.track} onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                 style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, outline: "none", background: "#fff" }}>
                 <option value="bi_annual">Bi-Annual</option>
                 <option value="quarterly">Quarterly</option>
               </select>
             </div>
             <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
               <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Initial Status</label>
               <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                 style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, outline: "none", background: "#fff" }}>
                 <option value="upcoming">Upcoming</option>
                 <option value="active">Active</option>
               </select>
             </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
             <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Period Start</label>
                <input type="date" value={formData.period_start} onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                  style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, outline: "none" }} required />
             </div>
             <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Period End</label>
                <input type="date" value={formData.period_end} onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                  style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, outline: "none" }} required />
             </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
             <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Trigger Date</label>
                <input type="date" value={formData.trigger_date} onChange={(e) => setFormData({ ...formData, trigger_date: e.target.value })}
                  style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, outline: "none" }} required />
             </div>
             <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Close Date</label>
                <input type="date" value={formData.close_date} onChange={(e) => setFormData({ ...formData, close_date: e.target.value })}
                  style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, outline: "none" }} required />
             </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: "12px", borderRadius: 11, border: `1.5px solid ${COLORS.border}`, background: "#fff", color: COLORS.muted, fontWeight: 700, cursor: "pointer" }}>
              Dismiss
            </button>
            <button type="submit"
              style={{ flex: 2, padding: "12px", borderRadius: 11, border: "none", background: COLORS.accent, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
              Validate & Deploy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
