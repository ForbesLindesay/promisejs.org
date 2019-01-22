
const {join} = require('path');
const s3 = require('s3');

const output = join(__dirname, 'out');

console.log({
  PREFIX: process.env.PREFIX,
  S3_REGION: process.env.S3_REGION,
  S3_BUCKET: process.env.S3_BUCKET
});

const client = s3.createClient({
  s3Options: {
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET,
    region: process.env.S3_REGION
  }
});
const uploader = client.uploadDir({
  localDir: output,
  deleteRemoved: false,
  s3Params: {
    Bucket: process.env.S3_BUCKET,
    Prefix: process.env.PREFIX || ''
  }
});
uploader.on('error', err => {
  console.error('unable to sync');
  console.error(err.stack);
  process.exit(1);
});
uploader.on('end', () => {
  console.log('done uploading website');
});