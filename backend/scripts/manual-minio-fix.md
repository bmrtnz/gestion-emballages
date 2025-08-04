# Manual MinIO Bucket Policy Fix

Since the script is having authentication issues, here's how to fix it manually:

## Option 1: Via MinIO Console (Easiest)

1. Open MinIO Console: http://localhost:9001
2. Login with:
   - Username: `minioadmin`
   - Password: `minioadmin123`
3. Click on "Buckets" in the left sidebar
4. Find the "documents" bucket and click on it
5. Go to the "Access Policy" tab
6. Change from "Private" to "Public"
7. Or click "Add Policy" and paste this JSON:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": ["*"]
            },
            "Action": [
                "s3:GetBucketLocation",
                "s3:ListBucket"
            ],
            "Resource": ["arn:aws:s3:::documents"]
        },
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": ["*"]
            },
            "Action": [
                "s3:GetObject"
            ],
            "Resource": ["arn:aws:s3:::documents/*"]
        }
    ]
}
```

## Option 2: Using MinIO Client (mc)

If you have MinIO Client installed:

```bash
# Configure MinIO client
mc alias set local http://localhost:9000 minioadmin minioadmin123

# Set bucket policy to public
mc anonymous set public local/documents
```

## Option 3: Check Docker Compose

Make sure MinIO is running with the correct environment variables:

```bash
docker-compose ps
docker-compose logs minio
```

If MinIO is not running:
```bash
docker-compose up -d minio
```

## Verify Access

After setting the policy, test access:
1. Try accessing an image directly: http://localhost:9000/documents/test.jpg
2. Should return 404 (not 403) if the bucket is public but file doesn't exist
3. If you get 403, the bucket is still private

## Common Issues

1. **Wrong credentials**: Make sure the .env file has the correct credentials
2. **MinIO not running**: Check with `docker ps`
3. **Network issues**: Try accessing MinIO console first
4. **Old MinIO version**: Update MinIO image if needed