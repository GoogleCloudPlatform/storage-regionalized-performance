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

import * as assert from 'assert';
import { Downloads } from "../src/backend/downloads.js";
import * as sinon from 'sinon';
import axios from 'axios';
import { describe, it } from 'mocha';

async function fakeAxiosGet(URL) {
    // Use a specific "wrong URL" to mimic a GET request failing. Return -1 as specified in downloads.js
    const wrongURL = `https://storage.googleapis.com/wrongBucket/wrongFile`;
    if (URL == wrongURL) {
        return -1;
    }

    // If the URL does not match https://storage.googleapis.com/${bucketName}/${fileName}, throw an error.
    const regexURL = 'https:\/\/storage\.googleapis\.com\/([a-zA-Z]+(-[a-zA-Z]+)+)[0-9]+\/[0-9]+([a-zA-Z]+(\.[a-zA-Z]+)+)';
    if (!URL.match(regexURL)) {
        throw new Error('URL is not well defined');
    }
}

function fakeDateNow() {
    return 1;
}

describe('downloads', () => {
    let downloads;

    sinon.stub(Date, "now").callsFake(fakeDateNow);
    sinon.stub(axios, "get").callsFake(fakeAxiosGet);

    beforeEach(() => {
        downloads = new Downloads();
    });

    describe('downloadFile', () => {
        it('should return -1 on failure of GET request', async () => {
            const URL = 'poorly_formed_URL';
            const result = await downloads.downloadFile(URL);
            assert.equal(result, -1);
        });

        it('should return 0 on success', async () => {
            const URL = 'https://storage.googleapis.com/gcsrbpa-us-west1/2mib.txt';
            const result = await downloads.downloadFile(URL);
            assert.equal(result, 0);
        });
    });

    describe('timeDownload', () => {
        it('should throw Error if bucketName is invalid', async () => {
            const fileName = "2mib.txt";
            const bucketName = "random_bucket_name";

            assert.rejects(downloads.timeDownload(fileName, bucketName), "Invalid Bucket Name");
        });

        it('should throw Error if fileName is invalid', async () => {
            const fileName = "random_file_name";
            const bucketName = "us-west1";

            assert.rejects(downloads.timeDownload(fileName, bucketName), "Invalid File Name");
        });

        it('should return -0.001 if GET request fails', async () => {
            const bucketName = "wrongBucket";
            const fileName = "wrongFile";

            let result = await downloads.timeDownload(fileName, bucketName);
            assert.equal(result, -0.001);
        });

        it('should return 0 on success', async () => {
            const fileName = "2mib.txt";
            const bucketName = "us-west1";
            const result = await downloads.timeDownload(fileName, bucketName);
            assert.equal(result, 0);
        });

        it('should build URL correctly', async () => {
            const fileName = "2mib.txt";
            const bucketName = "us-west1";
            await downloads.timeDownload(fileName, bucketName);
            assert.equal(downloads._builtURL, `https://storage.googleapis.com/gcsrbpa-us-west1/2mib.txt`);
        });
    });

    describe('benchmarkSingleDownload', () => {
        it('should return a Map object on success', async () => {
            const fileName = "2mib.txt";
            const bucketName = "us-west1";
            const result = await downloads.benchmarkSingleDownload(fileName, bucketName);

            let expected = new Map();
            expected.set('bucketName', 'us-west1');
            expected.set('location', 'Oregon');
            expected.set('fileName', '2mib.txt');
            expected.set('timeTaken', 0);
            expected.set('fileSizeBytes', 2097152);
            expected.set('speedBps', 'Infinity');
            expected.set('speedMiBps', 'Infinity');

            assert.deepEqual(result, expected);
        });

        it('should throw Error if fileName is invalid', async () => {
            const fileName = "random_file_name";
            const bucketName = "us-west1";

            assert.rejects(downloads.benchmarkSingleDownload(fileName, bucketName), "Invalid File Name");
        });

        it('should throw Error if bucketName is invalid', async () => {
            const fileName = "2mib.txt";
            const bucketName = "random_bucket_name";

            assert.rejects(downloads.benchmarkSingleDownload(fileName, bucketName), "Invalid Bucket Name");
        });

        it('should return Map with bad values if GET request fails', async () => {
            const fileName = "wrongFile";
            const bucketName = "wrongBucket";

            let result = await downloads.benchmarkSingleDownload(fileName, bucketName);

            let expected = new Map();
            expected.set('bucketName', 'wrongBucket');
            expected.set('fileName', 'wrongFile');
            expected.set('fileSizeBytes', 'wrongFile');
            expected.set('location', 'wrongBucket');
            expected.set('speedBps', '-1.000');
            expected.set('speedMiBps', '-1.000');
            expected.set('timeTaken', -0.001);

            assert.deepEqual(result, expected);
        })
    });

    describe('benchmarkDownload', () => {
        it('should throw Error if fileName is invalid', async () => {
            const fileName = "random_file_name";
            const bucketName = "us-west1";

            assert.rejects(downloads.benchmarkDownload(fileName, bucketName), "Invalid File Name");
        });

        it('should throw Error if bucketName is invalid', async () => {
            const fileName = "2mib.txt";
            const bucketName = "random_bucket_name";

            assert.rejects(downloads.benchmarkDownload(fileName, bucketName), "Invalid Bucket Name");
        });

        it('should return JSON String on success', async () => {
            const fileName = "2mib.txt";
            const bucketName = "us-west1";
            let result = await downloads.benchmarkDownload(fileName, bucketName);
            let expected = `[{"bucketName":"us-west1","location":"Oregon","fileName":"2mib.txt","timeTaken":0,"fileSizeBytes":2097152,"speedBps":"Infinity","speedMiBps":"Infinity"}]`;
            assert.equal(result, expected);
        });

        it('should return JSON String with default values if GET request fails', async () => {
            const fileName = "wrongFile";
            const bucketName = "wrongBucket";

            let result = await downloads.benchmarkDownload(fileName, bucketName);
            let expected = `[{"bucketName":"wrongBucket","location":"wrongBucket","fileName":"wrongFile","timeTaken":-0.001,"fileSizeBytes":"wrongFile","speedBps":"-1.000","speedMiBps":"-1.000"}]`;

            assert.equal(result, expected);
        })
    });
})
