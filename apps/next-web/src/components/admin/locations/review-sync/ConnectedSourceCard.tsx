
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import StarIcon from '@mui/icons-material/Star';
import SyncIcon from '@mui/icons-material/Sync';
import { Box, Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

interface ConnectSourceCardProps {
    source: {
        id: string;
        platform: string;
        status: string;
        locationId: string;
    };
    onDisconnect: (id: string) => void;
    onSync?: (source: { id: string; platform: string }) => void | Promise<void>;
    onConfigure?: (id: string) => void;
    syncing?: boolean;
}

const ConnectedSourceCard = ({ source, onDisconnect, onSync, onConfigure, syncing = false }: ConnectSourceCardProps) => {
    const t = useTranslations('locations.ReviewSources');
    const tc = useTranslations('common');
    const platform = source.platform === 'gbp' ? 'google' : source.platform;
    const isGoogle = platform === 'google';
    const isFacebook = platform === 'facebook';
    const Icon = isGoogle ? GoogleIcon : isFacebook ? FacebookIcon : StarIcon;
    const iconColor = isGoogle ? 'info' : isFacebook ? 'primary' : 'error';
    const name = isGoogle
        ? t('googleBusiness')
        : isFacebook
            ? t('facebook')
            : t('yelp');

    return (
        <Card sx={{ mb: 2, border: '1px solid', borderColor: 'success.main', bgcolor: 'background.paper' }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                        <Icon color={iconColor as 'info' | 'primary' | 'error'} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">{name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="success.main">{'●'} {tc('status.active')}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">{t('syncHealthy')}</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {onSync && source.id !== 'google-integration' && (
                        <Button
                            variant="contained"
                            color="warning"
                            size="small"
                            startIcon={syncing ? <CircularProgress size={16} color="inherit" /> : <SyncIcon />}
                            disabled={syncing}
                            onClick={() => onSync(source)}
                        >
                            {syncing ? t('syncing') : t('syncNow')}
                        </Button>
                    )}
                    {onConfigure && (
                        <Button variant="outlined" color="inherit" size="small" onClick={() => onConfigure(source.id)}>
                            {t('configure')}
                        </Button>
                    )}
                    <Button variant="outlined" color="error" size="small" onClick={() => onDisconnect(source.id)}>
                        {t('disconnect')}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ConnectedSourceCard;
