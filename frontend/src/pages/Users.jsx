import { useEffect, useState } from 'react';
import { 
  Plus, Edit, Trash2, UserPlus, Search, 
  Shield, User, Users as UsersIcon, Mail, 
  MapPin, Briefcase, ChevronRight, MoreHorizontal
} from 'lucide-react';
import Layout from '../components/Layout';
import { userService, teamService } from '../api';
import { UserRole } from '../constants/enums';
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

export default function Users() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, teamsRes] = await Promise.all([
        userService.getAll(),
        teamService.getAll()
      ]);
      setUsers(usersRes.data);
      setTeams(teamsRes.data);
    } catch (error) {
      toast.error('Failed to load user management data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently remove this user? This action cannot be undone.')) return;
    try {
      await userService.delete(id);
      toast.success('User removed from system');
      loadData();
    } catch (error) {
      toast.error('Deletion failed');
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
            <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.03em" }}>User Directory</h1>
            <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>Manage roles, access, and team assignments across the platform</p>
          </div>
          <button onClick={() => { setEditingUser(null); setShowModal(true); }}
            style={{
              background: COLORS.accent, border: "none",
              padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              color: "#fff", display: "flex", alignItems: "center", gap: 8,
              boxShadow: `0 4px 12px ${COLORS.accent}33`, cursor: "pointer",
            }}>
            <UserPlus size={16} /> Add New User
          </button>
        </div>

        {/* Global Toolbar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 16px", background: COLORS.surface,
          border: `1px solid ${COLORS.border}`, borderRadius: 14,
        }}>
          <Search size={16} color={COLORS.subtle} />
          <input type="text" placeholder="Search by name, email, or role..." style={{
            border: "none", background: "none", fontSize: 13, flex: 1, outline: "none",
          }} />
          <div style={{ width: 1, height: 20, background: COLORS.border }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted }}>{users.length} TOTAL USERS</span>
        </div>

        {/* Users Table */}
        <div style={{
          background: COLORS.card, border: `1px solid ${COLORS.border}`,
          borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: COLORS.bg, borderBottom: `1.5px solid ${COLORS.border}` }}>
                <th style={{ textAlign: "left", padding: "14px 24px", fontSize: 12, fontWeight: 800, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>User Details</th>
                <th style={{ textAlign: "left", padding: "14px 24px", fontSize: 12, fontWeight: 800, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Role & Auth</th>
                <th style={{ textAlign: "left", padding: "14px 24px", fontSize: 12, fontWeight: 800, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Team Alignment</th>
                <th style={{ textAlign: "left", padding: "14px 24px", fontSize: 12, fontWeight: 800, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Direct Manager</th>
                <th style={{ textAlign: "right", padding: "14px 24px", fontSize: 12, fontWeight: 800, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(users) ? users : []).map((user) => (
                <tr key={user.id} 
                  onClick={() => { setEditingUser(user); setShowModal(true); }}
                  style={{ borderBottom: `1px solid ${COLORS.border}`, transition: "background 0.2s", cursor: "pointer" }} 
                  className="user-row"
                >
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: user.role === 'admin' ? COLORS.violet : (user.role === 'manager' ? COLORS.accent : COLORS.emerald),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 800, color: "#fff",
                      }}>{user.name?.charAt(0)}</div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{user.name}</span>
                        <span style={{ fontSize: 12, color: COLORS.muted }}>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{
                      display: "inline-flex", padding: "4px 10px", borderRadius: 6,
                      background: user.role === 'admin' ? `${COLORS.violet}12` : (user.role === 'manager' ? `${COLORS.accent}12` : `${COLORS.emerald}12`),
                      color: user.role === 'admin' ? COLORS.violet : (user.role === 'manager' ? COLORS.accent : COLORS.emerald),
                      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                    }}>
                      {user.role}
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    {user.team ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <UsersIcon size={14} color={COLORS.subtle} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{user.team.name}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: COLORS.subtle }}>No assignment</span>
                    )}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    {user.manager ? (
                      <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{user.manager.name}</span>
                    ) : (
                      <span style={{ fontSize: 12, color: COLORS.subtle }}>Unmanaged</span>
                    )}
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      <button onClick={(e) => { e.stopPropagation(); setEditingUser(user); setShowModal(true); }}
                        style={{ background: COLORS.bg, border: "none", padding: 8, borderRadius: 8, cursor: "pointer", color: COLORS.muted }}>
                        <Edit size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(user.id); }}
                        style={{ background: `${COLORS.rose}08`, border: "none", padding: 8, borderRadius: 8, cursor: "pointer", color: COLORS.rose }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <style>{`.user-row:hover { background: ${COLORS.bg}40; }`}</style>
        </div>

        {showModal && (
          <UserModal
            user={editingUser}
            users={users}
            teams={teams}
            onClose={() => setShowModal(false)}
            onSuccess={() => { loadData(); setShowModal(false); }}
          />
        )}
      </div>
    </Layout>
  );
}

function UserModal({ user, users, teams, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || UserRole.EMPLOYEE,
    team_id: user?.team_id || '',
    manager_id: user?.manager_id || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData };
      if (!data.password && user) delete data.password;
      if (!data.team_id) data.team_id = null;
      if (!data.manager_id) data.manager_id = null;

      if (user) {
        await userService.update(user.id, data);
        toast.success('System record updated');
      } else {
        await userService.create(data);
        toast.success('New user provisioned');
      }
      onSuccess();
    } catch (error) {
      toast.error('Provisioning failed');
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
        width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 24,
        boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
      }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: COLORS.text }}>{user ? "Update Intelligence" : "Provision New Access"}</h3>
          <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>Configuration for platform identity and roles</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Full Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, outline: "none" }} required />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Email Credentials</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, outline: "none" }} required />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Security Token (Password)</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, outline: "none" }} required={!user} placeholder={user ? "••••••••" : ""} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Role Type</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, outline: "none", background: "#fff" }}>
                {Object.values(UserRole).map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Squad/Team</label>
              <select value={formData.team_id} onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, outline: "none", background: "#fff" }}>
                <option value="">No Team</option>
                {(Array.isArray(teams) ? teams : []).map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase" }}>Administrative Hierarchy (Manager)</label>
            <select value={formData.manager_id} onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
              style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, outline: "none", background: "#fff" }}>
              <option value="">No Manager</option>
              {(Array.isArray(users) ? users : []).filter(u => u.id !== user?.id).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: "12px", borderRadius: 11, border: `1.5px solid ${COLORS.border}`, background: "#fff", color: COLORS.muted, fontWeight: 700, cursor: "pointer" }}>
              Dismiss
            </button>
            <button type="submit"
              style={{ flex: 2, padding: "12px", borderRadius: 11, border: "none", background: COLORS.accent, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
              Confirm & Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
