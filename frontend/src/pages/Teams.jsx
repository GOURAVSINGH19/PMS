import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { teamService } from '../services/team';
import { userService } from '../services/user';
import toast from 'react-hot-toast';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [teamsRes, usersRes] = await Promise.all([
        teamService.getAll(),
        userService.getAll()
      ]);
      setTeams(teamsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this team?')) return;
    try {
      await teamService.delete(id);
      toast.success('Team deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete team');
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <button onClick={() => { setEditingTeam(null); setShowModal(true); }} className="btn btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Team</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
                <div className="flex space-x-2">
                  <button onClick={() => { setEditingTeam(team); setShowModal(true); }} className="text-primary-600 hover:text-primary-700">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(team.id)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Manager</p>
                  <p className="font-medium">{team.manager?.name || 'No manager'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Members</p>
                  <p className="font-medium">{users.filter(u => u.team_id === team.id).length}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-500">No teams yet. Create your first team!</p>
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
        toast.success('Team updated!');
      } else {
        await teamService.create(data);
        toast.success('Team created!');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save team');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">{team ? 'Edit Team' : 'Add Team'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
            <select
              value={formData.manager_id}
              onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
              className="input"
            >
              <option value="">No Manager</option>
              {users.filter(u => u.role === 'manager' || u.role === 'admin').map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
