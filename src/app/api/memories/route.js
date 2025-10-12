import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, memoryQueries } from '@/lib/database';

// GET /api/memories - Get memories for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isPublic = searchParams.get('public') === 'true';
    const year = searchParams.get('year');
    const search = searchParams.get('search');

    if (!userId && !isPublic) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    let query, params;

    if (search) {
      // Search memories
      query = memoryQueries.searchMemories;
      const searchTerm = `%${search}%`;
      params = [userId, searchTerm, searchTerm, searchTerm];
    } else if (year) {
      // Get memories by year
      query = memoryQueries.getMemoriesByYear;
      params = [userId, parseInt(year)];
    } else if (isPublic) {
      // Get public memories
      query = memoryQueries.getPublicMemories;
      params = [];
    } else {
      // Get user memories
      query = memoryQueries.getUserMemories;
      params = [userId];
    }

    const result = await executeQuery(query, params);
    
    return NextResponse.json({
      success: true,
      memories: result.rows || []
    });

  } catch (error) {
    console.error('Get memories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memories', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/memories - Create a new memory
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      title,
      story,
      date,
      mediaUrl,
      mediaPublicId,
      mediaType,
      mediaWidth,
      mediaHeight,
      mediaDuration,
      tags,
      isPrivate
    } = body;

    // Validate required fields
    if (!userId || !title || !date || !mediaUrl || !mediaType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert tags to JSON if it's an array
    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : tags;

    const result = await executeQuery(memoryQueries.createMemory, [
      userId,
      title,
      story || '',
      date,
      mediaUrl,
      mediaType,
      tagsJson,
      isPrivate || false
    ]);

    return NextResponse.json({
      success: true,
      memoryId: result.insertId,
      message: 'Memory created successfully'
    });

  } catch (error) {
    console.error('Create memory error:', error);
    return NextResponse.json(
      { error: 'Failed to create memory', details: error.message },
      { status: 500 }
    );
  }
}