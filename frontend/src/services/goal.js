import api from './api';

export const goalService = {
  getAll: () => api.get('/goals/'),
  getById: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post('/goals/', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  submit: (id) => api.post(`/goals/${id}/submit`, { approved: true }),
  approve: (id) => api.post(`/goals/${id}/approve`, { approved: true }),
  reject: (id, reason) => api.post(`/goals/${id}/approve`, { approved: false, rejection_comment: reason }),
  updateProgress: (id, data) => api.post(`/goals/${id}/progress`, data),
  complete: (id) => api.post(`/goals/${id}/complete`),
  
  // Subtasks
  addSubtask: (goalId, data) => api.post(`/goals/${goalId}/subtasks`, data),
  updateSubtask: (goalId, subtaskId, data) => api.patch(`/goals/subtasks/${subtaskId}`, data),
  deleteSubtask: (goalId, subtaskId) => api.delete(`/goals/${goalId}/subtasks/${subtaskId}`),
  
  // Feedback
  submitFeedback: (id, data) => {
    const endpoint = data.feedback_type === 'member' 
      ? `/goals/${id}/feedback/member` 
      : `/goals/${id}/feedback/evaluator`;
    return api.post(endpoint, data);
  },
  
  // Score
  submitScore: (id, data) => api.post(`/goals/${id}/score`, data),
  
  // Weightage
  checkWeightage: (userId, tag) => api.get(`/users/${userId}/weightage/${tag}`)
};
