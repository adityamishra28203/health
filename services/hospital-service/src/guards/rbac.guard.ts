import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RBACService } from '../rbac/rbac.service';
import { Request } from 'express';

@Injectable()
export class RBACGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RBACService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'];

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get resource and action from route metadata or request
    const resource = this.reflector.get<string>('resource', context.getHandler()) || 
                     this.getResourceFromRequest(request);
    const action = this.reflector.get<string>('action', context.getHandler()) || 
                   this.getActionFromRequest(request);

    if (!resource || !action) {
      return true; // No RBAC requirements
    }

    try {
      await this.rbacService.authorize(
        user.userId,
        user.hospitalId || request.params.hospitalId,
        resource,
        action,
        { ...request.params, ...request.body, ...request.query }
      );
      return true;
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }

  private getResourceFromRequest(request: Request): string {
    const path = request.route?.path || request.url;
    
    if (path.includes('/users')) return 'users';
    if (path.includes('/patients')) return 'patients';
    if (path.includes('/documents')) return 'documents';
    if (path.includes('/settings')) return 'settings';
    if (path.includes('/audit')) return 'audit';
    if (path.includes('/reports')) return 'reports';
    
    return 'hospital';
  }

  private getActionFromRequest(request: Request): string {
    const method = request.method.toUpperCase();
    
    switch (method) {
      case 'GET': return 'read';
      case 'POST': return 'write';
      case 'PUT':
      case 'PATCH': return 'write';
      case 'DELETE': return 'delete';
      default: return 'read';
    }
  }
}
