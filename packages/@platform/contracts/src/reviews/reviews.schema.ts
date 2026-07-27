import { z } from 'zod';

/** Matches Postgres @db.Uuid — less strict than RFC 4122 `.uuid()`. */
export const PostgresUuidSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    'Invalid location ID'
  );

export const LocationIdParamSchema = z.object({
  locationId: PostgresUuidSchema,
});

export const ListReviewsQuerySchema = z.object({
  page: z.string().optional().transform(v => v ? parseInt(v) : 1),
  limit: z.string().optional().transform(v => v ? parseInt(v) : 10),
  search: z.string().optional(),
  rating: z.string().optional().transform(v => v ? parseInt(v) : undefined),
  platform: z.string().optional(),
  sentiment: z.string().optional(),
  replyStatus: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['pending', 'replied', 'rejected']).optional(),
  source: z.string().optional(),
  businessId: z.string().optional(),
});

export const PostReplyRequestSchema = z.object({
  replyText: z.string().min(1),
});

export const AnalyticsQuerySchema = z.object({
  businessId: PostgresUuidSchema,
  locationId: PostgresUuidSchema.optional(),
  period: z.string().optional().default('30'),
  groupBy: z.enum(['day', 'week']).optional().default('day'),
  limit: z.string().optional().default('10'),
});

export const AddCompetitorDataSchema = z.object({
  businessId: PostgresUuidSchema,
  locationId: PostgresUuidSchema.optional(),
  competitorName: z.string().min(1),
  averageRating: z.number().min(0).max(5),
  totalReviews: z.number().int().min(0),
  source: z.string().optional().default('manual'),
});
