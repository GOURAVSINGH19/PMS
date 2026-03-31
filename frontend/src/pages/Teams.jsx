import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Edit, Trash2, Users as UsersIcon,
  ShieldCheck, ArrowUpRight, ChevronRight,
  Target, Activity, MoreHorizontal, Zap, RefreshCw, AlertTriangle
} from 'lucide-react';
import Layout from '../components/Layout';
import { teamService, userService, goalService, feedbackService } from '../api';
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

export default function Teams() {
  const { user: currentUser } = useAuthStore();
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(false);
  
  const isAdmin = currentUser?.role === 'admin';  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setError(false);
    setLoading(true);
    try {
      const [teamsRes, usersRes, goalsRes, feedbacksRes] = await Promise.all([
        teamService.getAll(),
        userService.getAll(),
        goalService.getAll(),
        feedbackService.getAll()
      ]);
      setTeams(teamsRes.data);
      setUsers(usersRes.data);
      setGoals(goalsRes.data);
      setFeedbacks(feedbacksRes.data);
    } catch (error) {
      setError(true);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Dissolve this team? This will unassign all members.')) return;
    try {
      await teamService.delete(id);
      toast.success('Team dissolved');
      loadData();
    } catch (error) {
      toast.error('Action failed');
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
            <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.03em" }}>Squads & Brigades</h1>
            <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>Organisational structure and cross-functional performance tracking</p>
          </div>
          {isAdmin && (
            <button onClick={() => { setEditingTeam(null); setShowModal(true); }}
              style={{
                background: COLORS.accent, border: "none",
                padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                color: "#fff", display: "flex", alignItems: "center", gap: 8,
                boxShadow: `0 4px 12px ${COLORS.accent}33`, cursor: "pointer",
              }}>
              <Plus size={16} /> Form New Squad
            </button>
          )}
        </div>

        {/* Global Performance Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {[
            { label: "Active Squads", value: teams.length, icon: UsersIcon, color: COLORS.accent },
            { label: "Total Members", value: users.length, icon: ShieldCheck, color: COLORS.emerald },
            {
              label: "Compliance Rate",
              value: users.length > 0
                ? `${Math.round((feedbacks.filter(f => f.status === 'submitted').length / (users.length * 2 || 1)) * 100)}%`
                : "0%",
              icon: Activity, color: COLORS.violet
            },
          ].map((stat, i) => (
            <div key={i} style={{
              background: COLORS.card, border: `1px solid ${COLORS.border}`,
              borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${stat.color}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <stat.icon size={18} color={stat.color} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>{stat.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.text }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Team Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          {(Array.isArray(teams) ? teams : []).map((team) => {
            const teamMembers = Array.isArray(team.members) ? team.members : [];
            const teamMemberIds = teamMembers.map(m => m.id);
            const teamGoals = (Array.isArray(goals) ? goals : []).filter(g => teamMemberIds.includes(g.owner_id));
            const avgProgress = teamGoals.length > 0
              ? Math.round(teamGoals.reduce((acc, g) => acc + (g.completion_pct || 0), 0) / teamGoals.length)
              : 0;

            return (
              <div key={team.id}
                onClick={() => navigate(`/goals?team_id=${team.id}`)}
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
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.01em" }}>{team.name}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted }}>LEAD:</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>{team.manager?.name || "Unassigned"}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {(isAdmin || team.manager_id === currentUser?.id) && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setEditingTeam(team); setShowModal(true); }}
                          style={{ background: COLORS.bg, border: "none", padding: 6, borderRadius: 6, cursor: "pointer", color: COLORS.muted }}>
                          <Edit size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(team.id); }}
                          style={{ background: `${COLORS.rose}08`, border: "none", padding: 6, borderRadius: 6, cursor: "pointer", color: COLORS.rose }}>
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted }}>VELOCITY</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: COLORS.accent }}>{avgProgress}%</span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: COLORS.bg, borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ width: `${avgProgress}%`, height: "100%", background: COLORS.accent, borderRadius: 10 }} />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${COLORS.border}` }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {teamMembers.slice(0, 3).map((m, i) => (
                      <div key={i} style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: COLORS.bg, border: `2px solid ${COLORS.card}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: 800, color: COLORS.muted,
                        marginLeft: i === 0 ? 0 : -8,
                        zIndex: 3 - i,
                      }}>{m.name?.charAt(0)}</div>
                    ))}
                    {teamMembers.length > 3 && (
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: COLORS.bg, border: `2px solid ${COLORS.card}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: 800, color: COLORS.muted,
                        marginLeft: -8, zIndex: 0,
                      }}>+{teamMembers.length - 3}</div>
                    )}
                    <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, marginLeft: 8 }}>{teamMembers.length} Members</span>
                  </div>
                  <ChevronRight size={14} color={COLORS.subtle} />
                </div>
              </div>
            );
          })}
        </div>

        {teams.length === 0 && (
          <div style={{ border: `2px dashed ${COLORS.border}`, borderRadius: 20, padding: 64, textAlign: "center", color: COLORS.subtle }}>
            No squads formed yet.
          </div>
        )}

        {showModal && (
          <TeamModal
            team={editingTeam}
            users={users}
            onClose={() => setShowModal(false)}
            onSuccess={() => { loadData(); setShowModal(false); }}
          />
        )}
      </div>
    </Layout>
  );
}

function TeamModal({ team, users, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: team?.name || '',
    manager_id: team?.manager_id || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData };
      if (!data.manager_id) data.manager_id = null;

      if (team) {
        await teamService.update(team.id, data);
        toast.success('Squad configuration updated');
      } else {
        await teamService.create(data);
        toast.success('New squad commissioned');
      }
      onSuccess();
    } catch (error) {
      toast.error('Operation failed');
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
        width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 24,
        boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
      }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: COLORS.text }}>{team ? "Reconfigure Squad" : "Commission New Squad"}</h3>
          <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>Define administrative grouping and leadership</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Squad Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, outline: "none" }} required
              placeholder="e.g. Engineering Brigade" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Operational Lead (Manager)</label>
            <select value={formData.manager_id} onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
              style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, outline: "none", background: "#fff" }}>
              <option value="">No Lead assigned</option>
              {(Array.isArray(users) ? users : []).filter(u => u.role === 'manager' || u.role === 'admin').map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: "12px", borderRadius: 11, border: `1.5px solid ${COLORS.border}`, background: "#fff", color: COLORS.muted, fontWeight: 700, cursor: "pointer" }}>
              Dismiss
            </button>
            <button type="submit"
              style={{ flex: 2, padding: "12px", borderRadius: 11, border: "none", background: COLORS.accent, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
              Confirm Squad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
