import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart2, Target, Users, Calendar, Inbox, 
  ShieldAlert, Settings, LogOut, Bell, Flag 
} from 'lucide-react';
import api from '../api/client';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.unread);
      } catch (e) {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  if (!user) return null;

  const getRoleColorClass = () => {
    if (user.role === 'admin') return 'badge-admin';
    if (user.role === 'manager') return 'badge-manager';
    return 'badge-employee';
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon">✨</div>
            PMS Pro
          </div>
          <span className={`sidebar-role-badge ${getRoleColorClass()}`}>
            {user.role}
          </span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Overview</div>
          
          {user.role === 'admin' && (
            <NavLink to="/admin" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <BarChart2 className="nav-icon" /> Dashboard
            </NavLink>
          )}
          
          {(user.role === 'manager' || user.role === 'employee') && (
            <NavLink to="/dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <BarChart2 className="nav-icon" /> Dashboard
            </NavLink>
          )}

          {user.role === 'manager' && (
            <NavLink to="/team" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users className="nav-icon" /> My Team
            </NavLink>
          )}

          <div className="nav-section-title" style={{ marginTop: '16px' }}>Performance</div>
          
          <NavLink to="/goals" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Target className="nav-icon" /> Goals (GMS)
          </NavLink>
          
          <NavLink to="/feedback" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Inbox className="nav-icon" /> Feedback Forms
          </NavLink>

          <NavLink to="/probation" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Calendar className="nav-icon" /> Probation
          </NavLink>

          {user.role === 'admin' && (
            <>
              <div className="nav-section-title" style={{ marginTop: '16px' }}>Administration</div>
              <NavLink to="/admin/flags" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                <Flag className="nav-icon" /> Flag Queue
              </NavLink>
              <NavLink to="/admin/cycles" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                <Settings className="nav-icon" /> Review Cycles
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div className="avatar-name" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user.name}
            </div>
          </div>
          <button className="sidebar-logout" onClick={logout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title"></div>
          <div className="topbar-actions">
            <button className="topbar-icon-btn" onClick={() => navigate('/notifications')}>
              <Bell size={18} />
              {unreadCount > 0 && <span className="notif-dot"></span>}
            </button>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
