import { randomUUID } from 'crypto';

interface StagedPhoto {
    buffer: Buffer;
    mimetype: string;
    expiresAt: number;
}

const staging = new Map<string, StagedPhoto>();

const TTL_MS = 10 * 60 * 1000;

export const stagePhoto = (buffer: Buffer, mimetype: string): string => {
    const token = randomUUID();
    staging.set(token, {
        buffer,
        mimetype,
        expiresAt: Date.now() + TTL_MS,
    });
    return token;
};

export const getStagedPhoto = (token: string): StagedPhoto | null => {
    const entry = staging.get(token);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
        staging.delete(token);
        return null;
    }
    return entry;
};
