import { Router } from 'express';
import controllers from '../controllers/controllers.Posts.js';

import checkToken from '../middleware/checkToken.js';
import uploadFile from '../middleware/uploadFile.js';

import postsSchema from '../schemas/posts.js';
import validator from '../middleware/validate.js';

const router = Router();

router.get('/list', controllers.getPosts);
router.get('/send-attachment', checkToken, controllers.getXLSXPosts);
router.post(
	'/create',
	uploadFile('public/images/posts').array('postImg', 4),
	validator(postsSchema.createPost, 'body'),
	checkToken,
	controllers.createPost
);

router.put(
	'/update/:id',
	uploadFile('public/images/posts').array('postImg', 4),
	validator(postsSchema.updatePost, 'body'),
	checkToken,
	controllers.updatePost
);
router.put(
	'/update/photo/:id',
	uploadFile('public/images/posts').single('postImg'),
	checkToken,
	controllers.updatePhoto
);

router.delete('/delete/:id', checkToken, controllers.deletePost);

export default router;
