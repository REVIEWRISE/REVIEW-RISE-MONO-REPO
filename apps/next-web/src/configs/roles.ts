export const ROLES = {
  ADMIN: 'Admin',
} as const

export type RoleType = typeof ROLES[keyof typeof ROLES]
