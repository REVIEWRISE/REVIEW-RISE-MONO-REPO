"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationRepository = exports.LocationRepository = void 0;
const client_1 = require("../client");
const base_repository_1 = require("./base.repository");
/**
 * Location Repository
 *
 * Handles all database operations related to business locations.
 */
class LocationRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(client_1.prisma.location, 'Location');
    }
    /**
     * Find all locations for a specific business
     */
    async findByBusinessId(businessId) {
        return this.delegate.findMany({
            where: {
                businessId,
                deletedAt: null,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    /**
     * Find location with business details
     */
    async findWithBusiness(id) {
        return this.delegate.findUnique({
            where: { id },
            include: {
                business: true,
            },
        });
    }
    /**
     * Create location for a business
     */
    async createForBusiness(businessId, locationData) {
        return this.delegate.create({
            data: {
                ...locationData,
                business: {
                    connect: { id: businessId },
                },
            },
            include: {
                business: true,
            },
        });
    }
    /**
     * Update location details
     */
    async update(id, data) {
        return this.delegate.update({
            where: { id },
            data,
            include: {
                business: true,
            },
        });
    }
    /**
     * Soft delete location
     */
    async delete(id) {
        return this.delegate.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: 'archived',
            },
        });
    }
    /**
     * Count locations for a business
     */
    async countByBusinessId(businessId) {
        return this.count({
            businessId,
            deletedAt: null,
        });
    }
    /**
     * Search locations by name or address (Admin usage with filtering)
     */
    async list(filters, options) {
        const where = {
            deletedAt: null,
            ...(filters.businessId && { businessId: filters.businessId }),
            ...(filters.status && { status: filters.status }),
            ...(filters.search && {
                OR: [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { address: { contains: filters.search, mode: 'insensitive' } },
                ],
            }),
        };
        const [items, total] = await Promise.all([
            this.delegate.findMany({
                where,
                take: options?.take,
                skip: options?.skip,
                orderBy: { createdAt: 'desc' },
                include: { business: true },
            }),
            this.delegate.count({ where }),
        ]);
        return { items, total };
    }
    /**
     * Search locations by name or address (Legacy/Simple)
     */
    async search(query, businessId, options) {
        return this.delegate.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        address: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                ],
                businessId,
                deletedAt: null,
            },
            take: options?.take,
            skip: options?.skip,
            orderBy: {
                name: 'asc',
            },
        });
    }
    /**
     * Bulk create locations for a business
     */
    async createManyForBusiness(businessId, locations) {
        return this.transaction(async (tx) => {
            const created = await Promise.all(locations.map((location) => tx.location.create({
                data: {
                    name: location.name,
                    address: location.address,
                    businessId,
                },
            })));
            return created;
        });
    }
}
exports.LocationRepository = LocationRepository;
// Export singleton instance
exports.locationRepository = new LocationRepository();
