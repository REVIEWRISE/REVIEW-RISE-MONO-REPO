const MIN_FILE_SIZE_BYTES = 10_240;
const MIN_SHORT_EDGE_PX = 250;

const getJpegDimensions = (buffer: Buffer): { width: number; height: number } | null => {
    let offset = 2;

    while (offset < buffer.length) {
        if (buffer[offset] !== 0xff) break;

        const marker = buffer[offset + 1];
        const blockLength = buffer.readUInt16BE(offset + 2);

        if (marker === 0xc0 || marker === 0xc2) {
            return {
                height: buffer.readUInt16BE(offset + 5),
                width: buffer.readUInt16BE(offset + 7),
            };
        }

        offset += 2 + blockLength;
    }

    return null;
};

export const getImageDimensions = (buffer: Buffer, mimetype: string): { width: number; height: number } | null => {
    if (mimetype === 'image/png' && buffer.length >= 24 && buffer[0] === 0x89 && buffer[1] === 0x50) {
        return {
            width: buffer.readUInt32BE(16),
            height: buffer.readUInt32BE(20),
        };
    }

    if ((mimetype === 'image/jpeg' || mimetype === 'image/jpg') && buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
        return getJpegDimensions(buffer);
    }

    return null;
};

export const validateGbpPhotoFile = (file: Express.Multer.File): void => {
    if (!file?.buffer?.length) {
        throw new Error('Uploaded file is empty');
    }

    if (!file.mimetype?.startsWith('image/')) {
        throw new Error('Only image files are supported');
    }

    if (file.size < MIN_FILE_SIZE_BYTES) {
        throw new Error(`Photo must be at least ${Math.round(MIN_FILE_SIZE_BYTES / 1024)}KB`);
    }

    const dimensions = getImageDimensions(file.buffer, file.mimetype);
    if (dimensions) {
        const shortEdge = Math.min(dimensions.width, dimensions.height);
        if (shortEdge < MIN_SHORT_EDGE_PX) {
            throw new Error(`Photo must be at least ${MIN_SHORT_EDGE_PX}px on the shortest side`);
        }
    }
};

export const resolveGbpPublicBaseUrl = (): string | null => {
    const base = process.env.GBP_PUBLIC_BASE_URL?.trim().replace(/\/$/, '');
    return base || null;
};

export const buildPublishHelpMessage = (): string => {
    return 'Google rejected the photo publish step. Set GBP_PUBLIC_BASE_URL to a publicly reachable URL (for local dev: run `ngrok http 3000` and set GBP_PUBLIC_BASE_URL=https://YOUR-ID.ngrok-free.app/api/gbp), then retry.';
};
