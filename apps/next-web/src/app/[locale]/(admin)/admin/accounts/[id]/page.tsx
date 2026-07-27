'use client'

import { useParams } from 'next/navigation'

import AccountDetail from '@/views/admin/accounts/AccountDetail'

const AccountByIdPage = () => {
  const params = useParams()
  const accountId = typeof params.id === 'string' ? params.id : undefined

  return <AccountDetail accountId={accountId} initialTab="locations" />
}

export default AccountByIdPage
