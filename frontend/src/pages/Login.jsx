import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Key, User } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const role = await login(email, password);
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (role) => {
    if (role === 'admin') { setEmail('admin@pms.io'); setPassword('admin123'); }
    if (role === 'manager') { setEmail('manager@pms.io'); setPassword('manager123'); }
    if (role === 'employee') { setEmail('employee@pms.io'); setPassword('emp123'); }
  };

  return (
    <div className="login-page">
      <div className="login-bg-orb orb1"></div>
      <div className="login-bg-orb orb2"></div>
      
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-circle">✨</div>
          <h1>PMS Pro</h1>
          <p>Performance & Goal Management</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="quick-login-row">
          <button type="button" className="quick-login-btn admin" onClick={() => autofill('admin')}>Admin</button>
          <button type="button" className="quick-login-btn manager" onClick={() => autofill('manager')}>Manager</button>
          <button type="button" className="quick-login-btn employee" onClick={() => autofill('employee')}>Employee</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 14, top: 12, color: 'var(--text-secondary)'}} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: 40 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Key size={16} style={{ position: 'absolute', left: 14, top: 12, color: 'var(--text-secondary)'}} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: 40 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }} disabled={loading}>
            {loading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <><LogIn size={16} /> Sign In</>}
          </button>
        </form>
      </div>
    </div>
  );
}
