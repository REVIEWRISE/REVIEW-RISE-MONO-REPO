/* eslint-disable import/no-unresolved */
'use client'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import GlobalSearch from '@components/layout/shared/GlobalSearch'
import LocationDropdown from '@components/layout/shared/LocationDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import NotificationDropdown from '@components/layout/shared/NotificationDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

import LanguageDropdown from '../shared/LanguageDropdown'
import NavToggle from './NavToggle'

const NavbarContent = () => {
  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-4 flex-grow'>
        <NavToggle />
        <div className='hidden md:flex items-center gap-4'>
          <LocationDropdown />
        </div>
        <div className='flex-grow mx-4'>
          <GlobalSearch />
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <ModeDropdown />
        <NotificationDropdown />
        <LanguageDropdown />

        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
