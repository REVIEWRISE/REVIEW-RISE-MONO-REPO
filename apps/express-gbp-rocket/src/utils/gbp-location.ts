/**
 * Google Business Profile location resource names vary by API version.
 * Media/Reviews API (v4) requires: accounts/{accountId}/locations/{locationId}
 * Business Information API (v1) may return only: locations/{locationId}
 */
export function resolveGbpLocationResourceName(
    gbpLocationName: string | null | undefined,
    gbpAccountId?: string | null
): string {
    if (!gbpLocationName?.trim()) {
        throw new Error('Missing GBP location name on platform integration.');
    }

    const locationName = gbpLocationName.trim();

    if (locationName.startsWith('accounts/')) {
        return locationName;
    }

    if (!gbpAccountId?.trim()) {
        return locationName;
    }

    const accountPath = gbpAccountId.trim().startsWith('accounts/')
        ? gbpAccountId.trim()
        : `accounts/${gbpAccountId.trim()}`;

    const locationPath = locationName.startsWith('locations/')
        ? locationName
        : `locations/${locationName}`;

    return `${accountPath}/${locationPath}`;
}

/**
 * Business Information API (v1) expects locations/{locationId}, not accounts/.../locations/...
 */
export function resolveGbpBusinessInfoLocationName(
    gbpLocationName: string | null | undefined
): string {
    if (!gbpLocationName?.trim()) {
        throw new Error('Missing GBP location name on platform integration.');
    }

    const locationName = gbpLocationName.trim();

    if (locationName.startsWith('accounts/')) {
        const match = locationName.match(/locations\/[^/]+/);
        if (match) return match[0];
    }

    return locationName.startsWith('locations/')
        ? locationName
        : `locations/${locationName}`;
}
