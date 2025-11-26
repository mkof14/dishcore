import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { hasPermission, hasAnyPermission } from './permissions';
import { Shield } from 'lucide-react';

/**
 * Component to gate content based on permissions
 */
export default function PermissionGate({ 
  children, 
  permission, 
  permissions, 
  requireAll = false,
  fallback = null 
}) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return null;
  }

  // Check single permission
  if (permission && !hasPermission(currentUser, permission)) {
    return fallback;
  }

  // Check multiple permissions
  if (permissions) {
    const hasAccess = requireAll
      ? permissions.every(p => hasPermission(currentUser, p))
      : permissions.some(p => hasPermission(currentUser, p));
    
    if (!hasAccess) {
      return fallback;
    }
  }

  return <>{children}</>;
}

/**
 * Access denied component
 */
export function AccessDenied({ message = "You don't have permission to access this area" }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Access Denied
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          {message}
        </p>
      </div>
    </div>
  );
}