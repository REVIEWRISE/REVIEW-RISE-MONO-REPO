/**
 * Google Business Profile location resource names vary by API version.
 * Reviews API (v4) requires: accounts/{accountId}/locations/{locationId}
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
