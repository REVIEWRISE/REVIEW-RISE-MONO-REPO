/* eslint-disable react/jsx-no-literals */
/* eslint-disable react/no-unescaped-entities */
'use client'
/* eslint-disable react/jsx-no-literals */

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

import { useTranslation } from '@/hooks/useTranslation'
import CustomTextField from '@core/components/mui/TextField'
import { useSettings } from '@core/hooks/useSettings'
import type { Mode } from '@core/types'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import ListItemIcon from '@mui/material/ListItemIcon'

const PreferencesTab = () => {
    const t = useTranslation('dashboard')
    const tc = useTranslation('common')
    const { settings, updateSettings } = useSettings()

    const handleModeChange = (mode: Mode) => {
        updateSettings({ mode })
    }

    return (
        <Card>
            <CardContent sx={{ pb: 4 }}>
                <Typography variant='h5' sx={{ mb: 6 }}>{t('accounts.profile.preferences.localization')}</Typography>

                <Grid container spacing={5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextField
                            select
                            fullWidth
                            label={t('accounts.profile.preferences.language')}
                            defaultValue='english'
                        >
                            <MenuItem value='english'>{tc('language.english')}</MenuItem>
                            <MenuItem value='arabic'>{tc('language.arabic')}</MenuItem>
                            <MenuItem value='french'>{tc('language.french')}</MenuItem>
                            <MenuItem value='german'>{tc('language.german')}</MenuItem>
                            <MenuItem value='portuguese'>{tc('language.portuguese')}</MenuItem>
                        </CustomTextField>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomTextField
                            select
                            fullWidth
                            label={t('accounts.profile.preferences.timezone')}
                            defaultValue='gmt-4'
                        >
                            <MenuItem value='gmt-12'>{t('accounts.profile.timezones.gmt-12')}</MenuItem>
                            <MenuItem value='gmt-11'>{t('accounts.profile.timezones.gmt-11')}</MenuItem>
                            <MenuItem value='gmt-10'>{t('accounts.profile.timezones.gmt-10')}</MenuItem>
                            <MenuItem value='gmt-9'>{t('accounts.profile.timezones.gmt-9')}</MenuItem>
                            <MenuItem value='gmt-8'>{t('accounts.profile.timezones.gmt-8')}</MenuItem>
                            <MenuItem value='gmt-7'>{t('accounts.profile.timezones.gmt-7')}</MenuItem>
                            <MenuItem value='gmt-6'>{t('accounts.profile.timezones.gmt-6')}</MenuItem>
                            <MenuItem value='gmt-5'>{t('accounts.profile.timezones.gmt-5')}</MenuItem>
                            <MenuItem value='gmt-4'>{t('accounts.profile.timezones.gmt-4')}</MenuItem>
                            <MenuItem value='gmt-l'>{t('accounts.profile.timezones.gmt-l')}</MenuItem>
                            <MenuItem value='gmt+1'>{t('accounts.profile.timezones.gmt+1')}</MenuItem>
                            <MenuItem value='gmt+2'>{t('accounts.profile.timezones.gmt+2')}</MenuItem>
                            <MenuItem value='gmt+3'>{t('accounts.profile.timezones.gmt+3')}</MenuItem>
                            <MenuItem value='gmt+4'>{t('accounts.profile.timezones.gmt+4')}</MenuItem>
                        </CustomTextField>

                        <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                            {t('accounts.profile.preferences.timezoneDesc')}
                        </Typography>
                    </Grid>

                    <Grid size={12}>
                        <Divider sx={{ my: 4 }} />
                        <Typography variant='h5' sx={{ mb: 4 }}>System Theme</Typography>
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <CustomTextField
                                    select
                                    fullWidth
                                    label="Mode"
                                    value={settings.mode}
                                    onChange={e => handleModeChange(e.target.value as Mode)}
                                >
                                    <MenuItem value='system'>System Default</MenuItem>
                                    <MenuItem value='light'>Light Mode</MenuItem>
                                    <MenuItem value='dark'>Dark Mode</MenuItem>
                                </CustomTextField>
                                <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                                    Choose how ReviewRise looks to you.
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid size={12}>
                        <Divider sx={{ my: 4 }} />
                        <Typography variant='h5' sx={{ mb: 4 }}>{t('accounts.profile.preferences.notifications')}</Typography>

                        <Typography variant='body2' sx={{ mb: 4, color: 'text.secondary' }}>
                            {t('accounts.profile.preferences.notificationsDesc')}
                        </Typography>

                        <List disablePadding>
                            {[
                                { id: 'new-review', icon: 'tabler-message-star', color: 'warning', title: 'New Review Alerts', desc: 'Get notified as soon as a customer leaves a review.', default: true },
                                { id: 'weekly-report', icon: 'tabler-chart-pie', color: 'info', title: 'Weekly Insights Report', desc: 'A summary of your brand performance every Monday.', default: true },
                                { id: 'system-alert', icon: 'tabler-shield-lock', color: 'error', title: 'Security & System Alerts', desc: 'Important updates regarding your account and data.', default: true },
                                { id: 'marketing', icon: 'tabler-rocket', color: 'primary', title: 'Marketing & New Features', desc: 'Learn about new AI tools and product updates.', default: false }
                            ].map((item, index) => (
                                <ListItem key={item.id} divider={index !== 3} sx={{ px: 0, py: 4 }}>
                                    <ListItemIcon sx={{ mr: 4 }}>
                                        <Box sx={{ p: 2, borderRadius: 1, bgcolor: `${item.color}.lighter`, color: `${item.color}.main`, display: 'flex' }}>
                                            <i className={item.icon} style={{ fontSize: '1.5rem' }} />
                                        </Box>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.title}
                                        secondary={item.desc}
                                        primaryTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                                        secondaryTypographyProps={{ variant: 'body2' }}
                                    />
                                    <ListItemSecondaryAction sx={{ position: 'static', transform: 'none', mt: { xs: 2, sm: 0 }, ml: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 4 }}>
                                            <FormControlLabel
                                                control={<Switch defaultChecked={item.default} size='small' color={item.color as any} />}
                                                label="Email"
                                                labelPlacement="start"
                                                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem', color: 'text.secondary' } }}
                                            />
                                            <FormControlLabel
                                                control={<Switch defaultChecked={item.default} size='small' color={item.color as any} />}
                                                label="App"
                                                labelPlacement="start"
                                                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem', color: 'text.secondary' } }}
                                            />
                                        </Box>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>

                        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                            <Button variant='tonal' color='secondary' onClick={() => { }}>
                                Reset to Default
                            </Button>
                            <Button variant='contained' onClick={() => { }}>
                                {t('accounts.profile.preferences.savePreferences')}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default PreferencesTab
