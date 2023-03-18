const fs = require('fs');

const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: 'AKIA5CNOQI3CG3VQUOJ4',
  secretAccessKey: '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',
});

const s3 = new AWS.S3();

async function uploadImageToS3(file, callback) {
  const params = {
    Bucket: 'bucket841234',
    Key: file.originalname,
    Body: fs.createReadStream(file.path),
    ResponseContentType: 'image/jpeg',
    ResponseContentDisposition: 'inline',
  };
  return s3.upload(params, callback).promise();
}

module.exports = { uploadImageToS3 };
