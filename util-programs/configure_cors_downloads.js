// Source: https://cloud.google.com/storage/docs/configuring-cors#storage_cors_configuration-nodejs

// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');

// Creates a client
const storage = new Storage();

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
// The origin for this CORS config to allow requests from
const origin = 'http://localhost:8080';

// The response header to share across origins
const responseHeader = 'Content-Type';

// The maximum amount of time the browser can make requests before it must
// repeat preflighted requests
const maxAgeSeconds = 3600;

// The name of the method
// See the HttpMethod documentation for other HTTP methods available:
// https://cloud.google.com/appengine/docs/standard/java/javadoc/com/google/appengine/api/urlfetch/HTTPMethod
const method = 'GET';

async function configureBucketCors(bucketName, origin, responseHeader, maxAgeSeconds, method) {
  await storage.bucket(bucketName).setCorsConfiguration([
    {
      maxAgeSeconds,
      method: [method],
      origin: [origin],
      responseHeader: [responseHeader],
    },
  ]);

  console.log(`Bucket ${bucketName} was updated with a CORS config
      to allow ${method} requests from ${origin} sharing 
      ${responseHeader} responses across origins`);
}

const fs = require("fs");
let raw_data = fs.readFileSync("regions.json");
let regions_json = JSON.parse(raw_data);

// Allow Access to All Regions' Buckets
for (var region in regions_json){
    const bucketName = `gcsrbpa-${region}`
    configureBucketCors(bucketName, origin, responseHeader, maxAgeSeconds, method).catch(console.error);
}
