import { Router } from 'express';
import { postsController } from '../../controllers/posts.controller';
import { validateRequest } from '@platform/middleware';
import { CreatePostRequestSchema, CreateBatchPostsRequestSchema, ListPostsQuerySchema } from '@platform/contracts';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', validateRequest(CreatePostRequestSchema), (req, res) => postsController.create(req, res));
router.get('/', validateRequest(ListPostsQuerySchema, 'query'), (req, res) => postsController.list(req, res));
router.post('/batch', validateRequest(CreateBatchPostsRequestSchema), (req, res) => postsController.createBatch(req, res));

export default router;
