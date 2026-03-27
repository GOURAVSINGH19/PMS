import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Target, Users, UserCircle, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../store/auth';

export default function Layout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <Target className="w-8 h-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">GMS</span>
              </Link>
              
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                
                {user?.role === 'admin' && (
                  <>
                    <Link
                      to="/users"
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                        isActive('/users') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <UserCircle className="w-4 h-4" />
                      <span>Users</span>
                    </Link>
                    
                    <Link
                      to="/teams"
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                        isActive('/teams') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Teams</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <div className="font-medium text-gray-900">{user?.name}</div>
                <div className="text-gray-500 capitalize">{user?.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
