'use client'

import React from 'react'

import { Card, CardContent, Typography, Box, IconButton, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { useTranslations } from 'next-intl'
import { type GenerationItem } from '@/services/studio.service'

interface RecentGenerationsProps {
    generations: GenerationItem[]
}

export default function RecentGenerations({ generations }: RecentGenerationsProps) {
    const t = useTranslations('studio')

    const getIcon = (type: string) => {
        switch (type) {
            case 'caption': return 'tabler-brand-instagram'
            case 'image': return 'tabler-photo'
            case 'script': return 'tabler-video'
            case 'carousel': return 'tabler-slideshow'
            default: return 'tabler-file-text'
        }
    }

    const getTimeAgo = (date: string | Date) => {
        const d = new Date(date)
        const now = new Date()
        const diff = Math.floor((now.getTime() - d.getTime()) / 1000)

        if (diff < 60) return 'Just now'
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
        
return `${Math.floor(diff / 86400)}d ago`
    }

    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>{t('dashboard.recentTitle')}</Typography>

                {(!generations || !Array.isArray(generations) || generations.length === 0) ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                        No recent generations yet
                    </Typography>
                ) : (
                    <List disablePadding>
                        {generations.map((gen) => (
                            <ListItem key={gen.id} disableGutters sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                                <ListItemIcon sx={{ minWidth: 48 }}>
                                    <Box sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 1,
                                        bgcolor: 'action.hover',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <i className={getIcon(gen.type)} style={{ fontSize: 20, color: 'inherit' }} />
                                    </Box>
                                </ListItemIcon>
                                <ListItemText
                                    primary={gen.title}
                                    secondary={getTimeAgo(gen.createdAt)}
                                    primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 'bold', color: 'text.primary', noWrap: true }}
                                    secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                                />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton size="small"><i className="tabler-eye" /></IconButton>
                                    <IconButton size="small"><i className="tabler-copy" /></IconButton>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card>
    )
}
