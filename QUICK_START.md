# 🚀 Aragorn AI - Quick Start Guide

## What's New?

Your Aragorn AI platform now has **AWS-powered image analysis**! Upload construction site photos and get instant AI-powered safety analysis.

---

## ⚡ 3-Minute Setup

### 1. Install Dependencies (30 seconds)
```bash
npm install
```

### 2. Set Up AWS (2 minutes)

#### Create IAM User:
1. Go to [AWS Console → IAM → Users](https://console.aws.amazon.com/iam/home#/users)
2. Click "Create user" → Name: `aragorn-ai`
3. Attach policies: `AmazonS3FullAccess` + `AmazonRekognitionFullAccess`
4. Create access key → Save the credentials

#### Create S3 Bucket:
1. Go to [AWS Console → S3](https://s3.console.aws.amazon.com/s3/home)
2. Click "Create bucket"
3. Name: `aragorn-construction-images` (or any unique name)
4. Region: `us-east-1`
5. Keep default settings → Create

#### Configure CORS:
1. Open your bucket → Permissions → CORS
2. Paste this:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 3. Add AWS Credentials (30 seconds)

Edit `.env.local` and add your AWS credentials:

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here
AWS_S3_BUCKET=aragorn-construction-images
```

### 4. Set Up Database (1 minute)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open SQL Editor
3. Copy and paste contents from `supabase-schema.sql`
4. Click "Run"

### 5. Test & Launch! (30 seconds)

```bash
# Test AWS connection
npm run test:aws

# Start the app
npm run dev
```

Visit `http://localhost:3000` → Login → Upload a photo!

---

## 🎯 How to Use

1. **Login** to the dashboard
2. **Scroll down** to "Edge Vision Upload" section
3. **Click or drag** a construction site photo
4. **Wait 5-10 seconds** for AI analysis
5. **View results**:
   - Safety Score
   - PPE Violations
   - Persons Detected
   - Construction Items

---

## 🧪 Test Images

Try uploading:
- Construction workers with hard hats ✅
- Workers without PPE ❌
- Construction equipment
- Building materials

---

## 📊 What Gets Analyzed?

### PPE Detection:
- ✅ Hard hats / Helmets
- ✅ Safety vests
- ✅ Gloves
- ✅ Face covers

### Construction Items:
- Building materials
- Equipment and machinery
- Scaffolding
- Vehicles

### Safety Hazards:
- Unsafe conditions
- Missing PPE
- Potential risks

---

## 💡 Features

- **Real-time Analysis** - Results in 5-10 seconds
- **Safety Scoring** - Automatic compliance calculation
- **Instant Alerts** - Violations trigger notifications
- **Dashboard Integration** - Seamless UI experience
- **Multilingual** - English, Hindi, Urdu support

---

## 🐛 Troubleshooting

### Upload fails?
- Check AWS credentials in `.env.local`
- Verify S3 bucket name matches
- Ensure IAM user has permissions

### Analysis fails?
- Check Rekognition is enabled in your region
- Try `us-east-1` or `us-west-2`
- Verify image format (JPG, PNG)

### No results?
- Check browser console for errors
- Verify database schema is applied
- Ensure you're logged in

---

## 💰 Costs

AWS charges are minimal for MVP:
- **1,000 images**: ~$0.30/month
- **10,000 images**: ~$3/month
- **100,000 images**: ~$30/month

First 12 months: AWS Free Tier includes 5,000 images/month!

---

## 📚 Documentation

- **Full Guide**: `IMPLEMENTATION_GUIDE.md`
- **AWS Setup**: `AWS_SETUP_GUIDE.md`
- **Database Schema**: `supabase-schema.sql`

---

## ✅ Success Checklist

- [ ] AWS credentials added to `.env.local`
- [ ] S3 bucket created and CORS configured
- [ ] Database schema applied in Supabase
- [ ] `npm run test:aws` passes
- [ ] App starts with `npm run dev`
- [ ] Can upload and analyze images

---

## 🎉 You're Ready!

Your Aragorn AI MVP is now fully functional with AWS-powered computer vision. Upload a photo and watch the magic happen! 🚀

**Need help?** Check `IMPLEMENTATION_GUIDE.md` for detailed instructions.
