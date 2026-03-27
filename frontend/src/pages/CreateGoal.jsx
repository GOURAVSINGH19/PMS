import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Layout from '../components/Layout';
import { goalService } from '../services/goal';
import { userService } from '../services/user';
import { GoalLevel, GoalTag, GoalPriority, PRIORITY_WEIGHTAGE } from '../constants/enums';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';

export default function CreateGoal() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [remainingWeightage, setRemainingWeightage] = useState(100);
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const watchTag = watch('tag');
  const watchPriority = watch('priority');
  const watchAssignee = watch('assignee_id');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (watchTag && (currentUser.role === 'member' || watchAssignee)) {
      checkWeightage();
    }
  }, [watchTag, watchAssignee, watchPriority]);

  const loadUsers = async () => {
    // Members don't need to load users - they only create for themselves
    if (currentUser.role === 'member') {
      setUsers([currentUser]);
      return;
    }
    
    try {
      const response = await userService.getAll();
      let filteredUsers = response.data;
      
      // Filter users based on role
      if (currentUser.role === 'manager') {
        // Manager can only assign to team members or self
        filteredUsers = filteredUsers.filter(u => 
          u.team_id === currentUser.team_id || u.id === currentUser.id
        );
      }
      
      setUsers(filteredUsers);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const checkWeightage = async () => {
    try {
      const assigneeId = currentUser.role === 'member' ? currentUser.id : watchAssignee;
      const response = await goalService.checkWeightage(assigneeId, watchTag);
      setRemainingWeightage(response.data.remaining_weightage);
    } catch (error) {
      console.error('Failed to check weightage');
    }
  };

  const onSubmit = async (data) => {
    // Auto-assign to self for members
    if (currentUser.role === 'member') {
      data.assignee_id = currentUser.id;
    }
    
    const goalWeightage = PRIORITY_WEIGHTAGE[data.priority];
    if (goalWeightage > remainingWeightage) {
      toast.error(`Not enough weightage. Only ${remainingWeightage}% remaining for this period.`);
      return;
    }

    setLoading(true);
    try {
      await goalService.create(data);
      toast.success('Goal created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const selectedWeightage = watchPriority ? PRIORITY_WEIGHTAGE[watchPriority] : 0;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Goal</h1>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                className="input"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows="4"
                className="input"
                {...register('description')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select className="input" {...register('level', { required: 'Level is required' })}>
                  <option value="">Select level</option>
                  {Object.values(GoalLevel).map((level) => (
                    <option key={level} value={level} className="capitalize">{level}</option>
                  ))}
                </select>
                {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                <select className="input" {...register('tag', { required: 'Tag is required' })}>
                  <option value="">Select tag</option>
                  {Object.values(GoalTag).map((tag) => (
                    <option key={tag} value={tag} className="capitalize">{tag}</option>
                  ))}
                </select>
                {errors.tag && <p className="text-red-500 text-sm mt-1">{errors.tag.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select className="input" {...register('priority', { required: 'Priority is required' })}>
                  <option value="">Select priority</option>
                  {Object.entries(PRIORITY_WEIGHTAGE).map(([priority, weightage]) => (
                    <option key={priority} value={priority} className="capitalize">
                      {priority} ({weightage}%)
                    </option>
                  ))}
                </select>
                {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  className="input"
                  {...register('start_date', { required: 'Start date is required' })}
                />
                {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>}
              </div>
            </div>

            {currentUser.role !== 'member' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select className="input" {...register('assignee_id', { required: 'Assignee is required' })}>
                  <option value="">Select user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {errors.assignee_id && <p className="text-red-500 text-sm mt-1">{errors.assignee_id.message}</p>}
              </div>
            )}

            {watchTag && (currentUser.role !== 'member' ? watchAssignee : true) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Weightage for this goal:</span>
                  <span className="text-lg font-bold text-primary-600">{selectedWeightage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Remaining weightage:</span>
                  <span className={`text-lg font-bold ${remainingWeightage >= selectedWeightage ? 'text-green-600' : 'text-red-600'}`}>
                    {remainingWeightage}%
                  </span>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Creating...' : 'Create Goal'}
              </button>
              <button type="button" onClick={() => navigate('/goals')} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
