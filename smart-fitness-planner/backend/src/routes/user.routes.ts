import { Router } from 'express';
import { saveProfile, fetchProfile, updateProfile } from '../controllers/user.controller';

const router = Router();

router.post('/profile', saveProfile);
router.get('/profile', fetchProfile);
router.put('/users/:id', updateProfile);

export default router;
