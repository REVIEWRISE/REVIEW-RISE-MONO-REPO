"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const client_1 = require("../client");
/**
 * Base Repository Class
 *
 * Provides common CRUD operations and utilities for all repositories.
 * Extend this class to create model-specific repositories.
 *
 * @template TModel - The Prisma model type
 * @template TDelegate - The Prisma delegate type for the model
 * @template TWhereInput - The where input type for filtering
 * @template TOrderByInput - The order by input type for sorting
 * @template TCreateInput - The create input type
 * @template TUpdateInput - The update input type
 */
class BaseRepository {
    constructor(delegate, modelName) {
        this.delegate = delegate;
        this.modelName = modelName;
    }
    /**
     * Find a single record by ID
     */
    async findById(id) {
        return this.delegate.findUnique({
            where: { id },
        });
    }
    /**
     * Find multiple records with optional filtering, sorting, and pagination
     */
    async findMany(options) {
        return this.delegate.findMany(options);
    }
    /**
     * Find first record matching criteria
     */
    async findFirst(options) {
        return this.delegate.findFirst(options);
    }
    /**
     * Create a new record
     */
    async create(data) {
        return this.delegate.create({
            data,
        });
    }
    /**
     * Update a record by ID
     */
    async update(id, data) {
        return this.delegate.update({
            where: { id },
            data,
        });
    }
    /**
     * Delete a record by ID (hard delete)
     */
    async delete(id) {
        return this.delegate.delete({
            where: { id },
        });
    }
    /**
     * Soft delete a record by ID (sets deletedAt timestamp)
     * Only works for models with deletedAt field
     */
    async softDelete(id) {
        return this.delegate.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    /**
     * Restore a soft-deleted record
     */
    async restore(id) {
        return this.delegate.update({
            where: { id },
            data: { deletedAt: null },
        });
    }
    /**
     * Count records matching criteria
     */
    async count(where) {
        return this.delegate.count({
            where,
        });
    }
    /**
     * Check if a record exists
     */
    async exists(where) {
        const count = await this.count(where);
        return count > 0;
    }
    /**
     * Find all records (use with caution on large tables)
     */
    async findAll() {
        return this.delegate.findMany();
    }
    /**
     * Find records excluding soft-deleted ones
     */
    async findManyActive(options) {
        return this.delegate.findMany({
            ...options,
            where: {
                ...options?.where,
                deletedAt: null,
            },
        });
    }
    /**
     * Execute operations within a transaction
     */
    async transaction(callback) {
        return client_1.prisma.$transaction(callback);
    }
    /**
     * Upsert - create if doesn't exist, update if exists
     */
    async upsert(where, create, update) {
        return this.delegate.upsert({
            where,
            create,
            update,
        });
    }
    /**
     * Batch create multiple records
     */
    async createMany(data) {
        return this.delegate.createMany({
            data,
            skipDuplicates: true,
        });
    }
    /**
     * Batch update multiple records
     */
    async updateMany(where, data) {
        return this.delegate.updateMany({
            where,
            data,
        });
    }
    /**
     * Batch delete multiple records
     */
    async deleteMany(where) {
        return this.delegate.deleteMany({
            where,
        });
    }
}
exports.BaseRepository = BaseRepository;
