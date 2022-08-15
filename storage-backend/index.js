/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const PORT = 3000;

const app = express();

const URL_EXPIRATION_TIME_INTERVAL = 15 * 60 * 1000; //15 minutes
const RANDOM_BYTES_LENGTH = 20;

/**
 * Sizes of files in each bucket and their associated size in bytes
 * @enum {number}
 */
const FILESIZE_BYTES = Object.freeze({
  '2mib.txt': 2097152,
  '64mib.txt': 67108864,
  '256mib.txt': 268435456,
});

/**
 * MD5 Checksums of contents of each string that is uploaded.
 * @enum {string}
 */
const MD5_SUMS = Object.freeze({
  '2mib.txt': 'stEjbChqPAcEIk/kEF7KSQ==',
  '64mib.txt': 'f2FNqTKc066/WbkarcML8A==',
  '256mib.txt': 'H1A55QvWaykMVmhNhVDGwg==',
});

// Allow HTTP requests from any origin
app.use(
  cors({
    origin: '*',
  })
);

app.get('/', (req, res) => {
  res.send(
    'This is the backend server to handle generating Signed URLs for uploads'
  );
});

/**
 * Handle GET request by generating and returning a signed URL to be used to upload a file.
 */
app.get('/:bucketName/:fileToUpload', async (req, res) => {
  const bucketName = req.params.bucketName;
  const fileToUpload = req.params.fileToUpload;

  const { Storage } = require('@google-cloud/storage');
  const storage = new Storage();

  // Append 40 random characters to the filename so that the same file can be uploaded simultaneously
  const uploadFileName = `${fileToUpload}-${crypto
    .randomBytes(RANDOM_BYTES_LENGTH)
    .toString('hex')}`;
  console.log(
    `${fileToUpload} to be uploaded as ${uploadFileName} to bucket ${bucketName}`
  );

  const options = {
    version: 'v4',
    action: 'write',
    expires: Date.now() + URL_EXPIRATION_TIME_INTERVAL,
    contentType: 'text/plain',
    contentMd5: MD5_SUMS[fileToUpload],
    extensionHeaders: {
      'x-goog-content-length-range': `${FILESIZE_BYTES[fileToUpload]},${FILESIZE_BYTES[fileToUpload]}`,
    },
  };

  const [url] = await storage
    .bucket(bucketName)
    .file(uploadFileName)
    .getSignedUrl(options);

  res.send(url);
});

app.listen(PORT, () => console.log(`Express server listening on port ${PORT}`));
