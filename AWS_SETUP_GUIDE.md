# AWS Setup Guide for Aragorn AI

This guide will help you set up the required AWS services for the Aragorn AI Construction Intelligence platform.

## Prerequisites
- AWS Account with billing enabled
- AWS CLI installed (optional but recommended)
- Basic understanding of AWS services

## Services Required
1. **AWS S3** - Image storage
2. **AWS Rekognition** - AI-powered image analysis
3. **AWS IAM** - Access management

---

## Step 1: Create IAM User

1. Go to AWS Console → IAM → Users
2. Click "Create user"
3. Username: `aragorn-ai-service`
4. Select "Programmatic access"
5. Click "Next: Permissions"

### Attach Policies
Create a custom policy with these permissions:

```json
{
  "Version": "2012-12-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::aragorn-construction-images",
        "arn:aws:s3:::aragorn-construction-images/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "rekognition:DetectProtectiveEquipment",
        "rekognition:DetectLabels",
        "rekognition:DetectModerationLabels"
      ],
      "Resource": "*"
    }
  ]
}
```

6. Save the **Access Key ID** and **Secret Access Key** - you'll need these!

---

## Step 2: Create S3 Bucket

### Using AWS Console:
1. Go to AWS Console → S3
2. Click "Create bucket"
3. Bucket name: `aragorn-construction-images` (must be globally unique)
4. Region: `us-east-1` (or your preferred region)
5. **Block Public Access**: Keep all blocks enabled (for security)
6. **Versioning**: Enable (recommended for backup)
7. **Encryption**: Enable server-side encryption (SSE-S3)
8. Click "Create bucket"

### Using AWS CLI:
```bash
aws s3 mb s3://aragorn-construction-images --region us-east-1
```

### Configure CORS (Important!)
Add this CORS configuration to your bucket:

1. Go to bucket → Permissions → CORS
2. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-production-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## Step 3: Enable AWS Rekognition

AWS Rekognition is enabled by default in most regions. Verify:

1. Go to AWS Console → Rekognition
2. Check if the service is available in your region
3. No additional setup required - it's pay-per-use

### Pricing (as of 2024):
- **DetectProtectiveEquipment**: $0.10 per 1,000 images
- **DetectLabels**: $0.10 per 1,000 images
- **DetectModerationLabels**: $0.10 per 1,000 images

**Estimated cost**: ~$0.30 per 1,000 images analyzed

---

## Step 4: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET=aragorn-construction-images
```

**⚠️ SECURITY WARNING**: Never commit `.env.local` to git!

---

## Step 5: Test the Setup

Run this test script to verify your AWS configuration:

```bash
node test-aws-connection.js
```

Or manually test:

1. Start your Next.js dev server: `npm run dev`
2. Login to the dashboard
3. Upload a test construction site image
4. Check the console for any errors
5. Verify the image appears in your S3 bucket

---

## Troubleshooting

### Error: "Access Denied"
- Check IAM user permissions
- Verify bucket name matches in `.env.local`
- Ensure CORS is configured correctly

### Error: "Bucket does not exist"
- Verify bucket name is correct
- Check you're using the correct AWS region
- Ensure bucket was created successfully

### Error: "Rekognition not available"
- Check if Rekognition is available in your region
- Try switching to `us-east-1` or `us-west-2`

### Error: "Invalid credentials"
- Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
- Check if IAM user is active
- Regenerate access keys if needed

---

## Cost Optimization Tips

1. **Enable S3 Lifecycle Policies**: Auto-delete old images after 90 days
2. **Use S3 Intelligent-Tiering**: Automatically move infrequently accessed images to cheaper storage
3. **Set up CloudWatch Alarms**: Get notified if costs exceed threshold
4. **Implement image compression**: Reduce storage costs by compressing images before upload

### Example Lifecycle Policy:
```json
{
  "Rules": [
    {
      "Id": "DeleteOldImages",
      "Status": "Enabled",
      "Prefix": "",
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
```

---

## Security Best Practices

1. ✅ Never expose AWS credentials in client-side code
2. ✅ Use IAM roles with minimal required permissions
3. ✅ Enable S3 bucket encryption
4. ✅ Enable S3 versioning for backup
5. ✅ Regularly rotate access keys
6. ✅ Enable CloudTrail for audit logging
7. ✅ Use VPC endpoints for private access (production)

---

## Production Deployment Checklist

- [ ] Create separate AWS account/IAM user for production
- [ ] Use different S3 bucket for production
- [ ] Enable S3 bucket logging
- [ ] Set up CloudWatch monitoring
- [ ] Configure backup and disaster recovery
- [ ] Enable AWS WAF for API protection
- [ ] Set up cost alerts
- [ ] Document incident response procedures

---

## Alternative: AWS Lambda for Processing

For better scalability, consider using AWS Lambda:

1. Create Lambda function triggered by S3 uploads
2. Lambda processes image with Rekognition
3. Lambda updates Supabase database
4. Reduces Next.js API load

**Benefits**:
- Automatic scaling
- Pay only for execution time
- Better separation of concerns
- Can process images asynchronously

---

## Support & Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS Rekognition Documentation](https://docs.aws.amazon.com/rekognition/)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [AWS Pricing Calculator](https://calculator.aws/)

---

## Next Steps

After AWS setup is complete:

1. Run the Supabase schema: `supabase-schema.sql`
2. Test image upload functionality
3. Verify Rekognition analysis works
4. Set up monitoring and alerts
5. Deploy to production

**Need help?** Check the troubleshooting section or open an issue on GitHub.
