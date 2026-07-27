/* eslint-disable react/jsx-no-literals */
/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState , useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'

import { useSystemMessages } from '@/shared/components/SystemMessageProvider'
import { SystemMessageCode } from '@platform/contracts'
import { useTranslation } from '@/hooks/useTranslation'
import { changePassword, getUserSessions, revokeSession, setup2FA } from '@/app/actions/profile'
import CustomTextField from '@core/components/mui/TextField'
import { formatRelativeTime } from '@/utils/dateHelper'

const SecurityTab = () => {
    const t = useTranslation('dashboard')
    const { notify } = useSystemMessages()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [sessions, setSessions] = useState<any[]>([])
    const [isLoadingSessions, setIsLoadingSessions] = useState(false)
    const [isSettingUp2FA, setIsSettingUp2FA] = useState(false)

    // Modal States
    const [is2FADialogOpen, setIs2FADialogOpen] = useState(false)
    const [twoFaStep, setTwoFaStep] = useState(0)
    const [twoFaSecret, setTwoFaSecret] = useState('')
    const [twoFaCode, setTwoFaCode] = useState('')

    const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false)
    const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null)
    const [isRevokeAllDialogOpen, setIsRevokeAllDialogOpen] = useState(false)

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [isPasswordShown, setIsPasswordShown] = useState<Record<string, boolean>>({
        current: false,
        new: false,
        confirm: false
    })

    const handleFormChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value })
    }

    const togglePasswordVisibility = (field: string) => {
        setIsPasswordShown({ ...isPasswordShown, [field]: !isPasswordShown[field] })
    }

    const fetchSessions = async () => {
        setIsLoadingSessions(true)
        const result = await getUserSessions()

        setIsLoadingSessions(false)

        if (result.success) {
            setSessions(result.data || [])
        }
    }

    useEffect(() => {
        fetchSessions()
    }, [])

    const confirmRevokeSession = async () => {
        if (!sessionToRevoke) return;
        const result = await revokeSession(sessionToRevoke)

        if (result.success) {
            notify(SystemMessageCode.ITEM_DELETED)
            fetchSessions()
            setIsRevokeDialogOpen(false)
        } else {
            notify(SystemMessageCode.GENERIC_ERROR)
        }
    }

    const confirmRevokeAllSessions = async () => {
        const others = sessions.filter((_, idx) => idx > 0);

        for (const s of others) {
            await revokeSession(s.id);
        }

        notify(SystemMessageCode.ITEM_DELETED)
        fetchSessions()
        setIsRevokeAllDialogOpen(false)
    }

    const handleStart2FA = async () => {
        setIsSettingUp2FA(true)
        const result = await setup2FA()

        setIsSettingUp2FA(false)

        if (result.success) {
            setTwoFaSecret(result.data.secret)
            setIs2FADialogOpen(true)
            setTwoFaStep(0)
            setTwoFaCode('')
        } else {
            notify(SystemMessageCode.GENERIC_ERROR)
        }
    }

    const verifyAndEnable2FA = () => {
        if (twoFaCode.length >= 6) {
            notify(SystemMessageCode.SUCCESS)
            setIs2FADialogOpen(false)

            // Backend enable implementation goes here
        } else {
            notify(SystemMessageCode.VALIDATION_ERROR)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.newPassword !== formData.confirmPassword) {
            notify(SystemMessageCode.VALIDATION_ERROR)

            return
        }

        setIsSubmitting(true)

        const result = await changePassword({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
        })

        setIsSubmitting(false)

        if (result.success) {
            notify(SystemMessageCode.ITEM_UPDATED)
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } else {
            notify(SystemMessageCode.SAVE_FAILED)
        }
    }

    return (
        <Card>
            <CardContent sx={{ pb: 4 }}>
                <Typography variant='h5' sx={{ mb: 6 }}>{t('accounts.profile.security.changePassword')}</Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomTextField
                                fullWidth
                                label={t('accounts.profile.security.currentPassword')}
                                type={isPasswordShown.current ? 'text' : 'password'}
                                value={formData.currentPassword}
                                onChange={e => handleFormChange('currentPassword', e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <IconButton edge='end' onClick={() => togglePasswordVisibility('current')} onMouseDown={e => e.preventDefault()}>
                                                <i className={isPasswordShown.current ? 'tabler-eye' : 'tabler-eye-off'} />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>

                        <Grid size={12} sx={{ mb: 2 }} />

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomTextField
                                fullWidth
                                label={t('accounts.profile.security.newPassword')}
                                type={isPasswordShown.new ? 'text' : 'password'}
                                value={formData.newPassword}
                                onChange={e => handleFormChange('newPassword', e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <IconButton edge='end' onClick={() => togglePasswordVisibility('new')} onMouseDown={e => e.preventDefault()}>
                                                <i className={isPasswordShown.new ? 'tabler-eye' : 'tabler-eye-off'} />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomTextField
                                fullWidth
                                label={t('accounts.profile.security.confirmPassword')}
                                type={isPasswordShown.confirm ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={e => handleFormChange('confirmPassword', e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <IconButton edge='end' onClick={() => togglePasswordVisibility('confirm')} onMouseDown={e => e.preventDefault()}>
                                                <i className={isPasswordShown.confirm ? 'tabler-eye' : 'tabler-eye-off'} />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>

                        <Grid size={12} sx={{ mt: 2 }}>
                            <Typography variant='body2' sx={{ mb: 4, color: 'text.secondary' }}>
                                {t('accounts.profile.security.requirements')}
                                <br />
                                {t('accounts.profile.security.reqMinChars')}
                                <br />
                                {t('accounts.profile.security.reqLowerUpper')}
                                <br />
                                {t('accounts.profile.security.reqNumberSymbol')}
                            </Typography>

                            <Button type='submit' variant='contained' sx={{ mr: 4 }} disabled={isSubmitting}>
                                {isSubmitting ? t('common.status.processing') : t('accounts.profile.security.changePassword')}
                            </Button>
                        </Grid>
                    </Grid>
                </form>

                <Divider sx={{ my: 8 }} />

                <Typography variant='h5' sx={{ mb: 4 }}>Two-Factor Authentication (2FA)</Typography>
                <Grid container spacing={5}>
                    <Grid size={12}>
                        <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 4, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
                            <Box sx={{ p: 3, borderRadius: 1, bgcolor: 'primary.lighter', color: 'primary.main' }}>
                                <i className='tabler-shield-lock' style={{ fontSize: '2rem' }} />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>Authenticator App</Typography>
                                <Typography variant='body2' color='text.secondary'>
                                    Use an authenticator app (e.g. Google Authenticator, Authy) to get verification codes.
                                </Typography>
                            </Box>
                            <Button variant='contained' onClick={handleStart2FA} disabled={isSettingUp2FA}>
                                {isSettingUp2FA ? 'Setting Up...' : 'Set Up 2FA'}
                            </Button>
                        </Box>
                    </Grid>

                    <Grid size={12}>
                        <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 4, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper', mt: 4 }}>
                            <Box sx={{ p: 3, borderRadius: 1, bgcolor: 'secondary.lighter', color: 'secondary.main' }}>
                                <i className='tabler-file-code' style={{ fontSize: '2rem' }} />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>Recovery Codes</Typography>
                                <Typography variant='body2' color='text.secondary'>
                                    Recovery codes can be used to access your account if you lose your phone.
                                </Typography>
                            </Box>
                            <Button variant='tonal' color='secondary' disabled>Manage</Button>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 8 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                    <Box>
                        <Typography variant='h5'>Recent Devices & Sessions</Typography>
                        <Typography variant='body2' color='text.secondary'>
                            Review the devices that have accessed your account recently.
                        </Typography>
                    </Box>
                    {sessions.length > 1 && (
                        <Button color='error' variant='tonal' onClick={() => setIsRevokeAllDialogOpen(true)}>
                            Revoke All Other Sessions
                        </Button>
                    )}
                </Box>

                <TableContainer component={Paper} variant='outlined'>
                    <Table size='small'>
                        <TableHead sx={{ bgcolor: 'action.hover' }}>
                            <TableRow>
                                <TableCell>BROWSER / DEVICE</TableCell>
                                <TableCell>LOCATION</TableCell>
                                <TableCell>RECENT ACTIVITY</TableCell>
                                <TableCell align='right'>STATUS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sessions.length > 0 ? sessions.map((session, index) => (
                                <TableRow key={session.id || index}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <i className={session.device?.includes('iPhone') ? 'tabler-device-mobile' : 'tabler-brand-windows'} style={{ fontSize: '1.2rem', color: 'text.secondary' }} />
                                            <Typography variant='body2' sx={{ fontWeight: 500 }}>{session.device}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell><Typography variant='body2'>{session.location}</Typography></TableCell>
                                    <TableCell>
                                        <Typography variant='body2'>
                                            {formatRelativeTime(new Date(session.expires))}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align='right'>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                                            <Chip
                                                label={index === 0 ? 'Current Session' : 'Active'}
                                                color={index === 0 ? 'success' : 'default'}
                                                size='small'
                                                variant='tonal'
                                            />
                                            {index > 0 && (
                                                <IconButton size='small' color='error' onClick={() => {
                                                    setSessionToRevoke(session.id);
                                                    setIsRevokeDialogOpen(true);
                                                }}>
                                                    <i className='tabler-logout' style={{ fontSize: '1.1rem' }} />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} align='center' sx={{ py: 4 }}>
                                        {isLoadingSessions ? 'Loading sessions...' : 'No other active sessions found.'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>

            {/* 2FA Enrollment Dialog */}
            <Dialog open={is2FADialogOpen} onClose={() => setIs2FADialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
                <DialogContent>
                    <Stepper activeStep={twoFaStep} sx={{ mb: 6, mt: 2 }}>
                        <Step><StepLabel>Scan QR Code</StepLabel></Step>
                        <Step><StepLabel>Verify Code</StepLabel></Step>
                    </Stepper>

                    {twoFaStep === 0 && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body1" sx={{ mb: 4 }}>
                                Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy):
                            </Typography>
                            <Box sx={{ p: 4, bgcolor: 'background.default', display: 'inline-flex', borderRadius: 2, mb: 4, height: 200, width: 200, alignItems: 'center', justifyContent: 'center', border: '1px solid', borderColor: 'divider' }}>
                                <i className="tabler-qrcode" style={{ fontSize: '8rem', color: 'var(--mui-palette-text-primary)' }} />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Or manually enter this secret:
                            </Typography>
                            <Typography variant="subtitle2" sx={{ letterSpacing: 2, mt: 1, fontFamily: 'monospace' }}>
                                {twoFaSecret || 'GENERATING...'}
                            </Typography>
                        </Box>
                    )}

                    {twoFaStep === 1 && (
                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <Typography variant="body1" sx={{ mb: 4 }}>
                                Enter the 6-digit verification code generated by your app:
                            </Typography>
                            <CustomTextField
                                fullWidth
                                label="Verification Code"
                                placeholder="123456"
                                value={twoFaCode}
                                onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                                sx={{ maxWidth: 300, mx: 'auto', display: 'block' }}
                                inputProps={{ style: { textAlign: 'center', letterSpacing: 4, fontSize: '1.2rem' } }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ pb: 3, px: 3 }}>
                    <Button onClick={() => setIs2FADialogOpen(false)}>Cancel</Button>
                    {twoFaStep === 0 ? (
                        <Button variant="contained" onClick={() => setTwoFaStep(1)}>Next</Button>
                    ) : (
                        <Button variant="contained" onClick={verifyAndEnable2FA} disabled={twoFaCode.length < 6}>Verify & Enable</Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Revoke Individual Session Dialog */}
            <Dialog open={isRevokeDialogOpen} onClose={() => setIsRevokeDialogOpen(false)}>
                <DialogTitle>Revoke Session</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to revoke this session? The device will be immediately logged out.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsRevokeDialogOpen(false)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={confirmRevokeSession}>Confirm</Button>
                </DialogActions>
            </Dialog>

            {/* Revoke All Other Sessions Dialog */}
            <Dialog open={isRevokeAllDialogOpen} onClose={() => setIsRevokeAllDialogOpen(false)}>
                <DialogTitle>Revoke All Other Sessions</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to log out of all other devices? This action will invalidate all active sessions except the one you are currently using.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsRevokeAllDialogOpen(false)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={confirmRevokeAllSessions}>Log Out All Devices</Button>
                </DialogActions>
            </Dialog>
        </Card>
    )
}

export default SecurityTab
