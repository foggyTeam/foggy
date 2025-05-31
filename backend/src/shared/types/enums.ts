export enum Role {
  READER = 'reader',
  EDITOR = 'editor',
  ADMIN = 'admin',
  OWNER = 'owner',
}

export const RoleLevel: Record<Role, number> = {
  [Role.READER]: 0,
  [Role.EDITOR]: 1,
  [Role.ADMIN]: 2,
  [Role.OWNER]: 3,
} as const;

export const ROLES = Object.values(Role);

export enum EntityType {
  USER = 'USER',
  TEAM = 'TEAM',
  PROJECT = 'PROJECT',
}

export enum NotificationType {
  PROJECT_JOIN_REQUEST = 'PROJECT_JOIN_REQUEST',
  TEAM_JOIN_REQUEST = 'TEAM_JOIN_REQUEST',
  PROJECT_INVITE = 'PROJECT_INVITE',
  TEAM_INVITE = 'TEAM_INVITE',
  PROJECT_JOIN_ACCEPTED = 'PROJECT_JOIN_ACCEPTED',
  TEAM_JOIN_ACCEPTED = 'TEAM_JOIN_ACCEPTED',
  PROJECT_JOIN_REJECTED = 'PROJECT_JOIN_REJECTED',
  TEAM_JOIN_REJECTED = 'TEAM_JOIN_REJECTED',
}
