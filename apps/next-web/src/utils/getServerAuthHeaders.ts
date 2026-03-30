import { headers, cookies } from 'next/headers'

export async function getServerAuthHeaders(): Promise<Record<string, string>> {
  const headersList = await headers()
  let authorization = headersList.get('authorization')
  const cookieStore = await cookies()

  if (!authorization) {
    const accessToken = cookieStore.get('accessToken')

    if (accessToken) {
      authorization = `Bearer ${accessToken.value}`
    }
  }

  const result: Record<string, string> = {}
  if (authorization) result.Authorization = authorization

  const refreshToken = cookieStore.get('refreshToken')
  if (refreshToken) {
    result['x-refresh-token'] = refreshToken.value
  }

  return result
}
