import { Router } from 'express';

import controllers from '../controllers/controllers.Follow.js';
import checkToken from '../middleware/checkToken.js';

const router = Router();

router.post('/subscribe/:followingId', checkToken, controllers.followingUser);
router.get('/posts', checkToken, controllers.getFollowingPosts);
export default router;
