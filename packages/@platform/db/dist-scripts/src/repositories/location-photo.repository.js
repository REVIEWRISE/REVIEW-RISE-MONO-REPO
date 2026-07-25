"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationPhotoRepository = exports.LocationPhotoRepository = void 0;
const contracts_1 = require("@platform/contracts");
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
class LocationPhotoRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.locationPhoto, 'LocationPhoto');
    }
    getDelegate() {
        return this.delegate;
    }
    async findByLocationId(locationId, params) {
        const delegate = this.getDelegate();
        if (!delegate?.findMany || !delegate?.count) {
            return [[], 0];
        }
        const where = { locationId };
        if (params?.category) {
            where.category = params.category;
        }
        const [photos, total] = await Promise.all([
            delegate.findMany({
                where,
                skip: params?.skip || 0,
                take: params?.take || 100,
                orderBy: { createTime: 'desc' },
            }),
            delegate.count({ where }),
        ]);
        return [photos, total];
    }
    async upsertPhotos(photos) {
        const locationPhotoDelegate = client_1.prisma.locationPhoto;
        if (!locationPhotoDelegate?.upsert || photos.length === 0) {
            return;
        }
        // Prisma doesn't support bulk upsert out of the box easily, so we can do it in a transaction
        // Since sqlite/pg upsert behavior differs, we use transaction with individual upserts
        await client_1.prisma.$transaction(photos.map((photo) => locationPhotoDelegate.upsert({
            where: { id: photo.id },
            create: photo,
            update: photo,
        })));
    }
    async getStats(locationId) {
        const delegate = this.getDelegate();
        if (!delegate?.count) {
            return {
                total: 0,
                coverCount: 0,
                interiorCount: 0
            };
        }
        const total = await delegate.count({ where: { locationId } });
        const coverCount = await delegate.count({ where: { locationId, category: contracts_1.GbpPhotoCategory.COVER } });
        const interiorCount = await delegate.count({ where: { locationId, category: contracts_1.GbpPhotoCategory.INTERIOR } });
        return {
            total,
            coverCount,
            interiorCount
        };
    }
    async delete(id) {
        const delegate = this.getDelegate();
        if (!delegate?.delete)
            return null;
        return delegate.delete({ where: { id } });
    }
}
exports.LocationPhotoRepository = LocationPhotoRepository;
exports.locationPhotoRepository = new LocationPhotoRepository();
