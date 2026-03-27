import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, TrendingUp, Clock, AlertCircle, CheckCircle, Users, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import { goalService } from '../services/goal';
import { userService } from '../services/user';
import { teamService } from '../services/team';
import { GoalStatus, STATUS_COLORS, PRIORITY_COLORS } from '../constants/enums';
import { formatEnumValue, formatDate } from '../utils/format';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [goals, setGoals] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (currentUser?.role === 'admin') {
        const [goalsRes, usersRes, teamsRes] = await Promise.all([
          goalService.getAll(),
          userService.getAll(),
          teamService.getAll()
        ]);
        setGoals(goalsRes.data);
        setUsers(usersRes.data);
        setTeams(teamsRes.data);
      } else if (currentUser?.role === 'manager') {
        const [goalsRes, usersRes] = await Promise.all([
          goalService.getAll(),
          userService.getAll()
        ]);
        console.log('Manager - Current user team_id:', currentUser.team_id);
        console.log('Manager - All goals:', goalsRes.data);
        console.log('Manager - All users:', usersRes.data);
        setGoals(goalsRes.data);
        setUsers(usersRes.data);
      } else {
        const goalsRes = await goalService.getAll();
        setGoals(goalsRes.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter goals based on role and filters
  const filteredGoals = goals.filter(goal => {
    // Role-based filtering
    if (currentUser?.role === 'member') {
      if (goal.assignee_id !== currentUser.id && goal.creator_id !== currentUser.id) return false;
    } else if (currentUser?.role === 'manager') {
      // Manager sees goals where assignee is in their team OR goal is assigned to them
      const isTeamMemberGoal = goal.assignee?.team_id === currentUser.team_id;
      const isOwnGoal = goal.assignee_id === currentUser.id;
      
      console.log('Filtering goal:', goal.id, 'assignee team_id:', goal.assignee?.team_id, 'manager team_id:', currentUser.team_id, 'match:', isTeamMemberGoal);
      
      if (!isTeamMemberGoal && !isOwnGoal) return false;
    }

    // Team filter (admin only)
    if (selectedTeam !== 'all') {
      if (goal.assignee?.team_id !== parseInt(selectedTeam)) return false;
    }

    // User filter
    if (selectedUser !== 'all') {
      if (goal.assignee_id !== parseInt(selectedUser)) return false;
    }

    // Status filter
    if (selectedStatus !== 'all') {
      if (goal.status !== selectedStatus) return false;
    }

    return true;
  });

  const stats = {
    total: filteredGoals.length,
    active: filteredGoals.filter(g => g.status === GoalStatus.ACTIVE).length,
    completed: filteredGoals.filter(g => g.status === GoalStatus.COMPLETED).length,
    atRisk: filteredGoals.filter(g => g.is_at_risk).length,
    pending: filteredGoals.filter(g => g.status === GoalStatus.PENDING_APPROVAL).length,
    draft: filteredGoals.filter(g => g.status === GoalStatus.DRAFT).length,
    awaitingFeedback: filteredGoals.filter(g => g.status === GoalStatus.AWAITING_FEEDBACK).length,
    scorable: filteredGoals.filter(g => g.status === GoalStatus.SCORABLE).length,
    scored: filteredGoals.filter(g => g.status === GoalStatus.SCORED).length
  };

  // Team members for manager
  const teamMembers = currentUser?.role === 'manager' 
    ? users.filter(u => u.team_id === currentUser.team_id && u.id !== currentUser.id)
    : [];

  const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
    <div onClick={onClick} className={`card hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentUser?.role === 'admin' && 'Admin Dashboard'}
              {currentUser?.role === 'manager' && 'Team Dashboard'}
              {currentUser?.role === 'member' && 'My Dashboard'}
            </h1>
            <p className="text-gray-600 mt-1">
              {currentUser?.role === 'admin' && 'Overview of all goals across organization'}
              {currentUser?.role === 'manager' && `Managing ${teamMembers.length} team members`}
              {currentUser?.role === 'member' && 'Track your personal goals and progress'}
            </p>
          </div>
          <Link to="/goals/new" className="btn btn-primary">
            Create Goal
          </Link>
        </div>

        {/* Filters */}
        {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
          <div className="card">
            <div className="flex items-center space-x-2 mb-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentUser?.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                  <select 
                    value={selectedTeam} 
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="input"
                  >
                    <option value="all">All Teams</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {currentUser?.role === 'admin' ? 'User' : 'Team Member'}
                </label>
                <select 
                  value={selectedUser} 
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="input"
                >
                  <option value="all">All Users</option>
                  {(currentUser?.role === 'admin' 
                    ? (selectedTeam === 'all' ? users : users.filter(u => u.team_id === parseInt(selectedTeam)))
                    : teamMembers
                  ).map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input"
                >
                  <option value="all">All Statuses</option>
                  {Object.values(GoalStatus).map(status => (
                    <option key={status} value={status}>{formatEnumValue(status)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard 
            icon={Target} 
            label="Total Goals" 
            value={stats.total} 
            color="bg-primary-600"
            onClick={() => setSelectedStatus('all')}
          />
          <StatCard 
            icon={TrendingUp} 
            label="Active" 
            value={stats.active} 
            color="bg-blue-600"
            onClick={() => setSelectedStatus(GoalStatus.ACTIVE)}
          />
          <StatCard 
            icon={CheckCircle} 
            label="Completed" 
            value={stats.completed} 
            color="bg-green-600"
            onClick={() => setSelectedStatus(GoalStatus.COMPLETED)}
          />
          <StatCard 
            icon={AlertCircle} 
            label="At Risk" 
            value={stats.atRisk} 
            color="bg-red-600"
          />
          <StatCard 
            icon={Clock} 
            label="Pending" 
            value={stats.pending} 
            color="bg-yellow-600"
            onClick={() => setSelectedStatus(GoalStatus.PENDING_APPROVAL)}
          />
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            icon={Target} 
            label="Draft" 
            value={stats.draft} 
            color="bg-gray-600"
            onClick={() => setSelectedStatus(GoalStatus.DRAFT)}
          />
          <StatCard 
            icon={Target} 
            label="Awaiting Feedback" 
            value={stats.awaitingFeedback} 
            color="bg-purple-600"
            onClick={() => setSelectedStatus(GoalStatus.AWAITING_FEEDBACK)}
          />
          <StatCard 
            icon={Target} 
            label="Scorable" 
            value={stats.scorable} 
            color="bg-indigo-600"
            onClick={() => setSelectedStatus(GoalStatus.SCORABLE)}
          />
          <StatCard 
            icon={Target} 
            label="Scored" 
            value={stats.scored} 
            color="bg-emerald-600"
            onClick={() => setSelectedStatus(GoalStatus.SCORED)}
          />
        </div>

        {/* Team Members Overview (Manager only) */}
        {currentUser?.role === 'manager' && teamMembers.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Team Members</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map(member => {
                const memberGoals = filteredGoals.filter(g => g.assignee_id === member.id);
                const activeGoals = memberGoals.filter(g => g.status === GoalStatus.ACTIVE).length;
                const completedGoals = memberGoals.filter(g => g.status === GoalStatus.COMPLETED).length;
                
                return (
                  <div 
                    key={member.id} 
                    onClick={() => setSelectedUser(member.id.toString())}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <div className="mt-3 flex space-x-4 text-sm">
                      <div>
                        <span className="text-gray-600">Active:</span>
                        <span className="ml-1 font-semibold text-blue-600">{activeGoals}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Completed:</span>
                        <span className="ml-1 font-semibold text-green-600">{completedGoals}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Goals List */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Goals Overview</h2>
          <div className="space-y-3">
            {filteredGoals.slice(0, 10).map((goal) => (
              <Link
                key={goal.id}
                to={`/goals/${goal.id}`}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900">{goal.title}</h3>
                    {goal.is_at_risk && (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium">
                        ⚠ At Risk
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span className="capitalize">{goal.level}</span>
                    <span>•</span>
                    <span className="capitalize">{goal.tag}</span>
                    <span>•</span>
                    <span>{goal.assignee?.name || 'Unassigned'}</span>
                    {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && goal.assignee?.team?.name && (
                      <>
                        <span>•</span>
                        <span className="text-primary-600">{goal.assignee.team.name}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>Due: {formatDate(goal.due_date)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[goal.priority]}`}>
                    {formatEnumValue(goal.priority)}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-medium">{goal.completion_percentage}%</div>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${goal.completion_percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[goal.status]}`}>
                    {formatEnumValue(goal.status)}
                  </span>
                </div>
              </Link>
            ))}
            {filteredGoals.length === 0 && (
              <p className="text-center text-gray-500 py-8">No goals found. Create your first goal!</p>
            )}
            {filteredGoals.length > 10 && (
              <p className="text-center text-gray-600 py-4">
                Showing 10 of {filteredGoals.length} goals
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
