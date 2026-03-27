import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Plus, Trash2, Edit } from 'lucide-react';
import Layout from '../components/Layout';
import { goalService } from '../services/goal';
import { GoalStatus, STATUS_COLORS, PRIORITY_COLORS, FeedbackType, PerformanceRating } from '../constants/enums';
import { formatDate, formatEnumValue } from '../utils/format';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';

export default function GoalDetail() {
  const { id } = useParams();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    loadGoal();
  }, [id]);

  const loadGoal = async () => {
    try {
      const response = await goalService.getById(id);
      setGoal(response.data);
    } catch (error) {
      toast.error('Failed to load goal');
      navigate('/goals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await goalService.approve(id);
      toast.success('Goal approved!');
      loadGoal();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to approve goal');
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await goalService.reject(id, reason);
      toast.success('Goal rejected');
      loadGoal();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reject goal');
    }
  };

  const handleSubmit = async () => {
    try {
      await goalService.submit(id);
      toast.success('Goal submitted for approval!');
      loadGoal();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit goal');
    }
  };

  const handleComplete = async () => {
    try {
      await goalService.complete(id);
      toast.success('Goal marked as completed!');
      loadGoal();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to complete goal');
    }
  };

  const canApprove = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const isAssignee = goal?.assignee_id === currentUser?.id;
  const isCreator = goal?.creator_id === currentUser?.id;

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
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{goal.title}</h1>
            <div className="flex items-center space-x-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[goal.status]}`}>
                {formatEnumValue(goal.status)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_COLORS[goal.priority]}`}>
                {formatEnumValue(goal.priority)}
              </span>
              {goal.is_at_risk && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  ⚠ At Risk
                </span>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            {goal.status === GoalStatus.DRAFT && isCreator && (
              <button onClick={handleSubmit} className="btn btn-primary">Submit for Approval</button>
            )}
            {goal.status === GoalStatus.PENDING_APPROVAL && canApprove && (
              <>
                <button onClick={handleApprove} className="btn btn-primary">Approve</button>
                <button onClick={handleReject} className="btn btn-danger">Reject</button>
              </>
            )}
            {goal.status === GoalStatus.ACTIVE && isAssignee && (
              <>
                <button onClick={() => setShowProgressModal(true)} className="btn btn-primary">Update Progress</button>
                <button onClick={handleComplete} className="btn btn-secondary">Mark Complete</button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Progress</h3>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all"
                  style={{ width: `${goal.completion_percentage}%` }}
                />
              </div>
              <span className="text-2xl font-bold">{goal.completion_percentage}%</span>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Time Elapsed</h3>
            <p className="text-2xl font-bold">{goal.time_elapsed_percentage}%</p>
            <p className="text-sm text-gray-600 mt-1">{goal.days_remaining} days remaining</p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Weightage</h3>
            <p className="text-2xl font-bold">{goal.weightage}%</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Level</p>
              <p className="font-medium capitalize">{goal.level}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tag</p>
              <p className="font-medium capitalize">{goal.tag}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium">{formatDate(goal.start_date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="font-medium">{formatDate(goal.due_date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Assignee</p>
              <p className="font-medium">{goal.assignee?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Creator</p>
              <p className="font-medium">{goal.creator?.name}</p>
            </div>
          </div>
          {goal.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Description</p>
              <p className="mt-1">{goal.description}</p>
            </div>
          )}
        </div>

        <SubtasksSection goal={goal} loadGoal={loadGoal} isAssignee={isAssignee} />
        <FeedbackSection goal={goal} loadGoal={loadGoal} currentUser={currentUser} />
        <ScoreSection goal={goal} loadGoal={loadGoal} canScore={canApprove} />

        {showProgressModal && (
          <ProgressModal goal={goal} onClose={() => setShowProgressModal(false)} onSuccess={loadGoal} />
        )}
      </div>
    </Layout>
  );
}

function SubtasksSection({ goal, loadGoal, isAssignee }) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = async () => {
    try {
      await goalService.addSubtask(goal.id, { title, description });
      toast.success('Subtask added!');
      setTitle('');
      setDescription('');
      setShowModal(false);
      loadGoal();
    } catch (error) {
      toast.error('Failed to add subtask');
    }
  };

  const handleToggle = async (subtask) => {
    try {
      await goalService.updateSubtask(goal.id, subtask.id, { is_completed: !subtask.is_completed });
      loadGoal();
    } catch (error) {
      toast.error('Failed to update subtask');
    }
  };

  const handleDelete = async (subtaskId) => {
    if (!confirm('Delete this subtask?')) return;
    try {
      await goalService.deleteSubtask(goal.id, subtaskId);
      toast.success('Subtask deleted');
      loadGoal();
    } catch (error) {
      toast.error('Failed to delete subtask');
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Subtasks</h2>
        {isAssignee && (goal.status === GoalStatus.ACTIVE || goal.status === GoalStatus.DRAFT) && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center space-x-1">
            <Plus className="w-4 h-4" />
            <span>Add Subtask</span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {goal.subtasks?.map((subtask) => (
          <div key={subtask.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3 flex-1">
              <input
                type="checkbox"
                checked={subtask.is_completed}
                onChange={() => handleToggle(subtask)}
                disabled={!isAssignee}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <div className={subtask.is_completed ? 'line-through text-gray-500' : ''}>
                <p className="font-medium">{subtask.title}</p>
                {subtask.description && <p className="text-sm text-gray-600">{subtask.description}</p>}
              </div>
            </div>
            {isAssignee && (goal.status === GoalStatus.ACTIVE || goal.status === GoalStatus.DRAFT) && (
              <button onClick={() => handleDelete(subtask.id)} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {(!goal.subtasks || goal.subtasks.length === 0) && (
          <p className="text-gray-500 text-center py-4">No subtasks yet</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Subtask</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="input"
                />
              </div>
              <div className="flex space-x-2">
                <button onClick={handleAdd} className="btn btn-primary">Add</button>
                <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressModal({ goal, onClose, onSuccess }) {
  const [percentage, setPercentage] = useState(goal.completion_percentage);
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    try {
      await goalService.updateProgress(goal.id, { completion_percentage: percentage, notes });
      toast.success('Progress updated!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Update Progress</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Completion Percentage: {percentage}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="input"
            />
          </div>
          <div className="flex space-x-2">
            <button onClick={handleSubmit} className="btn btn-primary">Update</button>
            <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackSection({ goal, loadGoal, currentUser }) {
  const [showModal, setShowModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');

  const canSubmitMember = goal.status === GoalStatus.AWAITING_FEEDBACK && goal.assignee_id === currentUser?.id;
  const canSubmitEvaluator = goal.status === GoalStatus.AWAITING_FEEDBACK && (currentUser?.role === 'admin' || currentUser?.role === 'manager');

  const memberFeedback = goal.feedbacks?.find(f => f.feedback_type === FeedbackType.MEMBER);
  const evaluatorFeedback = goal.feedbacks?.find(f => f.feedback_type === FeedbackType.EVALUATOR);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Feedback</h2>
        {canSubmitMember && !memberFeedback && (
          <button onClick={() => { setFeedbackType(FeedbackType.MEMBER); setShowModal(true); }} className="btn btn-primary">
            Submit Member Feedback
          </button>
        )}
        {canSubmitEvaluator && !evaluatorFeedback && (
          <button onClick={() => { setFeedbackType(FeedbackType.EVALUATOR); setShowModal(true); }} className="btn btn-primary">
            Submit Evaluator Feedback
          </button>
        )}
      </div>

      <div className="space-y-4">
        {memberFeedback && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Member Feedback</h3>
            <p className="text-sm text-gray-600 mb-2"><strong>Deliverables:</strong> {memberFeedback.deliverables}</p>
            <p className="text-sm text-gray-600"><strong>Improvements:</strong> {memberFeedback.improvements}</p>
          </div>
        )}
        {evaluatorFeedback && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Evaluator Feedback</h3>
            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
              <p><strong>Quality:</strong> {evaluatorFeedback.quality_rating}/5</p>
              <p><strong>Timeliness:</strong> {evaluatorFeedback.timeliness_rating}/5</p>
              <p><strong>Innovation:</strong> {evaluatorFeedback.innovation_rating}/5</p>
              <p><strong>Collaboration:</strong> {evaluatorFeedback.collaboration_rating}/5</p>
              <p><strong>Impact:</strong> {evaluatorFeedback.impact_rating}/5</p>
            </div>
            <p className="text-sm text-gray-600"><strong>Comment:</strong> {evaluatorFeedback.evaluator_comment}</p>
          </div>
        )}
        {!memberFeedback && !evaluatorFeedback && (
          <p className="text-gray-500 text-center py-4">No feedback submitted yet</p>
        )}
      </div>

      {showModal && (
        <FeedbackModal
          goalId={goal.id}
          feedbackType={feedbackType}
          onClose={() => setShowModal(false)}
          onSuccess={() => { loadGoal(); setShowModal(false); }}
        />
      )}
    </div>
  );
}

function FeedbackModal({ goalId, feedbackType, onClose, onSuccess }) {
  const [formData, setFormData] = useState(
    feedbackType === FeedbackType.MEMBER
      ? { deliverables: '', improvements: '' }
      : { quality_rating: 3, timeliness_rating: 3, innovation_rating: 3, collaboration_rating: 3, impact_rating: 3, evaluator_comment: '' }
  );

  const handleSubmit = async () => {
    try {
      await goalService.submitFeedback(goalId, { feedback_type: feedbackType, ...formData });
      toast.success('Feedback submitted!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {feedbackType === FeedbackType.MEMBER ? 'Member Feedback' : 'Evaluator Feedback'}
        </h3>
        <div className="space-y-4">
          {feedbackType === FeedbackType.MEMBER ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deliverables</label>
                <textarea
                  value={formData.deliverables}
                  onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                  rows="3"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Improvements</label>
                <textarea
                  value={formData.improvements}
                  onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                  rows="3"
                  className="input"
                />
              </div>
            </>
          ) : (
            <>
              {['quality', 'timeliness', 'innovation', 'collaboration', 'impact'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field} Rating: {formData[`${field}_rating`]}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData[`${field}_rating`]}
                    onChange={(e) => setFormData({ ...formData, [`${field}_rating`]: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                  value={formData.evaluator_comment}
                  onChange={(e) => setFormData({ ...formData, evaluator_comment: e.target.value })}
                  rows="3"
                  className="input"
                />
              </div>
            </>
          )}
          <div className="flex space-x-2">
            <button onClick={handleSubmit} className="btn btn-primary">Submit</button>
            <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreSection({ goal, loadGoal, canScore }) {
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(PerformanceRating.MEETS_EXPECTATIONS);

  const handleSubmit = async () => {
    try {
      await goalService.submitScore(goal.id, { rating });
      toast.success('Score submitted!');
      loadGoal();
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit score');
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Score</h2>
        {goal.status === GoalStatus.SCORABLE && canScore && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">Submit Score</button>
        )}
      </div>

      {goal.score ? (
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-lg font-semibold capitalize">{formatEnumValue(goal.score.rating)}</p>
          <p className="text-sm text-gray-600 mt-1">Scored by: {goal.score.scored_by?.name}</p>
          <p className="text-sm text-gray-600">Date: {formatDate(goal.score.scored_at)}</p>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No score yet</p>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Submit Score</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Performance Rating</label>
                <select value={rating} onChange={(e) => setRating(e.target.value)} className="input">
                  {Object.values(PerformanceRating).map((r) => (
                    <option key={r} value={r}>{formatEnumValue(r)}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <button onClick={handleSubmit} className="btn btn-primary">Submit</button>
                <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
