export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
  },
  GOALS: {
    BASE: '/goals/',
    BY_ID: id => `/goals/${id}`,
    SUBMIT: id => `/goals/${id}/submit`,
    APPROVE: id => `/goals/${id}/approve`,
    PROGRESS: id => `/goals/${id}/completion`,
    SUBTASKS: id => `/goals/${id}/subtasks`,
    SCORING: id => `/goals/${id}/score`,
    MEMBER_FEEDBACK: id => `/goals/${id}/feedback/member`,
    EVALUATOR_FEEDBACK: id => `/goals/${id}/feedback/evaluator`,
    ARCHIVE: id => `/goals/${id}/archive`,
  },
  USERS: {
    BASE: '/users/',
    BY_ID: id => `/users/${id}`,
    WEIGHTAGE: (userId, tag) => `/users/${userId}/weightage/${tag}`,
  },
  TEAMS: {
    BASE: '/teams/',
    BY_ID: id => `/teams/${id}`,
  },
  CYCLES: {
    BASE: '/cycles/',
    BY_ID: id => `/cycles/${id}`,
    STATUS: id => `/cycles/${id}/status`,
    ENROLLMENTS: id => `/cycles/${id}/enrollments`,
  },
  FEEDBACK: {
    BASE: '/feedback/',
    BY_ID: id => `/feedback/${id}`,
    SUBMIT: id => `/feedback/${id}/submit`,
    FLAGS: '/feedback/flags/queue',
    FLAG_DETAIL: id => `/feedback/flags/${id}`,
  },
  PROBATION: {
    BASE: '/probation/',
    ME: '/probation/me',
    BY_ID: id => `/probation/${id}`,
  },
  NOTIFICATIONS: {
    BASE: '/notifications/',
    MARK_READ: id => `/notifications/${id}/read`,
    MARK_ALL: '/notifications/read-all',
    UNREAD_COUNT: '/notifications/unread-count',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    AUTOMATION: '/admin/automation-status',
    STALLED: '/admin/stalled-approvals',
    AGING_FLAGS: '/admin/flags/aging',
    NO_MANAGER: '/admin/no-manager',
    COMPLIANCE: (id) => `/admin/cycle-compliance?cycle_id=${id}`,
  }
};

export default API_ENDPOINTS;
