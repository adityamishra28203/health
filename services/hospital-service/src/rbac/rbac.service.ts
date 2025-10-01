import { Injectable, Logger, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HospitalUser, UserRole, UserStatus } from '../schemas/hospital-user.schema';

export interface Permission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface RBACContext {
  userId: string;
  hospitalId: string;
  tenantId: string;
  role: UserRole;
  permissions: string[];
  metadata?: Record<string, any>;
}

export interface AccessDecision {
  granted: boolean;
  reason?: string;
  conditions?: Record<string, any>;
}

@Injectable()
export class RBACService {
  private readonly logger = new Logger(RBACService.name);

  // Role-based permissions matrix
  private readonly rolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.ADMIN]: [
      { resource: 'hospital', actions: ['read', 'write', 'delete', 'manage'] },
      { resource: 'users', actions: ['read', 'write', 'delete', 'manage'] },
      { resource: 'patients', actions: ['read', 'write', 'delete', 'link', 'unlink'] },
      { resource: 'documents', actions: ['read', 'write', 'delete', 'sign', 'verify'] },
      { resource: 'settings', actions: ['read', 'write'] },
      { resource: 'audit', actions: ['read'] },
      { resource: 'reports', actions: ['read', 'generate'] },
      { resource: 'billing', actions: ['read', 'write'] },
    ],
    [UserRole.DOCTOR]: [
      { resource: 'patients', actions: ['read', 'link'] },
      { resource: 'documents', actions: ['read', 'write', 'sign'] },
      { resource: 'medical_records', actions: ['read', 'write'] },
      { resource: 'prescriptions', actions: ['read', 'write', 'sign'] },
      { resource: 'reports', actions: ['read', 'generate'] },
    ],
    [UserRole.NURSE]: [
      { resource: 'patients', actions: ['read'] },
      { resource: 'documents', actions: ['read', 'write'] },
      { resource: 'medical_records', actions: ['read', 'write'] },
      { resource: 'vitals', actions: ['read', 'write'] },
    ],
    [UserRole.BILLING_CLERK]: [
      { resource: 'patients', actions: ['read'] },
      { resource: 'documents', actions: ['read'] },
      { resource: 'billing', actions: ['read', 'write'] },
      { resource: 'insurance', actions: ['read', 'write'] },
    ],
    [UserRole.LAB_TECHNICIAN]: [
      { resource: 'patients', actions: ['read'] },
      { resource: 'documents', actions: ['read', 'write', 'sign'] },
      { resource: 'lab_results', actions: ['read', 'write', 'sign'] },
    ],
    [UserRole.RADIOLOGIST]: [
      { resource: 'patients', actions: ['read'] },
      { resource: 'documents', actions: ['read', 'write', 'sign'] },
      { resource: 'imaging', actions: ['read', 'write', 'sign'] },
    ],
    [UserRole.PHARMACIST]: [
      { resource: 'patients', actions: ['read'] },
      { resource: 'documents', actions: ['read', 'write', 'sign'] },
      { resource: 'prescriptions', actions: ['read', 'write', 'sign'] },
      { resource: 'inventory', actions: ['read', 'write'] },
    ],
    [UserRole.RECEPTIONIST]: [
      { resource: 'patients', actions: ['read', 'link'] },
      { resource: 'appointments', actions: ['read', 'write'] },
      { resource: 'documents', actions: ['read'] },
    ],
    [UserRole.VIEWER]: [
      { resource: 'patients', actions: ['read'] },
      { resource: 'documents', actions: ['read'] },
    ],
  };

  // Time-based access restrictions
  private readonly timeRestrictions: Record<UserRole, { start: string; end: string }[]> = {
    [UserRole.ADMIN]: [],
    [UserRole.DOCTOR]: [],
    [UserRole.NURSE]: [],
    [UserRole.BILLING_CLERK]: [{ start: '09:00', end: '17:00' }],
    [UserRole.LAB_TECHNICIAN]: [{ start: '08:00', end: '18:00' }],
    [UserRole.RADIOLOGIST]: [],
    [UserRole.PHARMACIST]: [{ start: '09:00', end: '21:00' }],
    [UserRole.RECEPTIONIST]: [{ start: '08:00', end: '18:00' }],
    [UserRole.VIEWER]: [{ start: '09:00', end: '17:00' }],
  };

  constructor(
    @InjectModel('HospitalUser') private userModel: Model<HospitalUser>,
  ) {}

  /**
   * Check if user has permission to perform action on resource
   */
  async checkPermission(
    userId: string,
    hospitalId: string,
    resource: string,
    action: string,
    context?: Record<string, any>,
  ): Promise<AccessDecision> {
    try {
      // Get user context
      const userContext = await this.getUserContext(userId, hospitalId);
      if (!userContext) {
        return { granted: false, reason: 'User not found or inactive' };
      }

      // Check user status
      if ((userContext as any).status !== UserStatus.ACTIVE) {
        return { granted: false, reason: 'User account is not active' };
      }

      // Check time-based restrictions
      const timeCheck = this.checkTimeRestrictions(userContext.role);
      if (!timeCheck.granted) {
        return timeCheck;
      }

      // Check role-based permissions
      const rolePermissions = this.rolePermissions[userContext.role];
      const hasPermission = rolePermissions.some(
        permission => permission.resource === resource && permission.actions.includes(action),
      );

      if (!hasPermission) {
        return { granted: false, reason: `Role ${userContext.role} does not have ${action} permission on ${resource}` };
      }

      // Check custom permissions
      const customPermissions = userContext.permissions || [];
      const hasCustomPermission = customPermissions.some(permission => {
        const [permResource, permAction] = permission.split(':');
        return permResource === resource && (permAction === action || permAction === '*');
      });

      if (!hasCustomPermission && !hasPermission) {
        return { granted: false, reason: 'Insufficient permissions' };
      }

      // Check access control conditions
      const accessControl = (userContext as any).accessControl || {};
      if (accessControl.allowedDocumentTypes && resource === 'documents') {
        const documentType = context?.documentType;
        if (documentType && !accessControl.allowedDocumentTypes.includes(documentType)) {
          return { granted: false, reason: `Document type ${documentType} not allowed for this user` };
        }
      }

      // Check document limits
      if (accessControl.maxDocumentsPerDay && resource === 'documents' && action === 'write') {
        const todayDocuments = await this.getTodayDocumentCount(userId, hospitalId);
        if (todayDocuments >= accessControl.maxDocumentsPerDay) {
          return { granted: false, reason: 'Daily document limit exceeded' };
        }
      }

      return { granted: true };
    } catch (error) {
      this.logger.error(`Permission check failed: ${error.message}`, error.stack);
      return { granted: false, reason: 'Internal error during permission check' };
    }
  }

  /**
   * Get user context for RBAC
   */
  async getUserContext(userId: string, hospitalId: string): Promise<RBACContext | null> {
    try {
      const user = await this.userModel.findOne({
        userId,
        hospitalId,
        isActive: true,
      });

      if (!user) {
        return null;
      }

      return {
        userId: user.userId,
        hospitalId: user.hospitalId,
        tenantId: user.tenantId,
        role: user.role,
        permissions: user.permissions || [],
        metadata: {
          department: user.department,
          specialization: user.specialization,
          accessControl: user.accessControl,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get user context: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Check time-based access restrictions
   */
  private checkTimeRestrictions(role: UserRole): AccessDecision {
    const restrictions = this.timeRestrictions[role];
    
    if (!restrictions || restrictions.length === 0) {
      return { granted: true };
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Skip weekend restrictions for emergency roles
    const emergencyRoles = [UserRole.DOCTOR, UserRole.NURSE, UserRole.RADIOLOGIST];
    if (currentDay === 0 || currentDay === 6) {
      if (!emergencyRoles.includes(role)) {
        return { granted: false, reason: 'Access restricted on weekends for this role' };
      }
    }

    // Check if current time is within allowed hours
    for (const restriction of restrictions) {
      if (currentTime >= restriction.start && currentTime <= restriction.end) {
        return { granted: true };
      }
    }

    return { granted: false, reason: 'Access restricted outside business hours' };
  }

  /**
   * Get today's document count for user
   */
  private async getTodayDocumentCount(userId: string, hospitalId: string): Promise<number> {
    // This would typically query the document service
    // For now, return a mock value
    return 0;
  }

  /**
   * Authorize user action (throws exception if not authorized)
   */
  async authorize(
    userId: string,
    hospitalId: string,
    resource: string,
    action: string,
    context?: Record<string, any>,
  ): Promise<RBACContext> {
    const decision = await this.checkPermission(userId, hospitalId, resource, action, context);
    
    if (!decision.granted) {
      throw new ForbiddenException(decision.reason || 'Access denied');
    }

    const userContext = await this.getUserContext(userId, hospitalId);
    if (!userContext) {
      throw new UnauthorizedException('User context not found');
    }

    return userContext;
  }

  /**
   * Get user permissions for a specific resource
   */
  async getUserPermissions(userId: string, hospitalId: string, resource?: string): Promise<Permission[]> {
    const userContext = await this.getUserContext(userId, hospitalId);
    if (!userContext) {
      return [];
    }

    const rolePermissions = this.rolePermissions[userContext.role];
    
    if (resource) {
      return rolePermissions.filter(permission => permission.resource === resource);
    }

    return rolePermissions;
  }

  /**
   * Check if user can access specific patient data
   */
  async canAccessPatient(userId: string, hospitalId: string, patientId: string): Promise<AccessDecision> {
    try {
      const userContext = await this.getUserContext(userId, hospitalId);
      if (!userContext) {
        return { granted: false, reason: 'User not found' };
      }

      // Check if patient is assigned to user
      const user = await this.userModel.findOne({ userId, hospitalId });
      if (user?.assignedPatients?.includes(patientId)) {
        return { granted: true };
      }

      // Check role-based access
      const rolePermissions = this.rolePermissions[userContext.role];
      const hasPatientAccess = rolePermissions.some(
        permission => permission.resource === 'patients' && permission.actions.includes('read'),
      );

      if (!hasPatientAccess) {
        return { granted: false, reason: 'Role does not have patient access' };
      }

      return { granted: true };
    } catch (error) {
      this.logger.error(`Patient access check failed: ${error.message}`, error.stack);
      return { granted: false, reason: 'Internal error during access check' };
    }
  }

  /**
   * Check if user can perform emergency access
   */
  async canPerformEmergencyAccess(userId: string, hospitalId: string): Promise<AccessDecision> {
    const userContext = await this.getUserContext(userId, hospitalId);
    if (!userContext) {
      return { granted: false, reason: 'User not found' };
    }

    const emergencyRoles = [UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE];
    
    if (!emergencyRoles.includes(userContext.role)) {
      return { granted: false, reason: 'Role does not have emergency access privileges' };
    }

    return { granted: true };
  }

  /**
   * Log access attempt for audit
   */
  async logAccessAttempt(
    userId: string,
    hospitalId: string,
    resource: string,
    action: string,
    granted: boolean,
    reason?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      // This would typically send to audit service via Kafka
      this.logger.log(`Access attempt: User ${userId} attempted ${action} on ${resource} - ${granted ? 'GRANTED' : 'DENIED'}${reason ? ` - ${reason}` : ''}`);
      
      // Update user's login history
      await this.userModel.updateOne(
        { userId, hospitalId },
        {
          $push: {
            accessHistory: {
              timestamp: new Date(),
              action: `${action}:${resource}`,
              performedBy: userId,
              details: {
                granted,
                reason,
                ...metadata,
              },
            },
          },
        },
      );
    } catch (error) {
      this.logger.error(`Failed to log access attempt: ${error.message}`, error.stack);
    }
  }

  /**
   * Get role hierarchy
   */
  getRoleHierarchy(): Record<UserRole, UserRole[]> {
    return {
      [UserRole.ADMIN]: [UserRole.DOCTOR, UserRole.NURSE, UserRole.BILLING_CLERK, UserRole.LAB_TECHNICIAN, UserRole.RADIOLOGIST, UserRole.PHARMACIST, UserRole.RECEPTIONIST, UserRole.VIEWER],
      [UserRole.DOCTOR]: [UserRole.NURSE, UserRole.VIEWER],
      [UserRole.NURSE]: [UserRole.VIEWER],
      [UserRole.BILLING_CLERK]: [],
      [UserRole.LAB_TECHNICIAN]: [],
      [UserRole.RADIOLOGIST]: [],
      [UserRole.PHARMACIST]: [],
      [UserRole.RECEPTIONIST]: [],
      [UserRole.VIEWER]: [],
    };
  }

  /**
   * Check if user can manage other users
   */
  async canManageUser(managerId: string, targetUserId: string, hospitalId: string): Promise<AccessDecision> {
    const managerContext = await this.getUserContext(managerId, hospitalId);
    const targetUser = await this.userModel.findOne({ userId: targetUserId, hospitalId });

    if (!managerContext || !targetUser) {
      return { granted: false, reason: 'User not found' };
    }

    const hierarchy = this.getRoleHierarchy();
    const managerRoles = hierarchy[managerContext.role] || [];
    
    if (!managerRoles.includes(targetUser.role) && managerContext.role !== targetUser.role) {
      return { granted: false, reason: 'Cannot manage user with higher or equal role' };
    }

    return { granted: true };
  }
}

