import { useState, useEffect } from 'react'

import { alpha, useTheme } from '@mui/material/styles'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'

import CustomAvatar from '@core/components/mui/Avatar'
import CustomChip from '@core/components/mui/Chip'

import apiClient from '@/lib/apiClient'
import { SERVICES_CONFIG } from '@/configs/services'

const REVIEWS_API_URL = SERVICES_CONFIG.review.url
const GOOGLE_BLUE = '#4285F4'

interface GbpLocationOption {
    name: string
    title: string
    accountId: string
    storefrontAddress?: {
        addressLines?: string[]
    }
}

interface LocationSelectorModalProps {
    open: boolean
    pendingId: string
    onClose: () => void
    onSuccess: () => void
}

interface PendingData {
    locationId: string
    accounts: unknown[]
    locations: GbpLocationOption[]
}

export default function LocationSelectorModal({
    open,
    pendingId,
    onClose,
    onSuccess
}: LocationSelectorModalProps) {
    const t = useTranslations('locations.ReviewSources')
    const tc = useTranslations('common')
    const theme = useTheme()

    const [loading, setLoading] = useState(true)
    const [finishing, setFinishing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<PendingData | null>(null)
    const [selectedGbpName, setSelectedGbpName] = useState<string>('')

    useEffect(() => {
        if (!open || !pendingId) return

        let isMounted = true

        setLoading(true)
        setError(null)
        setSelectedGbpName('')

        apiClient
            .get<PendingData>(`${REVIEWS_API_URL}/auth/google/pending/${pendingId}`)
            .then(res => {
                if (!isMounted) return
                setData(res.data)

                if (res.data?.locations?.length > 0) {
                    setSelectedGbpName(res.data.locations[0].name)
                }

                setLoading(false)
            })
            .catch(err => {
                if (!isMounted) return
                setError(err.response?.data?.message || 'Failed to load locations.')
                setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [open, pendingId])

    const handleConfirm = async () => {
        if (!selectedGbpName || !data) return

        setFinishing(true)
        setError(null)

        const gbpLocation = data.locations.find(loc => loc.name === selectedGbpName)

        if (!gbpLocation) {
            setError('Failed to connect location.')
            setFinishing(false)

            return
        }

        try {
            await apiClient.post(`${REVIEWS_API_URL}/auth/google/finalize`, {
                pendingId,
                gbpLocationName: gbpLocation.name,
                gbpAccountId: gbpLocation.accountId,
                gbpLocationTitle: gbpLocation.title
            })
            onSuccess()
        } catch (err: unknown) {
            const message =
                err &&
                typeof err === 'object' &&
                'response' in err &&
                err.response &&
                typeof err.response === 'object' &&
                'data' in err.response &&
                err.response.data &&
                typeof err.response.data === 'object' &&
                'message' in err.response.data &&
                typeof err.response.data.message === 'string'
                    ? err.response.data.message
                    : 'Failed to connect location.'

            setError(message)
            setFinishing(false)
        }
    }

    const locationCount = data?.locations?.length ?? 0

    return (
        <Dialog
            open={open}
            onClose={finishing ? undefined : onClose}
            maxWidth='sm'
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                    backgroundImage: 'none'
                }
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    px: 5,
                    py: 4,
                    bgcolor: alpha(GOOGLE_BLUE, 0.08),
                    borderBottom: `1px solid ${theme.palette.divider}`
                }}
            >
                <IconButton
                    onClick={onClose}
                    disabled={finishing}
                    aria-label={tc('cancel')}
                    sx={{ position: 'absolute', right: 12, top: 12 }}
                >
                    <i className='tabler-x' />
                </IconButton>

                <Stack direction='row' spacing={3} alignItems='center' pr={5}>
                    <CustomAvatar
                        skin='light'
                        variant='rounded'
                        sx={{
                            width: 56,
                            height: 56,
                            bgcolor: alpha(GOOGLE_BLUE, 0.15),
                            color: GOOGLE_BLUE
                        }}
                    >
                        <i className='tabler-map-pin' style={{ fontSize: '1.75rem' }} />
                    </CustomAvatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant='h5' fontWeight={700}>
                            {t('selector.title')}
                        </Typography>
                        <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                            {t('selector.subtitle')}
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            <DialogContent sx={{ px: 5, py: 4 }}>
                {loading ? (
                    <Stack spacing={2}>
                        <Skeleton variant='rounded' height={72} />
                        <Skeleton variant='rounded' height={72} />
                        <Skeleton variant='rounded' height={72} />
                    </Stack>
                ) : error && !data?.locations?.length ? (
                    <Alert severity='error'>{error}</Alert>
                ) : (
                    <>
                        {error ? (
                            <Alert severity='error' sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        ) : null}

                        <Stack
                            direction='row'
                            alignItems='center'
                            justifyContent='space-between'
                            spacing={2}
                            sx={{ mb: 3 }}
                        >
                            <Typography variant='overline' color='text.secondary' fontWeight={600}>
                                {t('selector.foundLocations', { count: locationCount })}
                            </Typography>
                            {locationCount > 0 ? (
                                <CustomChip
                                    size='small'
                                    variant='tonal'
                                    color='info'
                                    label={`${locationCount}`}
                                />
                            ) : null}
                        </Stack>

                        <Stack
                            spacing={1.5}
                            sx={{
                                maxHeight: 320,
                                overflowY: 'auto',
                                pr: 0.5,
                                mb: 1
                            }}
                        >
                            {data?.locations?.map(loc => {
                                const isSelected = selectedGbpName === loc.name
                                const address =
                                    loc.storefrontAddress?.addressLines?.join(', ') ||
                                    t('selector.noAddress')

                                return (
                                    <Box
                                        key={loc.name}
                                        role='button'
                                        tabIndex={0}
                                        onClick={() => !finishing && setSelectedGbpName(loc.name)}
                                        onKeyDown={event => {
                                            if (finishing) return
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault()
                                                setSelectedGbpName(loc.name)
                                            }
                                        }}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            p: 2.5,
                                            borderRadius: 2,
                                            cursor: finishing ? 'default' : 'pointer',
                                            border: '2px solid',
                                            borderColor: isSelected
                                                ? GOOGLE_BLUE
                                                : theme.palette.divider,
                                            bgcolor: isSelected
                                                ? alpha(GOOGLE_BLUE, 0.06)
                                                : 'background.paper',
                                            boxShadow: isSelected
                                                ? `0 0 0 1px ${alpha(GOOGLE_BLUE, 0.15)}`
                                                : 'none',
                                            opacity: finishing && !isSelected ? 0.55 : 1,
                                            transition:
                                                'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
                                            '&:hover': finishing
                                                ? undefined
                                                : {
                                                      borderColor: isSelected
                                                          ? GOOGLE_BLUE
                                                          : alpha(GOOGLE_BLUE, 0.45),
                                                      bgcolor: isSelected
                                                          ? alpha(GOOGLE_BLUE, 0.08)
                                                          : alpha(theme.palette.action.hover, 0.04)
                                                  }
                                        }}
                                    >
                                        <CustomAvatar
                                            skin='light'
                                            variant='rounded'
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                flexShrink: 0,
                                                bgcolor: 'common.white',
                                                color: isSelected ? GOOGLE_BLUE : theme.palette.text.secondary,
                                                border: `1px solid ${isSelected ? alpha(GOOGLE_BLUE, 0.35) : theme.palette.divider}`
                                            }}
                                        >
                                            <i className='tabler-building-store' style={{ fontSize: '1.25rem' }} />
                                        </CustomAvatar>

                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Typography
                                                variant='subtitle2'
                                                fontWeight={isSelected ? 700 : 600}
                                                noWrap
                                            >
                                                {loc.title}
                                            </Typography>
                                            <Typography
                                                variant='caption'
                                                color='text.secondary'
                                                sx={{
                                                    display: 'block',
                                                    mt: 0.5,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {address}
                                            </Typography>
                                        </Box>

                                        <Box
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                border: '2px solid',
                                                borderColor: isSelected
                                                    ? GOOGLE_BLUE
                                                    : theme.palette.divider,
                                                bgcolor: isSelected ? GOOGLE_BLUE : 'transparent',
                                                color: isSelected ? 'common.white' : 'transparent',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {isSelected ? (
                                                <i className='tabler-check' style={{ fontSize: '0.95rem' }} />
                                            ) : null}
                                        </Box>
                                    </Box>
                                )
                            })}
                        </Stack>
                    </>
                )}
            </DialogContent>

            <Divider />

            <DialogActions
                sx={{
                    px: 5,
                    py: 3,
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2
                }}
            >
                <Stack direction='row' spacing={1} alignItems='center'>
                    <i
                        className='tabler-brand-google'
                        style={{ fontSize: '1rem', color: GOOGLE_BLUE }}
                    />
                    <Typography variant='caption' color='text.secondary'>
                        {t('googleModal.secure')}
                    </Typography>
                </Stack>
                <Stack direction='row' spacing={2}>
                    <Button
                        onClick={onClose}
                        variant='outlined'
                        color='secondary'
                        disabled={finishing}
                    >
                        {tc('cancel')}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        variant='contained'
                        disabled={!selectedGbpName || finishing || loading}
                        startIcon={
                            finishing ? (
                                <CircularProgress size={18} color='inherit' />
                            ) : (
                                <i className='tabler-plug-connected' />
                            )
                        }
                        sx={{
                            fontWeight: 600,
                            bgcolor: GOOGLE_BLUE,
                            '&:hover': { bgcolor: alpha(GOOGLE_BLUE, 0.88) }
                        }}
                    >
                        {finishing ? t('selector.connecting') : t('selector.confirm')}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    )
}
