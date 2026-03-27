import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import { goalService } from '../services/goal';
import { GoalStatus, STATUS_COLORS, PRIORITY_COLORS } from '../constants/enums';
import { formatDate, formatEnumValue } from '../utils/format';
import toast from 'react-hot-toast';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadGoals();
  }, [searchParams]);

  const loadGoals = async () => {
    try {
      const response = await goalService.getAll();
      let filtered = response.data;

      const status = searchParams.get('status');
      const atRisk = searchParams.get('at_risk');

      if (status) {
        filtered = filtered.filter(g => g.status === status);
      }
      if (atRisk === 'true') {
        filtered = filtered.filter(g => g.is_at_risk);
      }

      setGoals(filtered);
    } catch (error) {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
          <Link to="/goals/new" className="btn btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Goal</span>
          </Link>
        </div>

        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Level</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Priority</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Progress</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Due Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {goals.map((goal) => (
                  <tr key={goal.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{goal.title}</div>
                        {goal.is_at_risk && (
                          <span className="text-xs text-red-600 font-medium">⚠ At Risk</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize text-gray-700">{goal.level}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[goal.priority]}`}>
                        {formatEnumValue(goal.priority)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[goal.status]}`}>
                        {formatEnumValue(goal.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${goal.completion_percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-700">{goal.completion_percentage}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{formatDate(goal.due_date)}</td>
                    <td className="py-3 px-4">
                      <Link to={`/goals/${goal.id}`} className="text-primary-600 hover:text-primary-700 font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {goals.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No goals found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
