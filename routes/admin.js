import { Router } from 'express';

import controllers from '../controllers/controllers.Admin.js';

import checkToken from '../middleware/checkToken.js';
// import validate from '../middleware/validate.js';
// import adminSchema from '../schemas/admin.js';

const router = Router();

router.get('/profile', (req, res) => {
	res.render('admin');
});
router.get('/show/review', (req, res) => {
	res.render('adminReview');
});
router.get('/users/list', checkToken, controllers.getUsers);

router.delete('/delete/user/:id', checkToken, controllers.deleteUsers);
export default router;
