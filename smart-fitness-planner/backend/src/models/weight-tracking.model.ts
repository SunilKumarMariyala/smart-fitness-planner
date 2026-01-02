import { db } from '../config/db';

export interface WeightEntry {
  id?: number;
  user_id: number;
  weight: number;
  recorded_date: string; // YYYY-MM-DD format
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const createWeightEntry = async (entry: WeightEntry): Promise<number> => {
  const { user_id, weight, recorded_date, notes } = entry;
  
  // Use INSERT ... ON DUPLICATE KEY UPDATE to handle same-day entries
  const [result]: any = await db.query(
    `INSERT INTO weight_tracking (user_id, weight, recorded_date, notes)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
       weight = VALUES(weight),
       notes = VALUES(notes),
       updated_at = CURRENT_TIMESTAMP`,
    [user_id, weight, recorded_date, notes || null]
  );

  return result.insertId || result.affectedRows;
};

export const getWeightHistory = async (
  user_id: number,
  limit?: number
): Promise<WeightEntry[]> => {
  let query = `SELECT * FROM weight_tracking WHERE user_id = ? ORDER BY recorded_date DESC`;
  const params: any[] = [user_id];

  if (limit) {
    query += ` LIMIT ?`;
    params.push(limit);
  }

  const [rows]: any = await db.query(query, params);
  return rows;
};

export const getLatestWeight = async (user_id: number): Promise<WeightEntry | null> => {
  const [rows]: any = await db.query(
    `SELECT * FROM weight_tracking 
     WHERE user_id = ? 
     ORDER BY recorded_date DESC 
     LIMIT 1`,
    [user_id]
  );

  return rows[0] || null;
};

export const getWeightByDate = async (
  user_id: number,
  date: string
): Promise<WeightEntry | null> => {
  const [rows]: any = await db.query(
    `SELECT * FROM weight_tracking 
     WHERE user_id = ? AND recorded_date = ?`,
    [user_id, date]
  );

  return rows[0] || null;
};

export const deleteWeightEntry = async (id: number): Promise<boolean> => {
  const [result]: any = await db.query(
    `DELETE FROM weight_tracking WHERE id = ?`,
    [id]
  );

  return result.affectedRows > 0;
};

