// Source: https://cloud.google.com/storage/docs/configuring-cors#storage_cors_configuration-nodejs

const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

async function configureBucketCors(bucketName, origin, responseHeader, maxAgeSeconds, method) {
    await storage.bucket(bucketName).setCorsConfiguration([
        {
            maxAgeSeconds,
            method: [method],
            origin: [origin],
            responseHeader: responseHeader,
        },
    ]);

    console.log(`Bucket ${bucketName} was updated with a CORS config
      to allow ${method} requests from ${origin} sharing 
      ${responseHeader} responses across origins`);
}

const bucketName = 'gcsrbpa-upload-sandbox';
const origin = 'http://localhost:8080/';
const responseHeader = ['Content-Type', 'Content-Md5', 'x-goog-content-length-range'];
const maxAgeSeconds = 3600;
const method = 'PUT';

configureBucketCors(bucketName, origin, responseHeader, maxAgeSeconds, method).catch(console.error);


let regions = require('./regions.json');

for (const [key, value] of Object.entries(regions)) {
    const bucketName = `gcsrbpa-upload-${key}`
    configureBucketCors(bucketName, origin, responseHeader, maxAgeSeconds, method).catch(console.error);
}
  
