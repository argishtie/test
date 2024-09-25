import { Router } from 'express';

import admin from './admin.js';
import users from './users.js';
import posts from './posts.js';
import follow from './follow.js';
import chat from './chat.js';

const router = Router();

router.get('/', (req, res) => {
	res.render('login');
});
router.use('/admin', admin);
router.use('/users', users);
router.use('/posts', posts);
router.use('/follow', follow);
router.use('/chat', chat);

router.get('/chat', (req, res) => {
	res.render('chat');
});

export default router;
