import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, memoryQueries } from '@/lib/database';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary for server-side use
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/memories/[id] - Get a specific memory
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const result = await executeQuery(memoryQueries.getMemoryById, [id, userId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Memory not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      memory: result.rows[0]
    });

  } catch (error) {
    console.error('Get memory error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memory', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/memories/[id] - Update a memory
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId, title, story, date, tags, isPrivate } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Convert tags to JSON if it's an array
    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : tags;

    const result = await executeQuery(memoryQueries.updateMemory, [
      title,
      story || '',
      date,
      tagsJson,
      isPrivate || false,
      id,
      userId
    ]);

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Memory not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Memory updated successfully'
    });

  } catch (error) {
    console.error('Update memory error:', error);
    return NextResponse.json(
      { error: 'Failed to update memory', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/memories/[id] - Delete a memory
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // First, get the memory to find the Cloudinary public ID
    const memoryResult = await executeQuery(memoryQueries.getMemoryById, [id, userId]);
    
    if (memoryResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Memory not found' },
        { status: 404 }
      );
    }

    const memory = memoryResult.rows[0];

    // Delete from Cloudinary if public ID exists
    if (memory.media_public_id) {
      try {
        await cloudinary.uploader.destroy(memory.media_public_id);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete from database
    const result = await executeQuery(memoryQueries.deleteMemory, [id, userId]);

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Memory not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Memory deleted successfully'
    });

  } catch (error) {
    console.error('Delete memory error:', error);
    return NextResponse.json(
      { error: 'Failed to delete memory', details: error.message },
      { status: 500 }
    );
  }
}