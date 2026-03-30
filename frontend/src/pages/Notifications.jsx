import { useEffect, useState } from 'react';
import { 
  Bell, CheckCircle, Clock, Target, 
  MessageSquare, Shield, Zap, Trash2, 
  Search, Filter, Inbox
} from 'lucide-react';
import Layout from '../components/Layout';
import { notificationService } from '../api';
import { formatDate } from '../utils/format';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const COLORS = {
  bg: "#F5F4F0",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  border: "#E4E2DC",
  accent: "#2563EB",
  emerald: "#059669",
  amber: "#D97706",
  rose: "#DC2626",
  violet: "#7C3AED",
  text: "#111111",
  muted: "#6B7280",
  subtle: "#9CA3AF",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data);
    } catch (e) {
      toast.error('Strategic inbox inaccessible');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      toast.error('Signal update failed');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success('Strategy cleared');
    } catch (e) {
      toast.error('Bulk update failed');
    }
  };

  const getIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('goal')) return { icon: Target, color: COLORS.accent };
    if (t.includes('review') || t.includes('feedback')) return { icon: MessageSquare, color: COLORS.violet };
    if (t.includes('probation')) return { icon: Shield, color: COLORS.amber };
    if (t.includes('score')) return { icon: Zap, color: COLORS.emerald };
    return { icon: Bell, color: COLORS.muted };
  };

  if (loading) return (
    <Layout>
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.accent, animation: "spin 1s linear infinite" }} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: `${COLORS.accent}12`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Inbox size={24} color={COLORS.accent} />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.04em" }}>Strategic Inbox</h1>
              <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{unreadCount} unread deployment alerts</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} style={{
              padding: "10px 18px", borderRadius: 10, background: COLORS.bg,
              border: `1.5px solid ${COLORS.border}`, fontSize: 13, fontWeight: 700,
              color: COLORS.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.2s"
            }}>
              <CheckCircle size={15} /> Mark all as read
            </button>
          )}
        </div>

        {/* Notif List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notifications.map((n) => {
            const { icon: CategoryIcon, color } = getIcon(n.notification_type);
            return (
              <div 
                key={n.id} 
                onClick={() => {
                  if (!n.is_read) markAsRead(n.id);
                  if (n.action_url) navigate(n.action_url);
                }}
                style={{
                  background: COLORS.surface,
                  border: `1.5px solid ${n.is_read ? COLORS.border : color + '40'}`,
                  borderRadius: 18, padding: "20px 24px",
                  display: "flex", alignItems: "flex-start", gap: 20,
                  cursor: "pointer", position: "relative",
                  transition: "all 0.2s",
                  boxShadow: n.is_read ? "none" : `0 4px 15px -4px ${color}15`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  e.currentTarget.style.borderColor = color;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.borderColor = n.is_read ? COLORS.border : color + '40';
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: `${color}10`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <CategoryIcon size={20} color={color} />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.text }}>{n.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted }}>{formatDate(n.created_at)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.5, maxWidth: "95%" }}>{n.message}</p>
                </div>
                {!n.is_read && (
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", background: color,
                    marginTop: 6,
                  }} />
                )}
              </div>
            );
          })}

          {notifications.length === 0 && (
            <div style={{
              padding: "80px 40px", textAlign: "center",
              background: COLORS.bg, borderRadius: 24,
              border: `2px dashed ${COLORS.border}`,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
            }}>
              <Bell size={48} color={COLORS.subtle} style={{ opacity: 0.5 }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.text }}>Strategy Silent</div>
                <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>Your strategic signal is clear. No new alerts detected.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
