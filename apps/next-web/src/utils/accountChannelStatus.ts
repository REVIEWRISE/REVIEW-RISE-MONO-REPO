type LocationRecord = {
  id: string
  name?: string
  socialConnections?: Array<{ platform: string; status: string }>
}

/** Collect all locations tied to the account's business roles. */
export const getAccountLocations = (account: any): LocationRecord[] => {
  const fromBusiness = account?.userBusinessRoles?.[0]?.business?.locations ?? []

  const fromRoles = (account?.userBusinessRoles ?? [])
    .map((role: any) => role.location)
    .filter(Boolean)

  const byId = new Map<string, LocationRecord>()

  for (const location of [...fromBusiness, ...fromRoles]) {
    byId.set(location.id, location)
  }

  return Array.from(byId.values())
}

export const isFacebookConnected = (location: LocationRecord): boolean =>
  (location.socialConnections ?? []).some(
    connection => connection.platform === 'facebook' && connection.status === 'active'
  )

export type AccountChannelStatus = {
  locations: LocationRecord[]
  facebook: { connected: boolean; locationCount: number }
}

export const getAccountChannelStatus = (account: any): AccountChannelStatus => {
  const locations = getAccountLocations(account)
  const facebookLocations = locations.filter(isFacebookConnected)

  return {
    locations,
    facebook: {
      connected: facebookLocations.length > 0,
      locationCount: facebookLocations.length
    }
  }
}
