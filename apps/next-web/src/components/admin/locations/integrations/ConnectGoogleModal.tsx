import { alpha, useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'

import CustomAvatar from '@core/components/mui/Avatar'

const GOOGLE_BLUE = '#4285F4'

interface ConnectGoogleModalProps {
  open: boolean
  onClose: () => void
  onConnect: () => void
  loading?: boolean
}

const ConnectGoogleModal = ({ open, onClose, onConnect, loading = false }: ConnectGoogleModalProps) => {
  const t = useTranslations('locations.ReviewSources.googleModal')
  const tc = useTranslations('common')
  const theme = useTheme()

  const steps = [
    { id: 1, title: t('step1Title'), description: t('step1Desc'), icon: 'tabler-key' },
    { id: 2, title: t('step2Title'), description: t('step2Desc'), icon: 'tabler-map-pin' },
    { id: 3, title: t('step3Title'), description: t('step3Desc'), icon: 'tabler-refresh' }
  ]

  const permissions = [
    t('permission1'),
    t('permission2'),
    t('permission3')
  ]

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
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
          disabled={loading}
          aria-label={tc('common.cancel')}
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
            <i className='tabler-brand-google' style={{ fontSize: '1.75rem' }} />
          </CustomAvatar>
          <Box>
            <Typography variant='h5' fontWeight={700}>
              {t('title')}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
              {t('subtitle')}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <DialogContent sx={{ px: 5, py: 5 }}>
        <Typography variant='overline' color='text.secondary' fontWeight={600} sx={{ mb: 3, display: 'block' }}>
          {t('howItWorks')}
        </Typography>

        <Stack spacing={0} sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Stack key={step.id} direction='row' spacing={2.5} sx={{ position: 'relative' }}>
              {index < steps.length - 1 ? (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 19,
                    top: 40,
                    bottom: -8,
                    width: 2,
                    bgcolor: alpha(GOOGLE_BLUE, 0.2)
                  }}
                />
              ) : null}
              <CustomAvatar
                skin='light'
                variant='rounded'
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  bgcolor: alpha(GOOGLE_BLUE, 0.12),
                  color: GOOGLE_BLUE,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  zIndex: 1
                }}
              >
                <i className={step.icon} style={{ fontSize: '1.1rem' }} />
              </CustomAvatar>
              <Box sx={{ pb: index < steps.length - 1 ? 4 : 0, pt: 0.5 }}>
                <Typography variant='subtitle2' fontWeight={700}>
                  {step.title}
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                  {step.description}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>

        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.success.main, 0.04)
          }}
        >
          <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2 }}>
            <i className='tabler-shield-check' style={{ fontSize: '1.25rem', color: theme.palette.success.main }} />
            <Typography variant='subtitle2' fontWeight={700}>
              {t('permissionsTitle')}
            </Typography>
          </Stack>
          <Stack spacing={1.5}>
            {permissions.map(permission => (
              <Stack key={permission} direction='row' spacing={1.5} alignItems='flex-start'>
                <i
                  className='tabler-circle-check-filled'
                  style={{ fontSize: '1rem', color: theme.palette.success.main, marginTop: 3, flexShrink: 0 }}
                />
                <Typography variant='body2' color='text.secondary'>
                  {permission}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
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
          <i className='tabler-lock' style={{ fontSize: '1rem', color: theme.palette.text.secondary }} />
          <Typography variant='caption' color='text.secondary'>
            {t('secure')}
          </Typography>
        </Stack>
        <Stack direction='row' spacing={2}>
          <Button onClick={onClose} variant='outlined' color='secondary' disabled={loading}>
            {tc('common.cancel')}
          </Button>
          <Button
            onClick={onConnect}
            variant='contained'
            disabled={loading}
            startIcon={
              loading
                ? <CircularProgress size={18} color='inherit' />
                : <i className='tabler-brand-google' />
            }
            sx={{
              fontWeight: 600,
              bgcolor: GOOGLE_BLUE,
              '&:hover': { bgcolor: alpha(GOOGLE_BLUE, 0.88) }
            }}
          >
            {t('connectBtn')}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  )
}

export default ConnectGoogleModal
