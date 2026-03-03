/**
 * Image Upload API Route
 * 
 * This API endpoint handles uploading construction site images to AWS S3.
 * It performs authentication, file validation, S3 upload, and database record creation.
 * 
 * @module api/upload
 * @requires next/server
 * @requires @aws-sdk/client-s3
 * @requires @/lib/aws-config
 * @requires @/lib/supabase-server
 */

import { NextResponse } from 'next/server';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, AWS_CONFIG } from '@/lib/aws-config';
import { createClient } from '@/lib/supabase-server';

/**
 * POST Handler - Upload Image to S3
 * 
 * Handles multipart form data containing an image file and metadata.
 * Uploads the image to AWS S3 and creates a database record for tracking.
 * 
 * @async
 * @function POST
 * @param {Request} request - Next.js request object containing form data
 * @returns {Promise<NextResponse>} JSON response with upload result
 * 
 * @throws {401} If user is not authenticated
 * @throws {400} If no file is provided or siteId is missing
 * @throws {500} If S3 upload or database operation fails
 * 
 * @example
 * // Client-side usage:
 * const formData = new FormData();
 * formData.append('file', imageFile);
 * formData.append('siteId', 'site-uuid');
 * formData.append('zoneId', 'zone-uuid');
 * 
 * const response = await fetch('/api/upload', {
 *   method: 'POST',
 *   body: formData
 * });
 */
export async function POST(request: Request) {
  try {
    // Step 1: Authentication Check
    // Initialize Supabase client and verify user session
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    // Reject unauthorized requests
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 2: Extract Form Data
    // Parse multipart form data from request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const siteId = formData.get('siteId') as string;
    const zoneId = formData.get('zoneId') as string;

    // Validate required fields
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!siteId) {
      return NextResponse.json({ error: 'Site ID is required' }, { status: 400 });
    }

    // Step 3: File Processing
    // Convert file to buffer for S3 upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Step 4: Generate Unique Filename
    // Create organized S3 key structure: siteId/zoneId/timestamp-filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize filename
    const filename = `${siteId}/${zoneId || 'general'}/${timestamp}-${sanitizedFilename}`;

    // Step 5: Upload to AWS S3
    // Prepare S3 upload command with metadata
    const uploadCommand = new PutObjectCommand({
      Bucket: AWS_CONFIG.S3_BUCKET,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        siteId: siteId || '',
        zoneId: zoneId || '',
        userId: session.user.id,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Execute S3 upload
    await s3Client.send(uploadCommand);

    // Step 6: Generate Image URL
    // Construct public S3 URL for the uploaded image
    const imageUrl = `https://${AWS_CONFIG.S3_BUCKET}.s3.${AWS_CONFIG.REGION}.amazonaws.com/${filename}`;

    // Step 7: Store Reference in Database
    // Create database record for tracking and analysis
    const { data: imageRecord, error: dbError } = await supabase
      .from('site_images')
      .insert({
        site_id: siteId,
        zone_id: zoneId || null, // Allow null for general uploads
        image_url: imageUrl,
        s3_key: filename,
        uploaded_by: session.user.id,
        status: 'pending_analysis', // Initial status before AI analysis
      })
      .select()
      .single();

    // Handle database errors
    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        error: 'Failed to save image record',
        details: dbError.message 
      }, { status: 500 });
    }

    // Step 8: Return Success Response
    return NextResponse.json({
      success: true,
      imageUrl,
      imageId: imageRecord.id,
      s3Key: filename,
      message: 'Image uploaded successfully. Analysis in progress...',
    });

  } catch (error: any) {
    // Global error handler
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: error.message || 'Upload failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
