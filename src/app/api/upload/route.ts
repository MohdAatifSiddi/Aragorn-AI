import { NextResponse } from 'next/server';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, AWS_CONFIG } from '@/lib/aws-config';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const siteId = formData.get('siteId') as string;
    const zoneId = formData.get('zoneId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${siteId}/${zoneId || 'general'}/${timestamp}-${file.name}`;

    // Upload to S3
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

    await s3Client.send(uploadCommand);

    const imageUrl = `https://${AWS_CONFIG.S3_BUCKET}.s3.${AWS_CONFIG.REGION}.amazonaws.com/${filename}`;

    // Store reference in database
    const { data: imageRecord, error: dbError } = await supabase
      .from('site_images')
      .insert({
        site_id: siteId,
        zone_id: zoneId,
        image_url: imageUrl,
        s3_key: filename,
        uploaded_by: session.user.id,
        status: 'pending_analysis',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to save image record' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      imageId: imageRecord.id,
      message: 'Image uploaded successfully. Analysis in progress...',
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: error.message || 'Upload failed' 
    }, { status: 500 });
  }
}
