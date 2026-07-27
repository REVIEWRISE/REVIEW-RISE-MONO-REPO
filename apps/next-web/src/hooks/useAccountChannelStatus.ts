'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { getGoogleConnectionSummary, type GoogleConnectionLocation } from '@/app/actions/account'
import { getAccountLocations, isFacebookConnected } from '@/utils/accountChannelStatus'

export const useAccountChannelStatus = (account: any) => {
  const locations = useMemo(() => getAccountLocations(account), [account])
  const locationIds = useMemo(() => locations.map(location => location.id), [locations])

  const locationIdsKey = locationIds.join('|')
  const businessId = account?.userBusinessRoles?.[0]?.business?.id as string | undefined

  const facebookStatus = useMemo(() => {
    const connectedLocations = locations.filter(isFacebookConnected)

    return {
      connected: connectedLocations.length > 0,
      locationCount: connectedLocations.length
    }
  }, [locations])

  const [googleConnected, setGoogleConnected] = useState(false)
  const [googleLocations, setGoogleLocations] = useState<GoogleConnectionLocation[]>([])
  const [googleLoading, setGoogleLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => {
    setRefreshKey(current => current + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadGoogleStatus = async () => {
      setGoogleLoading(true)

      try {
        const summary = await getGoogleConnectionSummary(locationIds, businessId)

        if (!cancelled) {
          setGoogleConnected(summary.connected)
          setGoogleLocations(summary.locations)
        }
      } finally {
        if (!cancelled) {
          setGoogleLoading(false)
        }
      }
    }

    loadGoogleStatus()

    return () => {
      cancelled = true
    }
  }, [locationIdsKey, businessId, refreshKey])

  return {
    locations,
    businessId,
    google: {
      connected: googleConnected,
      locations: googleLocations,
      loading: googleLoading
    },
    facebook: {
      ...facebookStatus,
      loading: false
    },
    reviewSync: {
      connected: googleConnected || facebookStatus.connected,
      loading: googleLoading
    },
    loading: googleLoading,
    refresh
  }
}
