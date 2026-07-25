import type { Request, Response } from 'express';
import { createErrorResponse, createSuccessResponse, SystemMessageCode, GbpPhotoCategory } from '@platform/contracts';
import { gbpPhotosService } from '../services/gbp-photos.service';
import { getStagedPhoto } from '../utils/photo-staging';

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export const getPhotos = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
        const take = req.query.take ? parseInt(req.query.take as string, 10) : 100;
        const category = req.query.category as string | undefined;

        if (!isUuid(locationId)) {
            const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        const result = await gbpPhotosService.getLocationPhotos(locationId, skip, take, category);

        const response = createSuccessResponse(result, 'GBP photos fetched successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);

        return res.status(response.statusCode).json(response);
    } catch (error: any) {
        const response = createErrorResponse(
            error?.message || 'Failed to fetch GBP photos',
            SystemMessageCode.INTERNAL_SERVER_ERROR,
            500,
            undefined,
            req.id
        );

        return res.status(response.statusCode).json(response);
    }
};

export const proxyPhoto = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const photoId = decodeURIComponent(req.params[0] || '');

        if (!isUuid(locationId)) {
            const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        if (!photoId) {
            const badRequest = createErrorResponse('Missing photoId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        const streamData = await gbpPhotosService.proxyPhotoStream(locationId, photoId);

        if (streamData.contentType) res.setHeader('Content-Type', streamData.contentType);
        if (streamData.contentLength) res.setHeader('Content-Length', streamData.contentLength);
        res.setHeader('Cache-Control', 'public, max-age=86400');

        streamData.stream.on('error', (error: Error) => {
            console.error('GBP photo stream error:', error);
            if (!res.headersSent) res.status(502).end();
        });
        streamData.stream.pipe(res);
    } catch (error: any) {
        console.error('Proxy GBP photo error:', error?.response?.data || error);
        const statusCode = error?.response?.status === 404 || error?.message === 'Photo not found' ? 404 : 502;
        const response = createErrorResponse(
            error?.message || 'Failed to load GBP photo',
            SystemMessageCode.INTERNAL_SERVER_ERROR,
            statusCode,
            undefined,
            req.id
        );

        return res.status(response.statusCode).json(response);
    }
};

export const syncPhotos = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;

        if (!isUuid(locationId)) {
            const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        await gbpPhotosService.syncLocationPhotos(locationId);

        const response = createSuccessResponse(null, 'GBP photos synced successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);

        return res.status(response.statusCode).json(response);
    } catch (error: any) {
        const message = error?.message || 'Failed to sync GBP photos';
        const statusCode = 500;

        const response = createErrorResponse(
            message,
            SystemMessageCode.INTERNAL_SERVER_ERROR,
            statusCode,
            undefined,
            req.id
        );

        return res.status(response.statusCode).json(response);
    }
};

export const uploadPhoto = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const category = req.body.category as string || GbpPhotoCategory.ADDITIONAL;

        if (!isUuid(locationId)) {
            const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        const multerReq = req as any;
        if (!multerReq.file) {
            const badRequest = createErrorResponse('No photo uploaded', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        const result = await gbpPhotosService.uploadPhoto(locationId, multerReq.file, category);

        const response = createSuccessResponse(result, 'GBP photo uploaded successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);

        return res.status(response.statusCode).json(response);
    } catch (error: any) {
        const message = error?.message || 'Failed to upload GBP photo';
        const isValidation = message.includes('must be at least') || message.includes('Only image') || message.includes('empty');
        const isNetwork = message.includes('Cannot reach Google Business Profile API');
        const statusCode = isValidation ? 400 : isNetwork ? 503 : 500;
        const response = createErrorResponse(message, SystemMessageCode.INTERNAL_SERVER_ERROR, statusCode, undefined, req.id);
        return res.status(response.statusCode).json(response);
    }
};

export const serveStagingPhoto = async (req: Request, res: Response) => {
    const staged = getStagedPhoto(req.params.token);

    if (!staged) {
        return res.status(404).send('Photo not found or expired');
    }

    res.setHeader('Content-Type', staged.mimetype);
    res.setHeader('Cache-Control', 'no-store');
    return res.send(staged.buffer);
};

export const deletePhoto = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;
        const photoId = decodeURIComponent(req.params.photoId || req.params[0] || '');

        if (!isUuid(locationId)) {
            const badRequest = createErrorResponse('Invalid locationId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        if (!photoId) {
            const badRequest = createErrorResponse('Missing photoId', SystemMessageCode.VALIDATION_ERROR, 400, undefined, req.id);
            return res.status(badRequest.statusCode).json(badRequest);
        }

        await gbpPhotosService.deletePhoto(locationId, photoId);

        const response = createSuccessResponse(null, 'GBP photo deleted successfully', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);

        return res.status(response.statusCode).json(response);
    } catch (error: any) {
        const message = error?.message || 'Failed to delete GBP photo';
        const response = createErrorResponse(message, SystemMessageCode.INTERNAL_SERVER_ERROR, 500, undefined, req.id);
        return res.status(response.statusCode).json(response);
    }
};
