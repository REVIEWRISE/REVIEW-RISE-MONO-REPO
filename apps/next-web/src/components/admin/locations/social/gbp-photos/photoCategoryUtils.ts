import { GbpPhotoCategory } from '@platform/contracts';
import { PHOTO_CATEGORIES } from './PhotosFilterToolbar';

export const getCategoryLabelKey = (category: string | null | undefined): string => {
    if (!category) return 'uncategorized';

    const config = PHOTO_CATEGORIES.find((item) => item.value === category);

    return config?.labelKey ?? 'additional';
};

export const getCategoryColor = (category: string | null | undefined, theme: any): string => {
    switch (category) {
        case GbpPhotoCategory.INTERIOR: return theme.palette.info.main;
        case GbpPhotoCategory.COVER: return theme.palette.secondary.main;
        case GbpPhotoCategory.FOOD_AND_DRINK: return theme.palette.warning.main;
        case GbpPhotoCategory.TEAMS: return theme.palette.success.main;
        case GbpPhotoCategory.EXTERIOR: return theme.palette.error.main;
        case GbpPhotoCategory.PROFILE: return theme.palette.primary.main;
        case GbpPhotoCategory.LOGO: return theme.palette.info.dark;
        case GbpPhotoCategory.PRODUCT: return theme.palette.success.light;
        case GbpPhotoCategory.AT_WORK: return theme.palette.secondary.light;
        case GbpPhotoCategory.MENU: return theme.palette.warning.dark;
        case GbpPhotoCategory.COMMON_AREA: return theme.palette.secondary.dark;
        case GbpPhotoCategory.ROOMS: return theme.palette.info.light;
        case GbpPhotoCategory.ADDITIONAL: return theme.palette.grey[600];
        default: return theme.palette.text.secondary;
    }
};

export const matchesPhotoSearch = (
    photo: { category?: string | null },
    search: string,
    getLabel: (category: string | null | undefined) => string
): boolean => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    const label = getLabel(photo.category ?? null).toLowerCase();
    const rawCategory = (photo.category ?? '').toLowerCase();

    return label.includes(query) || rawCategory.includes(query);
};

export const sortPhotos = <T extends { createTime?: string | Date | null }>(
    photos: T[],
    sort: 'Newest' | 'Oldest'
): T[] => {
    const sorted = [...photos];

    sorted.sort((a, b) => {
        const aTime = a.createTime ? new Date(a.createTime).getTime() : 0;
        const bTime = b.createTime ? new Date(b.createTime).getTime() : 0;

        return sort === 'Oldest' ? aTime - bTime : bTime - aTime;
    });

    return sorted;
};
