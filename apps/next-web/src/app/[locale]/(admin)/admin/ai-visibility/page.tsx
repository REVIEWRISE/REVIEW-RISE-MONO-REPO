'use client'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

import { useTranslations } from 'next-intl'
import { PageHeader } from '@platform/shared-ui/client'

const AdminAIVisibilityPage = () => {
  const tDashboard = useTranslations('dashboard')
  const tCommon = useTranslations('common')

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <PageHeader
          title={tDashboard('navigation.ai-visibility')}
          subtitle={tCommon('app.description')}
        />
        <Box sx={{ mt: 4 }}>
          <Typography variant='body1'>
            Coming soon: AI-powered visibility insights and diagnostics.
          </Typography>
        </Box>
      </Grid>
    </Grid>
  )
}

export default AdminAIVisibilityPage
