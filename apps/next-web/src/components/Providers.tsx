/* eslint-disable import/no-unresolved */
// Type Imports
import type { ChildrenType, Direction } from '@core/types'

// Context Imports
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import ThemeProvider from '@components/theme'

// Util Imports
import { getMode, getSettingsFromCookie, getSystemMode } from '@core/utils/serverHelpers'

import { AuthProvider } from '@/contexts/AuthContext'

import { getServerUser } from '@/utils/serverAuth'
import TokenRefresher from '@/components/TokenRefresher'

type Props = ChildrenType & {
  direction: Direction
}

// React Query Wrapper
import ReactQueryProvider from '@components/ReactQueryProvider'

const Providers = async (props: Props) => {
  // Props
  const { children, direction } = props

  // Vars
  const mode = await getMode()
  const settingsCookie = await getSettingsFromCookie()
  const systemMode = await getSystemMode()
  const user = await getServerUser()

  return (
    <AuthProvider user={user}>
      <TokenRefresher />
      <VerticalNavProvider>
        <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
          <ThemeProvider direction={direction} systemMode={systemMode}>
            {children}
          </ThemeProvider>
        </SettingsProvider>
      </VerticalNavProvider>
    </AuthProvider>
  )
}

export default Providers
