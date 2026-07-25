/* eslint-disable react/jsx-no-literals */
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Snackbar from '@mui/material/Snackbar'

// Icons
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BlockIcon from '@mui/icons-material/Block'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import GoogleIcon from '@mui/icons-material/Google'
import SyncIcon from '@mui/icons-material/Sync'

import { useTranslations } from 'next-intl'
import apiClient from '@/lib/apiClient'
import { SERVICES_CONFIG } from '@/configs/services'
import { resolveLocationIdFromParams } from '@/utils/locationId'
import ConnectGoogleModal from './ConnectGoogleModal'
import LocationSelectorModal from './LocationSelectorModal'

const REVIEWS_API_URL = SERVICES_CONFIG.review.url

interface ConnectionStatus {
    connected: boolean
    status?: 'active' | 'error' | 'disconnected'
    integrationId?: string
    gbpLocationTitle?: string
    gbpLocationName?: string
    connectedAt?: string
}

export default function IntegrationsDashboard() {
    const t = useTranslations('locations.ReviewSources') // Reusing translations for now
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const locationId = resolveLocationIdFromParams(params.id)

    const [status, setStatus] = useState<ConnectionStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
    
    // Auth flow states
    const pendingGoogleId = searchParams.get('pending_google')
    const googleError = searchParams.get('google_error')
    
    const [resumePendingId, setResumePendingId] = useState<string | null>(null)
    const [isSelectorOpen, setIsSelectorOpen] = useState(!!pendingGoogleId)
    const activePendingId = pendingGoogleId || resumePendingId
    const [syncing, setSyncing] = useState(false)
    const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null)

    const handleSyncReviews = async () => {
        if (!locationId) return

        try {
            setSyncing(true)
            setSnackbarMsg(t('syncStarted'))

            const hasSource = await apiClient.get<unknown[]>(`${REVIEWS_API_URL}/locations/${locationId}/sources`)
                .then(res => Array.isArray(res.data) && res.data.length > 0)
                .catch(() => false)

            if (!hasSource) {
                await apiClient.post(`${REVIEWS_API_URL}/locations/${locationId}/enable-google-sync`)
            }

            const res = await apiClient.post<{ results?: Array<{ status: string; reviewsSynced?: number; errorMessage?: string }>; totalSynced?: number }>(
                `${REVIEWS_API_URL}/locations/${locationId}/sync`
            )

            const totalSynced = res.data?.totalSynced ?? 0
            const failed = res.data?.results?.filter((result) => result.status === 'failed') ?? []

            if (failed.length > 0 && totalSynced === 0) {
                setSnackbarMsg(failed[0]?.errorMessage || t('syncFailed'))
            } else if (totalSynced > 0) {
                setSnackbarMsg(`${t('syncCompletedMsg')} (${totalSynced})`)
            } else {
                setSnackbarMsg(t('syncNoReviewsFound'))
            }
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message

            setSnackbarMsg(message || t('syncFailed'))
        } finally {
            setSyncing(false)
        }
    }

    const goToReviewSources = () => {
        const params = new URLSearchParams(searchParams.toString())

        params.set('tab', 'sources')
        router.replace(`?${params.toString()}`)
    }

    const fetchStatus = useCallback(async () => {
        if (!locationId) return

        try {
            setLoading(true)
            const res = await apiClient.get<ConnectionStatus>(`${REVIEWS_API_URL}/auth/google/status/${locationId}`)

            setStatus(res.data)

            if (!res.data?.connected) {
                const resumeRes = await apiClient.get<{ pendingId: string | null }>(
                    `${REVIEWS_API_URL}/auth/google/pending/location/${locationId}`
                )

                if (resumeRes.data?.pendingId) {
                    setResumePendingId(resumeRes.data.pendingId)
                    setIsSelectorOpen(true)
                }
            } else {
                setResumePendingId(null)
            }
        } catch (error) {
            console.error('Failed to fetch integration status:', error)
        } finally {
            setLoading(false)
        }
    }, [locationId])

    useEffect(() => {
        fetchStatus()
    }, [fetchStatus])

    useEffect(() => {
        if (googleError) {
            let msg = t('errors.default')

            if (googleError === 'access_denied') msg = t('errors.accessDenied')
            else if (googleError === 'no_accounts') msg = t('errors.noAccounts')
            else if (googleError === 'no_locations') msg = t('errors.noLocations')
            else if (googleError === 'session_expired') msg = t('errors.sessionExpired')

            setSnackbarMsg(msg)

            // Strip from URL after showing
            const newUrl = new URL(window.location.href)

            newUrl.searchParams.delete('google_error')
            router.replace(newUrl.pathname + newUrl.search)
        }

        if (pendingGoogleId) {
            setIsSelectorOpen(true)
            setResumePendingId(pendingGoogleId)

            const newUrl = new URL(window.location.href)

            newUrl.searchParams.delete('pending_google')
            router.replace(newUrl.pathname + newUrl.search)
        }
    }, [googleError, pendingGoogleId, router, t])

    const handleConnectGoogle = async () => {
        try {
            const res = await apiClient.get<{ url: string }>(`${REVIEWS_API_URL}/auth/google/connect`, {
                params: { locationId }
            })

            if (res.data?.url) {
                window.location.href = res.data.url
            } else {
                setSnackbarMsg('Failed to generate connection link.')
            }
        } catch {
            setSnackbarMsg('An error occurred. Please try again.')
        }
    }

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect this location? Features relying on this connection will stop working.')) return

        try {
            setLoading(true)
            await apiClient.post(`${REVIEWS_API_URL}/auth/google/disconnect/${locationId}`)
            await fetchStatus()
            setSnackbarMsg('Google Business Profile disconnected.')
        } catch {
            setSnackbarMsg('Failed to disconnect. Please try again.')
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box sx={{ p: { xs: 2, sm: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" fontWeight="bold">{t('connectedPlatforms')}</Typography>
            </Box>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {t('integrationsDesc')}
            </Typography>

            <Card sx={{ p: 4, borderRadius: 2, display: 'flex', alignItems: 'flex-start', border: status?.connected ? '1px solid #4CAF50' : 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', bgcolor: 'background.default', mr: 3 }}>
                    <GoogleIcon fontSize="large" sx={{ color: '#4285F4' }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>{t('googleBusiness')}</Typography>
                    
                    {status?.connected && status.status === 'active' ? (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <CheckCircleIcon color="success" fontSize="small" />
                                <Typography variant="body2" color="success.main" fontWeight="bold">{t('connected')}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('to')} <strong>{status.gbpLocationTitle || status.gbpLocationName}</strong>
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {t('connectionActiveDesc')}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    color="warning"
                                    size="small"
                                    startIcon={<SyncIcon />}
                                    disabled={syncing}
                                    onClick={handleSyncReviews}
                                >
                                    {syncing ? t('syncing') : t('syncNow')}
                                </Button>
                                <Button variant="outlined" color="primary" size="small" onClick={goToReviewSources}>
                                    {t('reviewSourcesTab')}
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    color="error" 
                                    size="small"
                                    startIcon={<LinkOffIcon />}
                                    onClick={handleDisconnect}
                                >
                                    {t('disconnect')}
                                </Button>
                            </Box>
                        </>
                    ) : status?.connected && status.status === 'error' ? (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <BlockIcon color="error" fontSize="small" />
                                <Typography variant="body2" color="error.main" fontWeight="bold">{t('connectionError')}</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {t('lostAccessDesc')}
                            </Typography>
                            <Button variant="contained" color="primary" onClick={() => setIsConnectModalOpen(true)}>
                                {t('reconnectGoogle')}
                            </Button>
                        </>
                    ) : activePendingId ? (
                        <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {t('selector.subtitle')}
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setIsSelectorOpen(true)}
                            >
                                {t('selector.confirm')}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {t('connectGoogleDesc')}
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddCircleOutlineIcon />}
                                onClick={() => setIsConnectModalOpen(true)}
                            >
                                {t('connect')}
                            </Button>
                        </>
                    )}
                </Box>
            </Card>

            <ConnectGoogleModal 
                open={isConnectModalOpen} 
                onClose={() => setIsConnectModalOpen(false)} 
                onConnect={handleConnectGoogle}
            />

            <LocationSelectorModal 
                open={isSelectorOpen}
                pendingId={activePendingId || ''}
                onClose={() => {
                    setIsSelectorOpen(false)
                    setResumePendingId(null)
                }}
                onSuccess={() => {
                    setIsSelectorOpen(false)
                    setResumePendingId(null)
                    setSnackbarMsg('Successfully connected to Google Business Profile!')
                    fetchStatus()
                }}
            />

            <Snackbar
                open={!!snackbarMsg}
                autoHideDuration={6000}
                onClose={() => setSnackbarMsg(null)}
                message={snackbarMsg}
            />
        </Box>
    )
}
