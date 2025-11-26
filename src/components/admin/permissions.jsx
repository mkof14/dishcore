// Role-based permissions system
export const ROLES = {
  ADMIN: 'admin',
  FINANCE: 'finance',
  SUPPORT: 'support',
  SUPPORT_LEAD: 'support_lead',
  CONTENT_MODERATOR: 'content_moderator',
  USER: 'user'
};

export const PERMISSIONS = {
  // User Management
  VIEW_ALL_USERS: 'view_all_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  BLOCK_USERS: 'block_users',
  VIEW_USER_ANALYTICS: 'view_user_analytics',
  VIEW_USER_INTERACTION_HISTORY: 'view_user_interaction_history',
  
  // Finance
  VIEW_FINANCE: 'view_finance',
  EXPORT_FINANCE: 'export_finance',
  MANAGE_SUBSCRIPTIONS: 'manage_subscriptions',
  VIEW_REVENUE: 'view_revenue',
  
  // Content Management
  VIEW_CONTENT: 'view_content',
  EDIT_CONTENT: 'edit_content',
  DELETE_CONTENT: 'delete_content',
  MODERATE_CONTENT: 'moderate_content',
  APPROVE_CONTENT: 'approve_content',
  REJECT_CONTENT: 'reject_content',
  VIEW_CONTENT_ANALYTICS: 'view_content_analytics',
  VIEW_CONTENT_ENGAGEMENT: 'view_content_engagement',
  
  // System
  VIEW_MONITORING: 'view_monitoring',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_METRICS: 'view_metrics',
  
  // Support & Tickets
  VIEW_SUPPORT_TICKETS: 'view_support_tickets',
  CREATE_SUPPORT_TICKETS: 'create_support_tickets',
  RESPOND_TO_TICKETS: 'respond_to_tickets',
  ASSIGN_TICKETS: 'assign_tickets',
  CLOSE_TICKETS: 'close_tickets',
  VIEW_ALL_TICKETS: 'view_all_tickets',
  MANAGE_TICKET_PRIORITY: 'manage_ticket_priority',
  VIEW_USER_DATA: 'view_user_data',
  ASSIST_USERS: 'assist_users'
};

// Define what each role can do
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Admins have all permissions
    ...Object.values(PERMISSIONS)
  ],
  
  [ROLES.FINANCE]: [
    PERMISSIONS.VIEW_FINANCE,
    PERMISSIONS.EXPORT_FINANCE,
    PERMISSIONS.MANAGE_SUBSCRIPTIONS,
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.VIEW_ALL_USERS, // Limited to billing context
    PERMISSIONS.VIEW_METRICS,
    PERMISSIONS.VIEW_AUDIT_LOGS // Limited to finance actions
  ],
  
  [ROLES.SUPPORT_LEAD]: [
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.VIEW_USER_DATA,
    PERMISSIONS.VIEW_USER_INTERACTION_HISTORY,
    PERMISSIONS.VIEW_USER_ANALYTICS,
    PERMISSIONS.ASSIST_USERS,
    PERMISSIONS.VIEW_ALL_TICKETS,
    PERMISSIONS.VIEW_SUPPORT_TICKETS,
    PERMISSIONS.CREATE_SUPPORT_TICKETS,
    PERMISSIONS.RESPOND_TO_TICKETS,
    PERMISSIONS.ASSIGN_TICKETS,
    PERMISSIONS.CLOSE_TICKETS,
    PERMISSIONS.MANAGE_TICKET_PRIORITY,
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.MODERATE_CONTENT,
    PERMISSIONS.BLOCK_USERS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_METRICS
  ],
  
  [ROLES.SUPPORT]: [
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.VIEW_USER_DATA,
    PERMISSIONS.VIEW_USER_INTERACTION_HISTORY,
    PERMISSIONS.ASSIST_USERS,
    PERMISSIONS.VIEW_SUPPORT_TICKETS,
    PERMISSIONS.CREATE_SUPPORT_TICKETS,
    PERMISSIONS.RESPOND_TO_TICKETS,
    PERMISSIONS.CLOSE_TICKETS,
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.MODERATE_CONTENT,
    PERMISSIONS.BLOCK_USERS,
    PERMISSIONS.VIEW_AUDIT_LOGS
  ],
  
  [ROLES.CONTENT_MODERATOR]: [
    PERMISSIONS.VIEW_CONTENT,
    PERMISSIONS.EDIT_CONTENT,
    PERMISSIONS.DELETE_CONTENT,
    PERMISSIONS.MODERATE_CONTENT,
    PERMISSIONS.APPROVE_CONTENT,
    PERMISSIONS.REJECT_CONTENT,
    PERMISSIONS.VIEW_CONTENT_ANALYTICS,
    PERMISSIONS.VIEW_CONTENT_ENGAGEMENT,
    PERMISSIONS.VIEW_ALL_USERS, // To see content creators
    PERMISSIONS.BLOCK_USERS, // For spam/abuse cases
    PERMISSIONS.VIEW_AUDIT_LOGS // Limited to content actions
  ],
  
  [ROLES.USER]: [
    // Regular users have no admin permissions
  ]
};

/**
 * Check if a user has a specific permission
 * @param {Object} user - User object with role property
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return rolePermissions.includes(permission);
};

/**
 * Check if user has any of the given permissions
 * @param {Object} user - User object
 * @param {string[]} permissions - Array of permissions
 * @returns {boolean}
 */
export const hasAnyPermission = (user, permissions) => {
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if user has all of the given permissions
 * @param {Object} user - User object
 * @param {string[]} permissions - Array of permissions
 * @returns {boolean}
 */
export const hasAllPermissions = (user, permissions) => {
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Get user-friendly role name
 * @param {string} role
 * @returns {string}
 */
export const getRoleName = (role) => {
  const names = {
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.FINANCE]: 'Finance Manager',
    [ROLES.SUPPORT_LEAD]: 'Customer Support Lead',
    [ROLES.SUPPORT]: 'Support Staff',
    [ROLES.CONTENT_MODERATOR]: 'Content Moderator',
    [ROLES.USER]: 'User'
  };
  return names[role] || 'Unknown';
};

/**
 * Get role badge color
 * @param {string} role
 * @returns {string}
 */
export const getRoleBadgeColor = (role) => {
  const colors = {
    [ROLES.ADMIN]: 'bg-purple-500/20 text-purple-400',
    [ROLES.FINANCE]: 'bg-green-500/20 text-green-400',
    [ROLES.SUPPORT_LEAD]: 'bg-cyan-500/20 text-cyan-400',
    [ROLES.SUPPORT]: 'bg-blue-500/20 text-blue-400',
    [ROLES.CONTENT_MODERATOR]: 'bg-orange-500/20 text-orange-400',
    [ROLES.USER]: 'bg-gray-500/20 text-gray-400'
  };
  return colors[role] || 'bg-gray-500/20 text-gray-400';
};