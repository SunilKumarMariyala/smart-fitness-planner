import { Request, Response } from 'express';
import {
  createWeightEntry,
  getWeightHistory,
  getLatestWeight,
  getWeightByDate,
  deleteWeightEntry,
  WeightEntry
} from '../models/weight-tracking.model';

export const addWeightEntry = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { weight, recorded_date, notes } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!weight || typeof weight !== 'number' || weight <= 0) {
      return res.status(400).json({ message: 'Valid weight is required' });
    }

    if (!recorded_date) {
      return res.status(400).json({ message: 'Recorded date is required' });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(recorded_date)) {
      return res.status(400).json({ message: 'Date must be in YYYY-MM-DD format' });
    }

    const entry: WeightEntry = {
      user_id: userId,
      weight,
      recorded_date,
      notes: notes || undefined
    };

    await createWeightEntry(entry);

    res.status(201).json({
      message: 'Weight entry added successfully',
      entry
    });
  } catch (error: any) {
    console.error('ADD WEIGHT ENTRY ERROR:', error);
    res.status(500).json({
      message: 'Failed to add weight entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getWeightHistoryByUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const history = await getWeightHistory(userId, limit);

    res.json({
      message: 'Weight history retrieved successfully',
      history
    });
  } catch (error: any) {
    console.error('GET WEIGHT HISTORY ERROR:', error);
    res.status(500).json({
      message: 'Failed to retrieve weight history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getLatestWeightByUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const latest = await getLatestWeight(userId);

    if (!latest) {
      return res.status(404).json({ message: 'No weight entries found' });
    }

    res.json({
      message: 'Latest weight retrieved successfully',
      weight: latest
    });
  } catch (error: any) {
    console.error('GET LATEST WEIGHT ERROR:', error);
    res.status(500).json({
      message: 'Failed to retrieve latest weight',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteWeightEntryById = async (req: Request, res: Response) => {
  try {
    const entryId = parseInt(req.params.entryId);

    if (isNaN(entryId)) {
      return res.status(400).json({ message: 'Invalid entry ID' });
    }

    const deleted = await deleteWeightEntry(entryId);

    if (!deleted) {
      return res.status(404).json({ message: 'Weight entry not found' });
    }

    res.json({
      message: 'Weight entry deleted successfully'
    });
  } catch (error: any) {
    console.error('DELETE WEIGHT ENTRY ERROR:', error);
    res.status(500).json({
      message: 'Failed to delete weight entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

