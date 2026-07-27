'use client'

import { useCallback, useEffect, useRef } from 'react'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

import { isValidLocationId } from '@/utils/locationId'

const buildPathWithParams = (pathname: string, params: URLSearchParams) => {
  const query = params.toString()

  return query ? `${pathname}?${query}` : pathname
}

export const useLocationFilter = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParamsString = searchParams.toString()
  const cleanedInvalidIdRef = useRef<string | null>(null)

  const rawLocationId = searchParams.get('locationId')
  const locationId = isValidLocationId(rawLocationId) ? rawLocationId : null

  useEffect(() => {
    if (!rawLocationId || isValidLocationId(rawLocationId)) {
      cleanedInvalidIdRef.current = null

      return
    }

    if (cleanedInvalidIdRef.current === rawLocationId) return

    const params = new URLSearchParams(searchParamsString)

    params.delete('locationId')

    const nextPath = buildPathWithParams(pathname, params)
    const currentPath = buildPathWithParams(pathname, new URLSearchParams(searchParamsString))

    if (nextPath === currentPath) return

    cleanedInvalidIdRef.current = rawLocationId
    router.replace(nextPath, { scroll: false })
  }, [rawLocationId, pathname, router, searchParamsString])

  const setLocationId = useCallback((id: string | number | null) => {
    const params = new URLSearchParams(searchParamsString)

    if (id && isValidLocationId(String(id))) {
      params.set('locationId', id.toString())
    } else {
      params.delete('locationId')
    }

    const nextPath = buildPathWithParams(pathname, params)
    const currentPath = buildPathWithParams(pathname, new URLSearchParams(searchParamsString))

    if (nextPath === currentPath) return

    router.replace(nextPath, { scroll: false })
  }, [searchParamsString, pathname, router])

  return {
    locationId,
    setLocationId
  }
}
