import { ROLES, type RoleType } from './roles'

export type MenuItem = {
  title: string
  href?: string
  icon?: string
  children?: MenuItem[]
  allowedRoles?: RoleType[]
}

const menuData: MenuItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'tabler-smart-home',
    allowedRoles: [ROLES.ADMIN]
  },
  {
    title: 'Reviews',
    href: '/reviews',
    icon: 'tabler-star',
    allowedRoles: [ROLES.ADMIN]
  },
]

export default menuData
