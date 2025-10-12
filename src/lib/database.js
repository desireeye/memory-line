import { connect } from '@planetscale/database';

const config = {
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
};

// For PlanetScale, use the connection string format
const connectionString = process.env.DATABASE_URL || process.env.PLANETSCALE_DATABASE_URL;

export const db = connect({
  url: connectionString,
  // PlanetScale specific configuration
  fetch: (url, init) => {
    delete init['cache'];
    return fetch(url, init);
  },
});

// Database helper functions
export async function executeQuery(query, params = []) {
  try {
    const result = await db.execute(query, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Memory-related queries
export const memoryQueries = {
  // Create a new memory
  createMemory: `
    INSERT INTO memories (user_id, title, story, date, media_url, media_type, tags, is_private, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `,
  
  // Get memories for a user
  getUserMemories: `
    SELECT * FROM memories 
    WHERE user_id = ? 
    ORDER BY date DESC, created_at DESC
  `,
  
  // Get public memories
  getPublicMemories: `
    SELECT * FROM memories 
    WHERE is_private = false 
    ORDER BY date DESC, created_at DESC
  `,
  
  // Get memory by ID
  getMemoryById: `
    SELECT * FROM memories WHERE id = ? AND user_id = ?
  `,
  
  // Update memory
  updateMemory: `
    UPDATE memories 
    SET title = ?, story = ?, date = ?, tags = ?, is_private = ?, updated_at = NOW()
    WHERE id = ? AND user_id = ?
  `,
  
  // Delete memory
  deleteMemory: `
    DELETE FROM memories WHERE id = ? AND user_id = ?
  `,
  
  // Search memories
  searchMemories: `
    SELECT * FROM memories 
    WHERE user_id = ? 
    AND (title LIKE ? OR story LIKE ? OR tags LIKE ?)
    ORDER BY date DESC, created_at DESC
  `,
  
  // Get memories by year
  getMemoriesByYear: `
    SELECT * FROM memories 
    WHERE user_id = ? 
    AND YEAR(date) = ?
    ORDER BY date DESC, created_at DESC
  `,
  
  // Get memory statistics
  getMemoryStats: `
    SELECT 
      COUNT(*) as total_memories,
      COUNT(CASE WHEN media_type = 'image' THEN 1 END) as image_count,
      COUNT(CASE WHEN media_type = 'video' THEN 1 END) as video_count,
      MIN(date) as first_memory_date,
      MAX(date) as last_memory_date
    FROM memories 
    WHERE user_id = ?
  `
};