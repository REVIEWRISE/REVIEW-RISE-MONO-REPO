const POSTGRES_UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Matches Postgres @db.Uuid and express-reviews LocationIdParamSchema. */
export const isValidLocationId = (locationId: string | null | undefined): locationId is string =>
  !!locationId && locationId !== 'all' && POSTGRES_UUID_REGEX.test(locationId)

export const resolveLocationIdFromParams = (
  id: string | string[] | undefined
): string | undefined => {
  const raw = Array.isArray(id) ? id[0] : id

  return isValidLocationId(raw) ? raw : undefined
}

/** Returns a valid location UUID for API calls, or undefined to mean "all locations". */
export const resolveScopedLocationId = (locationId?: string | null): string | undefined =>
  isValidLocationId(locationId) ? locationId : undefined
