import dns from 'dns';
import axios, { type AxiosRequestConfig } from 'axios';

dns.setDefaultResultOrder('ipv4first');

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const withIpv4 = (config: AxiosRequestConfig = {}): AxiosRequestConfig => ({
    ...config,
    family: 4,
});

export const googleApiClient = axios.create({
    timeout: 30_000,
});

const isRetryableNetworkError = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') return false;

    const code = (error as { code?: string }).code;

    return code === 'ENOTFOUND'
        || code === 'ECONNRESET'
        || code === 'ETIMEDOUT'
        || code === 'EAI_AGAIN'
        || code === 'ENETUNREACH';
};

export const formatGoogleNetworkError = (error: unknown, action: string): string => {
    if (!error || typeof error !== 'object') {
        return `Failed to ${action}`;
    }

    const err = error as { code?: string; message?: string };
    if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
        return `Cannot reach Google Business Profile API (DNS lookup failed for mybusiness.googleapis.com). Check your internet connection, VPN, or DNS settings, then retry.`;
    }

    if (err.code === 'ETIMEDOUT' || err.code === 'ENETUNREACH') {
        return `Cannot reach Google Business Profile API (network timeout). Check your internet connection and retry.`;
    }

    return err.message || `Failed to ${action}`;
};

export async function withGoogleApiRetry<T>(
    action: string,
    request: (client: typeof googleApiClient) => Promise<T>,
    retries = 3
): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await request(googleApiClient);
        } catch (error) {
            lastError = error;
            if (!isRetryableNetworkError(error) || attempt === retries) {
                if (isRetryableNetworkError(error)) {
                    throw new Error(formatGoogleNetworkError(error, action));
                }
                throw error;
            }
            await sleep(1000 * attempt);
        }
    }

    throw lastError;
}

export const googlePost = (
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
) => withGoogleApiRetry('call Google API', (client) => client.post(url, data, withIpv4(config)));

export const googleGet = (
    url: string,
    config?: AxiosRequestConfig
) => withGoogleApiRetry('call Google API', (client) => client.get(url, withIpv4(config)));

export const googleDelete = (
    url: string,
    config?: AxiosRequestConfig
) => withGoogleApiRetry('call Google API', (client) => client.delete(url, withIpv4(config)));
