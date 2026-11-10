// Application-wide constants for roles, submission types, and storage keys

export const ROLES = {
  STUDENT: 'student',
  PROFESSOR: 'professor',
  ADMIN: 'professor', // alias for Round 1 components during phase transition
}

export const SUBMISSION_TYPE = {
  INDIVIDUAL: 'individual',
  GROUP: 'group',
}

export const STATUS = {
  ACKNOWLEDGED: 'Acknowledged',
  PENDING: 'Pending',
  OVERDUE: 'Overdue',
  DUE_SOON: 'Due soon',
}

export const STORAGE_KEYS = {
  USERS: 'app_users',
  COURSES: 'app_courses',
  ASSIGNMENTS: 'app_assignments',
  GROUPS: 'app_groups',
  ACKNOWLEDGEMENTS: 'app_acknowledgements',
  SESSION: 'app_session',
  THEME: 'app_theme',
}

export const LOADING_DELAY = 400
export const TOAST_DURATION = 3000
