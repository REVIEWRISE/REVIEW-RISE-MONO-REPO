/* eslint-disable import/no-unresolved */
'use client'

// React Imports
import { useEffect } from 'react'

// Next Imports
import { usePathname, useRouter } from 'next/navigation'

// MUI Imports
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Type Imports
import type { ChildrenType } from '@core/types'

// Context Imports
import { useAuth } from '@/contexts/AuthContext'

export default function AuthGuard({ children }: ChildrenType) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      if (pathname !== '/login') {
        const searchParams = new URLSearchParams()

        searchParams.set('returnUrl', pathname)
        router.replace(`/login?${searchParams.toString()}`)
      }
    }
  }, [user, loading, router, pathname])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
