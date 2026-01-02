import { Router } from 'express';
import {
  addWeightEntry,
  getWeightHistoryByUser,
  getLatestWeightByUser,
  deleteWeightEntryById
} from '../controllers/weight-tracking.controller';

const router = Router();

router.post('/users/:userId/weight', addWeightEntry);
router.get('/users/:userId/weight/history', getWeightHistoryByUser);
router.get('/users/:userId/weight/latest', getLatestWeightByUser);
router.delete('/users/:userId/weight/:entryId', deleteWeightEntryById);

export default router;

