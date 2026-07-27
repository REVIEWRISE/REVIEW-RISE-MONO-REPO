export type NormalizedGbpProfile = {
    source: 'google_business_profile';
    locationName: string | null;
    locationTitle: string | null;
    description: string | null;
    category: string | null;
    phone: string | null;
    website: string | null;
    address: {
        addressLines: string[];
        locality: string | null;
        administrativeArea: string | null;
        postalCode: string | null;
        countryCode: string | null;
        formatted: string | null;
    };
    hours: {
        periods: Array<{
            openDay: string | null;
            openTime: string | null;
            closeDay: string | null;
            closeTime: string | null;
        }>;
        weekdayDescriptions: string[];
    };
};

export type SnapshotCaptureType = 'sync' | 'manual';

export type SnapshotListItem = {
    id: string;
    captureType: string;
    changedFields: string[];
    auditLogId: string | null;
    suggestionRefs: any;
    capturedAt: Date;
    diffBaseSnapshotId: string | null;
};

export type SnapshotDetail = SnapshotListItem & {
    snapshot: any;
};

const DAYS_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_LABELS: Record<string, string> = {
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday',
    SUNDAY: 'Sunday'
};

const formatHoursMinutes = (hours: number, minutes: number): string => {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinutes = String(minutes).padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
};

const formatTime = (time: any): string => {
    if (!time) return '';
    if (typeof time === 'string') {
        const parts = time.split(':');
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1] || '0', 10);
        return formatHoursMinutes(hours, minutes);
    }
    if (typeof time === 'object' && typeof time.hours === 'number') {
        return formatHoursMinutes(time.hours, time.minutes || 0);
    }
    return '';
};

export const normalizeGbpProfile = (raw: any): NormalizedGbpProfile => {
    const address = raw?.storefrontAddress || {};
    const addressLines = Array.isArray(address?.addressLines) ? address.addressLines.filter(Boolean) : [];
    const locality = address?.locality || null;
    const administrativeArea = address?.administrativeArea || null;
    const postalCode = address?.postalCode || null;
    const countryCode = address?.regionCode || null;
    const formattedAddress = [addressLines.join(', '), locality, administrativeArea, postalCode, countryCode]
        .filter(Boolean)
        .join(', ') || null;

    const periods = Array.isArray(raw?.regularHours?.periods) ? raw.regularHours.periods : [];
    const normalizedPeriods = periods.map((period: any) => ({
        openDay: period?.openDay || null,
        openTime: period?.openTime || null,
        closeDay: period?.closeDay || null,
        closeTime: period?.closeTime || null
    }));

    let weekdayDescriptions = Array.isArray(raw?.regularHours?.weekdayDescriptions)
        ? raw.regularHours.weekdayDescriptions
        : [];

    if (weekdayDescriptions.length === 0 && normalizedPeriods.length > 0) {
        const periodsByDay: Record<string, typeof normalizedPeriods> = {};
        for (const p of normalizedPeriods) {
            if (p.openDay) {
                if (!periodsByDay[p.openDay]) {
                    periodsByDay[p.openDay] = [];
                }
                periodsByDay[p.openDay].push(p);
            }
        }

        weekdayDescriptions = DAYS_ORDER.map(day => {
            const dayLabel = DAY_LABELS[day];
            const dayPeriods = periodsByDay[day];
            if (!dayPeriods || dayPeriods.length === 0) {
                return `${dayLabel}: Closed`;
            }
            const timeStrings = dayPeriods.map((p: (typeof normalizedPeriods)[number]) => {
                const open = formatTime(p.openTime);
                const close = formatTime(p.closeTime);
                return `${open} – ${close}`;
            });
            return `${dayLabel}: ${timeStrings.join(', ')}`;
        });
    }

    return {
        source: 'google_business_profile',
        locationName: raw?.name || null,
        locationTitle: raw?.title || null,
        description: raw?.profile?.description || null,
        category: raw?.categories?.primaryCategory?.displayName || raw?.primaryCategory?.displayName || null,
        phone: raw?.phoneNumbers?.primaryPhone || raw?.phoneNumbers?.additionalPhones?.[0] || null,
        website: raw?.websiteUri || null,
        address: {
            addressLines,
            locality,
            administrativeArea,
            postalCode,
            countryCode,
            formatted: formattedAddress
        },
        hours: {
            periods: normalizedPeriods,
            weekdayDescriptions
        }
    };
};
