'use client';

import { getGbpPhotoProxyUrl, useGbpPhotos, useDeleteGbpPhoto, extractApiErrorMessage } from '@/hooks/gbp/useGbpPhotos';
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { SystemMessageSeverity } from '@platform/contracts';

import { PhotosFilterToolbar } from './PhotosFilterToolbar';
import { getCategoryColor, getCategoryLabelKey, matchesPhotoSearch, sortPhotos } from './photoCategoryUtils';
import { useSystemMessages } from '@/shared/components/SystemMessageProvider';

// Icons
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import LinkIcon from '@mui/icons-material/Link';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import StarIcon from '@mui/icons-material/Star';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface LocationPhotosGridProps {
  locationId: string;
}

const MOCK_DATA = {
  dimensions: '1920 × 1080 px',
  fileSize: '2.4 MB',
  score: '92',
  engagement: '88'
};

const CategoryPill = ({ category }: { category: string | null | undefined }) => {
  const t = useTranslations('gbpRocket.photos');
  const theme = useTheme();
  const color = getCategoryColor(category, theme);
  const labelKey = getCategoryLabelKey(category);

  return (
    <Box
      sx={{
        bgcolor: color,
        color: '#fff',
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.5,
        textTransform: 'uppercase'
      }}
    >
      {t(`filter.${labelKey}`)}
    </Box>
  );
};

