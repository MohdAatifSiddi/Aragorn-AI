/**
 * AWS Connection Test Script
 * Run this to verify your AWS configuration before deploying
 * 
 * Usage: node test-aws-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const { S3Client, ListBucketsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { RekognitionClient, DetectLabelsCommand } = require('@aws-sdk/client-rekognition');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAWSConnection() {
  log('\n🔍 Testing AWS Configuration for Aragorn AI\n', 'blue');

  // Check environment variables
  log('1. Checking Environment Variables...', 'yellow');
  const requiredVars = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET',
  ];

  let allVarsPresent = true;
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      log(`   ✓ ${varName} is set`, 'green');
    } else {
      log(`   ✗ ${varName} is missing!`, 'red');
      allVarsPresent = false;
    }
  });

  if (!allVarsPresent) {
    log('\n❌ Missing required environment variables. Please check your .env.local file.\n', 'red');
    process.exit(1);
  }

  // Initialize AWS clients
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const rekognitionClient = new RekognitionClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  // Test S3 Connection
  log('\n2. Testing S3 Connection...', 'yellow');
  try {
    const listCommand = new ListBucketsCommand({});
    const response = await s3Client.send(listCommand);
    log(`   ✓ Successfully connected to S3`, 'green');
    log(`   ✓ Found ${response.Buckets.length} bucket(s)`, 'green');

    // Check if our bucket exists
    const bucketExists = response.Buckets.some(
      bucket => bucket.Name === process.env.AWS_S3_BUCKET
    );
    if (bucketExists) {
      log(`   ✓ Bucket '${process.env.AWS_S3_BUCKET}' exists`, 'green');
    } else {
      log(`   ⚠ Bucket '${process.env.AWS_S3_BUCKET}' not found!`, 'red');
      log(`   Available buckets: ${response.Buckets.map(b => b.Name).join(', ')}`, 'yellow');
    }
  } catch (error) {
    log(`   ✗ S3 Connection Failed: ${error.message}`, 'red');
    log('\n   Possible issues:', 'yellow');
    log('   - Invalid AWS credentials', 'yellow');
    log('   - Incorrect region', 'yellow');
    log('   - IAM user lacks S3 permissions', 'yellow');
    process.exit(1);
  }

  // Test S3 Upload Permission
  log('\n3. Testing S3 Upload Permission...', 'yellow');
  try {
    const testKey = `test/${Date.now()}-test.txt`;
    const putCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: testKey,
      Body: 'Aragorn AI Test Upload',
      ContentType: 'text/plain',
    });
    await s3Client.send(putCommand);
    log(`   ✓ Successfully uploaded test file to S3`, 'green');
    log(`   ✓ IAM user has PutObject permission`, 'green');
  } catch (error) {
    log(`   ✗ Upload Failed: ${error.message}`, 'red');
    log('\n   Possible issues:', 'yellow');
    log('   - IAM user lacks s3:PutObject permission', 'yellow');
    log('   - Bucket policy blocks uploads', 'yellow');
    process.exit(1);
  }

  // Test Rekognition
  log('\n4. Testing AWS Rekognition...', 'yellow');
  try {
    // Create a simple 1x1 pixel image for testing
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const detectCommand = new DetectLabelsCommand({
      Image: { Bytes: testImage },
      MaxLabels: 5,
    });

    await rekognitionClient.send(detectCommand);
    log(`   ✓ Successfully connected to Rekognition`, 'green');
    log(`   ✓ IAM user has Rekognition permissions`, 'green');
  } catch (error) {
    log(`   ✗ Rekognition Test Failed: ${error.message}`, 'red');
    log('\n   Possible issues:', 'yellow');
    log('   - IAM user lacks Rekognition permissions', 'yellow');
    log('   - Rekognition not available in your region', 'yellow');
    log('   - Try switching to us-east-1 or us-west-2', 'yellow');
    process.exit(1);
  }

  // Success!
  log('\n✅ All AWS Tests Passed!', 'green');
  log('\nYour AWS configuration is correct. You can now:', 'green');
  log('  1. Start your Next.js app: npm run dev', 'blue');
  log('  2. Login to the dashboard', 'blue');
  log('  3. Upload a construction site image', 'blue');
  log('  4. Watch the AI analyze it in real-time!\n', 'blue');
}

// Run tests
testAWSConnection().catch(error => {
  log(`\n❌ Unexpected Error: ${error.message}\n`, 'red');
  process.exit(1);
});
