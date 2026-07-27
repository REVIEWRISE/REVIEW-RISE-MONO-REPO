/* eslint-disable import/no-unresolved */
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

import { alpha, useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import CustomAvatar from '@core/components/mui/Avatar'
import CustomChip from '@core/components/mui/Chip'

import ConnectGoogleModal from '@/components/admin/locations/integrations/ConnectGoogleModal'
import { SERVICES_CONFIG } from '@/configs/services'
import { useAccountChannelStatus } from '@/hooks/useAccountChannelStatus'
import { useLocationFilter } from '@/hooks/useLocationFilter'
import useTranslation from '@/hooks/useTranslation'
import apiClient from '@/lib/apiClient'
import { isFacebookConnected } from '@/utils/accountChannelStatus'

const REVIEWS_API = SERVICES_CONFIG.review.url

const BRAND = {
  google: '#4285F4',
  facebook: '#1877F2'
} as const

type FacebookPage = {
  id: string
  name: string
  category?: string
}

type ConnectingProvider = 'google' | 'facebook' | null

type PlatformCardProps = {
  brandColor: string
  icon: string
  title: string
  subtitle: string
  features: string[]
  connected: boolean
  loading?: boolean
  connectedLabel: string
  notConnectedLabel: string
  connectLabel: string
  manageLabel: string
  manageHref?: string
  onConnect?: () => void
  connectDisabled?: boolean
  connecting?: boolean
}

const PlatformCard = ({
  brandColor,
  icon,
  title,
  subtitle,
  features,
  connected,
  loading = false,
  connectedLabel,
  notConnectedLabel,
  connectLabel,
  manageLabel,
  manageHref,
  onConnect,
  connectDisabled = false,
  connecting = false
}: PlatformCardProps) => {
  const theme = useTheme()

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${connected ? theme.palette.success.main : theme.palette.divider}`,
        boxShadow: connected ? `0 0 0 1px ${alpha(theme.palette.success.main, 0.2)}` : 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          px: 4,
          py: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          bgcolor: alpha(brandColor, 0.08),
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Stack direction='row' spacing={2} alignItems='center' sx={{ minWidth: 0 }}>
          <CustomAvatar
            skin='light'
            variant='rounded'
            sx={{
              width: 48,
              height: 48,
              bgcolor: alpha(brandColor, 0.15),
              color: brandColor
            }}
          >
            <i className={icon} style={{ fontSize: '1.5rem' }} />
          </CustomAvatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant='subtitle1' fontWeight={700} noWrap>
              {title}
            </Typography>
            <Typography variant='caption' color='text.secondary' noWrap>
              {subtitle}
            </Typography>
          </Box>
        </Stack>
        {loading ? (
          <Skeleton width={96} height={26} sx={{ borderRadius: 2, flexShrink: 0 }} />
        ) : (
          <CustomChip
            size='small'
            variant='tonal'
            color={connected ? 'success' : 'secondary'}
            label={connected ? connectedLabel : notConnectedLabel}
            sx={{ flexShrink: 0 }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3, pt: 4 }}>
        <Stack spacing={1.5}>
          {features.map(feature => (
            <Stack key={feature} direction='row' spacing={1.5} alignItems='flex-start'>
              <i
                className='tabler-circle-check-filled'
                style={{
                  fontSize: '1rem',
                  color: connected ? theme.palette.success.main : theme.palette.text.disabled,
                  marginTop: 2,
                  flexShrink: 0
                }}
              />
              <Typography variant='body2' color='text.secondary'>
                {feature}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Box sx={{ mt: 'auto', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {connected && manageHref ? (
            <Button
              component={Link}
              href={manageHref}
              size='small'
              variant='outlined'
              startIcon={<i className='tabler-settings' />}
            >
              {manageLabel}
            </Button>
          ) : null}
          {!connected ? (
            <Button
              size='small'
              variant='contained'
              onClick={onConnect}
              disabled={connectDisabled || loading || connecting}
              startIcon={
                connecting
                  ? <CircularProgress size={16} color='inherit' />
                  : <i className='tabler-plug-connected' />
              }
              sx={{
                bgcolor: brandColor,
                '&:hover': { bgcolor: alpha(brandColor, 0.88) }
              }}
            >
              {connectLabel}
            </Button>
          ) : null}
        </Box>
      </CardContent>
    </Card>
  )
}

const AccountChannels = ({
  data,
  onRefresh
}: {
  data: any
  onRefresh?: () => void
}) => {
  const t = useTranslation('dashboard')
  const tc = useTranslation('common')
  const theme = useTheme()
  const channelStatus = useAccountChannelStatus(data)
  const { locationId: filterLocationId } = useLocationFilter()

  const locations = channelStatus.locations
  const businessId = channelStatus.businessId

  const [selectedLocationId, setSelectedLocationId] = useState('')
  const [googleModalOpen, setGoogleModalOpen] = useState(false)
  const [fbPages, setFbPages] = useState<FacebookPage[]>([])
  const [fbModalOpen, setFbModalOpen] = useState(false)
  const [fbTempToken, setFbTempToken] = useState<string | null>(null)
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null)
  const [connectingProvider, setConnectingProvider] = useState<ConnectingProvider>(null)

  useEffect(() => {
    if (!locations.length) {
      setSelectedLocationId('')

      return
    }

    if (filterLocationId && locations.some(location => location.id === filterLocationId)) {
      setSelectedLocationId(filterLocationId)

      return
    }

    setSelectedLocationId(current => (
      current && locations.some(location => location.id === current)
        ? current
        : locations[0].id
    ))
  }, [filterLocationId, locations])

  const selectedLocation = useMemo(
    () => locations.find(location => location.id === selectedLocationId),
    [locations, selectedLocationId]
  )

  const googleConnectedForLocation = channelStatus.google.locations.some(
    location => location.locationId === selectedLocationId
  )

  const facebookConnectedForLocation = selectedLocation
    ? isFacebookConnected(selectedLocation)
    : false

  const connectedCount = [googleConnectedForLocation, facebookConnectedForLocation].filter(Boolean).length

  const googleSubtitle = (() => {
    if (!googleConnectedForLocation || channelStatus.google.loading) {
      return t('accounts.channels.googleSubtitle')
    }

    const match = channelStatus.google.locations.find(
      location => location.locationId === selectedLocationId
    )

    return match
      ? t('accounts.channels.googleConnectedAt', { name: match.name })
      : t('accounts.channels.googleSubtitle')
  })()

  const handleAfterConnect = useCallback(() => {
    channelStatus.refresh()
    onRefresh?.()
  }, [channelStatus, onRefresh])

  const handleConnectGoogle = async () => {
    if (!selectedLocationId) return

    try {
      setConnectingProvider('google')

      const res = await apiClient.get<{ url: string }>(
        `${REVIEWS_API}/auth/google/connect`,
        { params: { locationId: selectedLocationId } }
      )

      const url = res.data?.url

      if (url) {
        window.location.href = url
      } else {
        setSnackbarMsg(t('accounts.channels.connectFailed'))
      }
    } catch {
      setSnackbarMsg(t('accounts.channels.connectFailed'))
    } finally {
      setConnectingProvider(null)
      setGoogleModalOpen(false)
    }
  }

  const startFacebookConnect = async () => {
    if (!selectedLocationId || !businessId) return

    try {
      setConnectingProvider('facebook')

      const res = await apiClient.get<{ url: string }>(
        `${SERVICES_CONFIG.social.url}/facebook/auth-url`,
        { params: { businessId, locationId: selectedLocationId } }
      )

      const width = 600
      const height = 700
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      window.open(res.data.url, 'FacebookAuth', `width=${width},height=${height},left=${left},top=${top}`)
    } catch {
      setSnackbarMsg(t('accounts.channels.connectFailed'))
    } finally {
      setConnectingProvider(null)
    }
  }

  const confirmFacebookPage = async (page: FacebookPage) => {
    if (!selectedLocationId || !businessId || !fbTempToken) return

    try {
      setConnectingProvider('facebook')
      await apiClient.post(`${SERVICES_CONFIG.social.url}/facebook/connect`, {
        businessId,
        locationId: selectedLocationId,
        page,
        userAccessToken: fbTempToken
      })
      setFbModalOpen(false)
      setFbTempToken(null)
      setFbPages([])
      handleAfterConnect()
    } catch {
      setSnackbarMsg(t('accounts.channels.connectFailed'))
    } finally {
      setConnectingProvider(null)
    }
  }

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type !== 'FACEBOOK_AUTH_SUCCESS' || !selectedLocationId) return

      const { accessToken } = event.data

      setFbTempToken(accessToken)

      try {
        const res = await apiClient.get<{ pages: FacebookPage[] }>(
          `${SERVICES_CONFIG.social.url}/facebook/pages`,
          { headers: { 'x-fb-access-token': accessToken } }
        )

        setFbPages(res.data.pages ?? [])
        setFbModalOpen(true)
      } catch {
        setSnackbarMsg(t('accounts.channels.connectFailed'))
      }
    }

    window.addEventListener('message', handleMessage)

    return () => window.removeEventListener('message', handleMessage)
  }, [selectedLocationId, t])

  const locationManageBase = selectedLocationId
    ? `/admin/locations/${selectedLocationId}`
    : undefined

  return (
    <Card>
      <CardHeader
        title={t('accounts.channels.title')}
        subheader={t('accounts.channels.subtitle')}
        avatar={
          <CustomAvatar skin='light' variant='rounded' color='info' sx={{ width: 48, height: 48 }}>
            <i className='tabler-plug-connected' style={{ fontSize: '1.5rem' }} />
          </CustomAvatar>
        }
      />
      <Divider />
      <CardContent sx={{ pt: 4 }}>
        {locations.length === 0 ? (
          <Box
            sx={{
              py: 8,
              px: 4,
              textAlign: 'center',
              borderRadius: 2,
              border: `1px dashed ${theme.palette.divider}`,
              bgcolor: 'action.hover'
            }}
          >
            <CustomAvatar skin='light' color='secondary' sx={{ width: 56, height: 56, mx: 'auto', mb: 3 }}>
              <i className='tabler-map-pin-off' style={{ fontSize: '1.5rem' }} />
            </CustomAvatar>
            <Typography variant='h6' fontWeight={600} gutterBottom>
              {t('accounts.channels.emptyTitle')}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 360, mx: 'auto' }}>
              {t('accounts.channels.emptyDescription')}
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                mb: 5,
                p: 3,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'stretch', md: 'center' },
                justifyContent: 'space-between',
                gap: 3
              }}
            >
              <Stack direction='row' spacing={2} alignItems='center' sx={{ minWidth: 0 }}>
                <CustomAvatar skin='light' color='primary' size={40}>
                  <i className='tabler-map-pin' />
                </CustomAvatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant='caption' color='text.secondary' display='block'>
                    {t('accounts.channels.locationScope')}
                  </Typography>
                  <Typography variant='subtitle1' fontWeight={600} noWrap>
                    {selectedLocation?.name || '—'}
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                sx={{ flexShrink: 0 }}
              >
                <FormControl size='small' sx={{ minWidth: { xs: '100%', sm: 220 } }}>
                  <InputLabel id='account-channels-location-label'>
                    {t('accounts.channels.selectLocation')}
                  </InputLabel>
                  <Select
                    labelId='account-channels-location-label'
                    label={t('accounts.channels.selectLocation')}
                    value={selectedLocationId}
                    onChange={event => setSelectedLocationId(event.target.value)}
                  >
                    {locations.map(location => (
                      <MenuItem key={location.id} value={location.id}>
                        {location.name || location.id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <CustomChip
                  variant='tonal'
                  color={connectedCount > 0 ? 'success' : 'secondary'}
                  label={t('accounts.channels.platformsSummary', { connected: connectedCount, total: 2 })}
                  sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, fontWeight: 600 }}
                />
              </Stack>
            </Box>

            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <PlatformCard
                  brandColor={BRAND.google}
                  icon='tabler-brand-google'
                  title={t('common.channel.google')}
                  subtitle={googleSubtitle}
                  features={[
                    t('accounts.channels.googleFeatureReviews'),
                    t('accounts.channels.googleFeatureProfile')
                  ]}
                  connected={googleConnectedForLocation}
                  loading={channelStatus.google.loading}
                  connectedLabel={t('accounts.channels.connected')}
                  notConnectedLabel={t('accounts.channels.notConnected')}
                  connectLabel={t('accounts.channels.connect')}
                  manageLabel={t('accounts.channels.manage')}
                  manageHref={locationManageBase ? `${locationManageBase}?tab=integrations` : undefined}
                  onConnect={() => setGoogleModalOpen(true)}
                  connectDisabled={connectingProvider !== null || !selectedLocationId}
                  connecting={connectingProvider === 'google'}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <PlatformCard
                  brandColor={BRAND.facebook}
                  icon='tabler-brand-facebook'
                  title={t('common.channel.facebook')}
                  subtitle={t('accounts.channels.facebookSubtitle')}
                  features={[
                    t('accounts.channels.facebookFeaturePages'),
                    t('accounts.channels.facebookFeatureEngagement')
                  ]}
                  connected={facebookConnectedForLocation}
                  connectedLabel={t('accounts.channels.connected')}
                  notConnectedLabel={t('accounts.channels.notConnected')}
                  connectLabel={t('accounts.channels.connect')}
                  manageLabel={t('accounts.channels.manage')}
                  manageHref={locationManageBase ? `${locationManageBase}?tab=social` : undefined}
                  onConnect={startFacebookConnect}
                  connectDisabled={connectingProvider !== null || !selectedLocationId || !businessId}
                  connecting={connectingProvider === 'facebook'}
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                mt: 5,
                p: 3,
                borderRadius: 2,
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2
              }}
            >
              <i className='tabler-info-circle' style={{ fontSize: '1.1rem', marginTop: 2 }} />
              <Typography variant='caption' color='text.secondary'>
                {t('accounts.channels.selectLocationHint')}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>

      <ConnectGoogleModal
        open={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onConnect={handleConnectGoogle}
        loading={connectingProvider === 'google'}
      />

      <Dialog open={fbModalOpen} onClose={() => setFbModalOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{t('accounts.channels.facebookSubtitle')}</DialogTitle>
        <DialogContent>
          <List>
            {fbPages.map(page => (
              <ListItemButton key={page.id} onClick={() => confirmFacebookPage(page)}>
                <ListItemText primary={page.name} secondary={page.category} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFbModalOpen(false)}>
            {tc('common.cancel')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbarMsg}
        autoHideDuration={6000}
        onClose={() => setSnackbarMsg(null)}
        message={snackbarMsg}
      />
    </Card>
  )
}

export default AccountChannels