export const LocationPhotosGrid = ({ locationId }: LocationPhotosGridProps) => {
  const t = useTranslations('gbpRocket.photos');
  const theme = useTheme();
  const { notify } = useSystemMessages();
  const [category, setCategory] = useState<string>('All');
  const [sort, setSort] = useState<'Newest' | 'Oldest'>('Newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [take, setTake] = useState(12);

  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);

  const { data: result, isLoading, isError, error } = useGbpPhotos(locationId, {
    category: category === 'All' ? undefined : category,
    skip: 0,
    take,
  });

  const { mutate: deletePhoto, isPending: isDeleting } = useDeleteGbpPhoto();

  const getCategoryLabel = (value: string | null | undefined) => t(`filter.${getCategoryLabelKey(value)}`);

  const photos = useMemo(() => {
    const rawPhotos = result?.data || [];
    const searched = rawPhotos.filter((photo) => matchesPhotoSearch(photo, search, getCategoryLabel));

    return sortPhotos(searched, sort);
  }, [result?.data, search, sort, t]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = result?.meta?.total ?? photos.length;
  const profileUrl = result?.meta?.profileUrl || 'https://business.google.com/locations';
  const hasMore = photos.length < total;

  if (isLoading) {
    return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
  }

  if (isError) {
    return <Typography color="error">{t('grid.errorLoading')} {(error as Error).message}</Typography>;
  }

  return (
    <Box>
      {/* Filter Toolbar */}
      <PhotosFilterToolbar
        category={category}
        onCategoryChange={(value) => {
          setCategory(value);
          setTake(12);
        }}
        sort={sort}
        onSortChange={(value) => setSort(value as 'Newest' | 'Oldest')}
        view={view}
        onViewChange={setView}
        search={search}
        onSearchChange={setSearch}
      />

      {category !== 'All' && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('grid.showingCategory', { category: getCategoryLabel(category), count: photos.length, total })}
        </Typography>
      )}

      {/* Grid / List */}
      {photos.length === 0 ? (
        <Box textAlign="center" p={4} bgcolor="background.paper" borderRadius={2} border="1px dashed" borderColor="divider">
          <Typography color="text.secondary">{t('grid.noPhotosFound')}</Typography>
        </Box>
      ) : view === 'list' ? (
        <Stack spacing={2}>
          {photos.map((photo: any) => {
            const daysAgo = photo.updateTime
              ? Math.max(1, Math.floor((new Date().getTime() - new Date(photo.updateTime).getTime()) / (1000 * 3600 * 24)))
              : photo.createTime
                ? Math.max(1, Math.floor((new Date().getTime() - new Date(photo.createTime).getTime()) / (1000 * 3600 * 24)))
                : 1;

            return (
              <Card
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  cursor: 'pointer',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <Box sx={{ width: { xs: '100%', sm: 180 }, height: { xs: 180, sm: 120 }, flexShrink: 0, bgcolor: 'action.hover' }}>
                  <CardMedia
                    component="img"
                    loading="lazy"
                    image={getGbpPhotoProxyUrl(locationId, photo.id)}
                    alt={getCategoryLabel(photo.category)}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
                <CardContent sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                    <CategoryPill category={photo.category} />
                    <Typography variant="body2" fontWeight={600}>{getCategoryLabel(photo.category)}</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {t('grid.updatedDaysAgo', { days: daysAgo })}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Grid container spacing={3}>
          {photos.map((photo: any) => {
            const daysAgo = photo.updateTime
              ? Math.max(1, Math.floor((new Date().getTime() - new Date(photo.updateTime).getTime()) / (1000 * 3600 * 24)))
              : photo.createTime
                ? Math.max(1, Math.floor((new Date().getTime() - new Date(photo.createTime).getTime()) / (1000 * 3600 * 24)))
                : 1;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={photo.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'transform 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: 'primary.main'
                    }
                  }}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <Box position="relative" sx={{ paddingTop: '75%', bgcolor: 'action.hover' }}>
                    <CardMedia
                      component="img"
                      loading="lazy"
                      image={getGbpPhotoProxyUrl(locationId, photo.id)}
                      alt={photo.category || 'Location Photo'}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />

                    <Box position="absolute" top={12} left={12}>
                      <CategoryPill category={photo.category} />
                    </Box>

                    <Box position="absolute" top={8} right={8}>
                      <IconButton
                        size="small"
                        sx={{ bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                        onClick={(e) => { e.stopPropagation(); /* menu logic */ }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: '16px !important', bgcolor: 'background.paper' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                      <Typography variant="body2" fontWeight={600}>
                        {getCategoryLabel(photo.category)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('grid.updatedDaysAgo', { days: daysAgo })}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Load More Button */}
      {hasMore && (
        <Box textAlign="center" mt={6}>
          <Button
            variant="outlined"
            color="inherit"
            sx={{ px: 4, py: 1, borderRadius: 2 }}
            onClick={() => setTake((current) => current + 12)}
          >
            {t('grid.loadMore')}
          </Button>
        </Box>
      )}

      {/* Photo Details Sidebar */}
      <Drawer
        anchor="right"
        open={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 450 },
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderLeft: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {selectedPhoto && (
          <Box sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Drawer Header */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <CategoryPill category={selectedPhoto.category} />
                <Typography variant="caption" color="text.secondary">#{selectedPhoto.id.substring(0, 8).toUpperCase()}</Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <ShareOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <DownloadOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => setSelectedPhoto(null)} sx={{ color: 'text.secondary' }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>

            {/* Large Image */}
            <Box sx={{ px: 3, mb: 3 }}>
              <Box
                sx={{
                  width: '100%',
                  paddingTop: '60%',
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <CardMedia
                  component="img"
                  loading="lazy"
                  image={getGbpPhotoProxyUrl(locationId, selectedPhoto.id)}
                  alt="Selected Photo"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    bgcolor: 'background.default',
                  }}
                />
              </Box>
            </Box>

            {/* Details List */}
            <Box sx={{ px: 3, flex: 1, overflowY: 'auto' }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('details.title')}</Typography>

              <List disablePadding>
                <ListItem disableGutters sx={{ py: 1.5 }}>
                  <ListItemText primary={t('details.category')} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} />
                  <CategoryPill category={selectedPhoto.category} />
                </ListItem>
                <ListItem disableGutters sx={{ py: 1.5 }}>
                  <ListItemText primary={t('details.createdDate')} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight={500}>
                    {selectedPhoto.createTime ? new Date(selectedPhoto.createTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : t('details.unknown')}
                  </Typography>
                </ListItem>
                <ListItem disableGutters sx={{ py: 1.5 }}>
                  <ListItemText primary={t('details.updatedDate')} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight={500}>
                    {selectedPhoto.updateTime ? new Date(selectedPhoto.updateTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : t('details.unknown')}
                  </Typography>
                </ListItem>
                <ListItem disableGutters sx={{ py: 1.5 }}>
                  <ListItemText primary={t('details.source')} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight={500}>{t('details.gbp')}</Typography>
                </ListItem>
                <ListItem disableGutters sx={{ py: 1.5 }}>
                  <ListItemText primary={t('details.dimensions')} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight={500}>{MOCK_DATA.dimensions}</Typography>
                </ListItem>
                <ListItem disableGutters sx={{ py: 1.5 }}>
                  <ListItemText primary={t('details.fileSize')} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight={500}>{MOCK_DATA.fileSize}</Typography>
                </ListItem>
              </List>

              {/* Link out */}
              <Button
                fullWidth
                variant="outlined"
                color="info"
                startIcon={<LinkIcon />}
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mt: 2, mb: 4, borderRadius: 1.5, textTransform: 'none', py: 1 }}
              >
                {t('details.viewOnGbp')}
              </Button>

              {/* AI Insights (Mocked as per the UI) */}
              <Box sx={{ textAlign: 'right', mb: 1 }}>
                <Box component="span" sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.2), color: 'secondary.main', px: 1.5, py: 0.5, borderRadius: 1, fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 14 }} /> {t('details.aiPowered')}
                </Box>
              </Box>

              <Stack direction="row" spacing={2} mb={3}>
                <Box
                  sx={{
                    flex: 1,
                    bgcolor: alpha(theme.palette.success.main, 0.08),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.success.main, 0.2),
                    borderRadius: 2,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h3" fontWeight={700} color="success.main">{MOCK_DATA.score}</Typography>
                    <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                  </Box>
                  <Box sx={{ width: '100%', height: 4, bgcolor: 'success.main', borderRadius: 2 }} />
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    bgcolor: alpha(theme.palette.success.main, 0.08),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.success.main, 0.2),
                    borderRadius: 2,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h3" fontWeight={700} color="success.main">{MOCK_DATA.engagement}</Typography>
                    <AccessTimeFilledIcon sx={{ color: 'success.main', fontSize: 20 }} />
                  </Box>
                  <Box sx={{ width: '100%', height: 4, bgcolor: 'success.main', borderRadius: 2 }} />
                </Box>
              </Stack>

              <Stack spacing={1} mb={4}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: alpha(theme.palette.success.main, 0.2), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
                  </Box>
                  <Typography variant="body2" color="success.main">{t('details.highQualityComposition')}</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: alpha(theme.palette.success.main, 0.2), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
                  </Box>
                  <Typography variant="body2" color="success.main">{t('details.goodLighting')}</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: alpha(theme.palette.warning.main, 0.2), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <WarningAmberIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                  </Box>
                  <Typography variant="body2" color="warning.main">{t('details.containsText')}</Typography>
                </Stack>
              </Stack>

              {/* Actions */}
              <Stack spacing={2} pb={3}>
                <Button fullWidth variant="contained" color="secondary" sx={{ py: 1.5, borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 18, mr: 1 }} /> {t('details.analyzeAgain')}
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  startIcon={<LinkIcon />}
                  href={selectedPhoto.googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  disabled={!selectedPhoto.googleUrl}
                  sx={{ py: 1.5, borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                >
                  {t('details.viewOnGoogle')}
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={isDeleting}
                  onClick={() => {
                    if (!window.confirm(t('details.deletePhotoConfirm'))) return;
                    deletePhoto(
                      { locationId, photoId: selectedPhoto.id },
                      {
                        onSuccess: () => {
                          notify({
                            messageCode: t('deleteSuccess'),
                            severity: SystemMessageSeverity.SUCCESS,
                          });
                          setSelectedPhoto(null);
                        },
                        onError: (deleteError) => {
                          notify({
                            messageCode: extractApiErrorMessage(deleteError) || t('deleteError'),
                            severity: SystemMessageSeverity.ERROR,
                          });
                        },
                      }
                    );
                  }}
                  sx={{ py: 1.5, borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: alpha(theme.palette.error.main, 0.2), color: 'error.main', '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.3) } }}
                >
                  {isDeleting ? <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} /> : <DeleteOutlineIcon sx={{ mr: 1, fontSize: 18 }} />} {t('details.deletePhoto')}
                </Button>
              </Stack>
            </Box>

          </Box>
        )}
      </Drawer>
    </Box>
  );
};
