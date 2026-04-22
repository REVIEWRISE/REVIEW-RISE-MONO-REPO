/* eslint-disable react/jsx-no-literals */
/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'

import { useSystemMessages } from '@/shared/components/SystemMessageProvider'
import { SystemMessageCode } from '@platform/contracts'
import { useTranslation } from '@/hooks/useTranslation'

import CustomTextField from '@core/components/mui/TextField'
import { updateProfile, deactivateAccount } from '@/app/actions/profile'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/hooks/usePermissions'
import Chip from '@mui/material/Chip'

interface GeneralTabProps {
    user: any
}

const GeneralTab = ({ user }: GeneralTabProps) => {
    const router = useRouter()
    const t = useTranslation('dashboard')
    const { notify } = useSystemMessages()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.image || null)
    const [isDangerDialogOpen, setIsDangerDialogOpen] = useState(false)
    const [deactivateInput, setDeactivateInput] = useState('')

    const { role: userRole } = usePermissions()

    const [formData, setFormData] = useState({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ').slice(1).join(' ') || '',
        email: user?.email || '',
        jobTitle: user?.jobTitle || ''
    })

    const handleFormChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value })
    }

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]

        if (file) {
            const url = URL.createObjectURL(file)

            setAvatarUrl(url)
            notify(SystemMessageCode.SUCCESS) // Mock success
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        const fullName = `${formData.firstName} ${formData.lastName}`.trim()

        const result = await updateProfile({
            name: fullName,
            email: formData.email,
            jobTitle: formData.jobTitle
        })

        setIsSubmitting(false)

        if (result.success) {
            notify(SystemMessageCode.ITEM_UPDATED)
            router.refresh()
        } else {
            notify(SystemMessageCode.GENERIC_ERROR)
        }
    }

    const handleDeactivate = async () => {
        setIsDangerDialogOpen(false)
        const result = await deactivateAccount()

        if (result.success) {
            notify(SystemMessageCode.SUCCESS)

            // In a real app, sign out the user here
            router.push('/login')
        } else {
            notify(SystemMessageCode.GENERIC_ERROR)
        }
    }

    return (
        <Card>
            <CardContent sx={{ pb: 4 }}>
                <Typography variant='h5' sx={{ mb: 4 }}>{t('accounts.profile.general.title')}</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 6 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            bgcolor: 'action.hover',
                            border: theme => `1px dashed ${theme.palette.divider}`,
                            overflow: 'hidden'
                        }}
                    >
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <i className='tabler-user' style={{ fontSize: '3rem', color: 'text.secondary' }} />
                        )}
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Button component='label' variant='contained'>
                                {t('accounts.profile.general.uploadPhoto')}
                                <input hidden type='file' accept='image/png, image/jpeg' onChange={handlePhotoUpload} />
                            </Button>
                            <Chip
                                label={userRole.toUpperCase()}
                                color={(userRole as string) === 'owner' || (userRole as string) === 'admin' ? 'primary' : 'secondary'}
                                size='small'
                                sx={{ fontWeight: 'bold' }}
                            />
                        </Box>

                        <Typography variant='body2' color='text.secondary'>
                            {t('accounts.profile.general.uploadHint')}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 6 }} />

                <Grid container spacing={5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextField
                            fullWidth
                            label={t('accounts.profile.general.firstName')}
                            placeholder='Jane'
                            value={formData.firstName}
                            onChange={e => handleFormChange('firstName', e.target.value)}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextField
                            fullWidth
                            label={t('accounts.profile.general.lastName')}
                            placeholder='Admin'
                            value={formData.lastName}
                            onChange={e => handleFormChange('lastName', e.target.value)}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextField
                            fullWidth
                            label={t('accounts.profile.general.email')}
                            placeholder='hello@reviewrise.co'
                            value={formData.email}
                            onChange={e => handleFormChange('email', e.target.value)}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextField
                            fullWidth
                            label="Job Title"
                            placeholder='e.g. Marketing Director'
                            value={formData.jobTitle}
                            onChange={e => handleFormChange('jobTitle', e.target.value)}
                        />
                    </Grid>

                    <Grid size={12} sx={{ mt: 2 }}>
                        <Button variant='contained' sx={{ mr: 4 }} onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? t('accounts.profile.general.saving') : t('accounts.profile.general.saveChanges')}
                        </Button>

                        <Button type='reset' variant='tonal' color='secondary' onClick={() => {
                            setFormData({
                                firstName: user?.name?.split(' ')[0] || '',
                                lastName: user?.name?.split(' ').slice(1).join(' ') || '',
                                email: user?.email || '',
                                jobTitle: user?.jobTitle || ''
                            })
                        }}>
                            {t('accounts.profile.general.reset')}
                        </Button>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 8 }} />

                <Box sx={{ p: 4, border: '1px solid', borderColor: 'error.light', borderRadius: 1, bgcolor: 'error.lighter', opacity: 0.8 }}>
                    <Typography variant='h6' color='error.main' sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <i className='tabler-alert-triangle' />
                        Danger Zone
                    </Typography>
                    <Typography variant='body2' color='error.main' sx={{ mb: 4 }}>
                        Once you deactivate your account, there is no going back. Please be certain.
                    </Typography>
                    <Button variant='contained' color='error' onClick={() => setIsDangerDialogOpen(true)}>Deactivate Account</Button>
                </Box>
            </CardContent>

            {/* Danger Zone Dialog */}
            <Dialog open={isDangerDialogOpen} onClose={() => setIsDangerDialogOpen(false)}>
                <DialogTitle sx={{ color: 'error.main' }}>Deactivate Account</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 4 }}>
                        You are about to permanently deactivate your account. To confirm this action, please type <strong>DEACTIVATE</strong> below.
                    </DialogContentText>
                    <CustomTextField
                        fullWidth
                        placeholder="Type DEACTIVATE"
                        value={deactivateInput}
                        onChange={(e) => setDeactivateInput(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ pb: 3, px: 3 }}>
                    <Button onClick={() => {
                        setIsDangerDialogOpen(false);
                        setDeactivateInput('');
                    }}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        disabled={deactivateInput !== 'DEACTIVATE'}
                        onClick={handleDeactivate}
                    >
                        Confirm Deactivation
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    )
}

export default GeneralTab
