import { UserRole } from '@/entities/user/types'

/**
 * Permission definitions for each role across different features
 */

// Feature flags for menu items
export enum MenuFeature {
  USERS = 'users',
  BRANCHES = 'branches',
  LOADS = 'loads',
}

// Action permissions for different entities
export enum ActionPermission {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

/**
 * Role-based access control map
 * Defines what menu items each role can see
 */
export const MENU_PERMISSIONS: Record<UserRole, MenuFeature[]> = {
  [UserRole.HEAD_OWNER]: [
    MenuFeature.USERS,
    MenuFeature.BRANCHES,
    MenuFeature.LOADS,
  ],
  [UserRole.HEAD_ACCOUNTANT]: [
    MenuFeature.USERS,
    MenuFeature.BRANCHES,
    MenuFeature.LOADS,
  ],
  [UserRole.OWNER]: [
    MenuFeature.USERS,
    MenuFeature.LOADS,
  ],
  [UserRole.ACCOUNTANT]: [
    MenuFeature.LOADS,
  ],
  [UserRole.AGENT]: [
    MenuFeature.LOADS,
  ],
  [UserRole.CARRIER]: [
    MenuFeature.LOADS,
  ],
}

/**
 * Check if a user role has access to a specific menu feature
 */
export const hasMenuAccess = (role: UserRole, feature: MenuFeature): boolean => {
  const permissions = MENU_PERMISSIONS[role]
  return permissions?.includes(feature) ?? false
}

/**
 * Check if a user role has a specific action permission for loads
 * Based on the requirement: Carrier can post and edit loads
 */
export const hasLoadPermission = (role: UserRole, action: ActionPermission): boolean => {
  switch (role) {
    case UserRole.HEAD_OWNER:
    case UserRole.HEAD_ACCOUNTANT:
    case UserRole.OWNER:
      // Full access: create, read, update, delete
      return true
    
    case UserRole.ACCOUNTANT:
      // Accounting access: create, read, update (for accounting purposes)
      return action !== ActionPermission.DELETE
    
    case UserRole.AGENT:
      // Agent: can review and manage loads posted by Carriers
      // Read-only access to view loads
      return action === ActionPermission.READ || action === ActionPermission.UPDATE
    
    case UserRole.CARRIER:
      // Carrier: can post loads and edit their own loads
      return action === ActionPermission.CREATE || 
             action === ActionPermission.READ || 
             action === ActionPermission.UPDATE
    
    default:
      return false
  }
}

/**
 * Check if a user role has a specific action permission for users
 */
export const hasUserPermission = (role: UserRole, action: ActionPermission): boolean => {
  switch (role) {
    case UserRole.HEAD_OWNER:
    case UserRole.HEAD_ACCOUNTANT:
      // Full access across all branches
      return true
    
    case UserRole.OWNER:
      // Owner: full access within their branch
      return true
    
    case UserRole.ACCOUNTANT:
    case UserRole.AGENT:
    case UserRole.CARRIER:
      // Limited/no access to user management
      return false
    
    default:
      return false
  }
}

/**
 * Check if a user role has a specific action permission for branches
 */
export const hasBranchPermission = (role: UserRole, action: ActionPermission): boolean => {
  switch (role) {
    case UserRole.HEAD_OWNER:
    case UserRole.HEAD_ACCOUNTANT:
      // Full access to branch management
      return true
    
    case UserRole.OWNER:
    case UserRole.ACCOUNTANT:
    case UserRole.AGENT:
    case UserRole.CARRIER:
      // No access to branch management (only Head Owner/Head Accountant can manage branches)
      return false
    
    default:
      return false
  }
}

/**
 * Get all menu features accessible by a role
 */
export const getAccessibleMenus = (role: UserRole): MenuFeature[] => {
  return MENU_PERMISSIONS[role] || []
}

