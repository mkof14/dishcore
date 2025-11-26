import { base44 } from '@/api/base44Client';

// Audit event types
export const AUDIT_EVENTS = {
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  PROFILE_UPDATE: 'profile_update',
  MEAL_LOGGED: 'meal_logged',
  MEAL_DELETED: 'meal_deleted',
  DISH_CREATED: 'dish_created',
  DISH_DELETED: 'dish_deleted',
  MENU_GENERATED: 'menu_generated',
  REPORT_GENERATED: 'report_generated',
  SUBSCRIPTION_CHANGED: 'subscription_changed',
  DATA_EXPORTED: 'data_exported',
  DATA_DELETED: 'data_deleted',
  SETTINGS_CHANGED: 'settings_changed'
};

// Log audit event
export async function logAuditEvent(eventType, details = {}) {
  try {
    const user = await base44.auth.me();
    
    const auditEntry = {
      event_type: eventType,
      user_email: user.email,
      user_id: user.id,
      details: JSON.stringify(details),
      ip_address: await getUserIP(),
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    // Store in localStorage for now (in production, send to backend)
    const logs = JSON.parse(localStorage.getItem('audit-logs') || '[]');
    logs.push(auditEntry);
    
    // Keep only last 1000 entries
    if (logs.length > 1000) {
      logs.shift();
    }
    
    localStorage.setItem('audit-logs', JSON.stringify(logs));
    
    // In production, also send to backend:
    // await fetch('/api/audit-log', {
    //   method: 'POST',
    //   body: JSON.stringify(auditEntry)
    // });
    
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

// Get user IP (simplified for client-side)
async function getUserIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}

// Get audit logs for current user
export function getAuditLogs(limit = 50) {
  const logs = JSON.parse(localStorage.getItem('audit-logs') || '[]');
  return logs.slice(-limit).reverse();
}

// Clear old audit logs
export function clearOldAuditLogs(daysToKeep = 90) {
  const logs = JSON.parse(localStorage.getItem('audit-logs') || '[]');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const filteredLogs = logs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate >= cutoffDate;
  });
  
  localStorage.setItem('audit-logs', JSON.stringify(filteredLogs));
  return logs.length - filteredLogs.length; // Return number of deleted logs
}

// React hook for audit logging
export function useAuditLog() {
  return {
    log: logAuditEvent,
    getLogs: getAuditLogs,
    clearOld: clearOldAuditLogs
  };
}