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
import { Downloads } from '../src/backend/downloads.js';
import * as sinon from 'sinon';
import axios from 'axios';
import { describe, it } from 'mocha';

async function fakeAxiosGet(URL) {
    // Use a specific 'wrong URL' to mimic a GET request failing. Return -1 as specified in downloads.js
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

const ERR_MSG_INVALID_FILE = `Invalid File Name: 'random_file_name'. File names must be any of "2mib.txt", "64mib.txt" or "256mib.txt"`;
const ERR_MSG_INVALID_BUCKET = `Invalid Bucket Name: 'random_bucket_name'. Bucket must be a supported Google Cloud Storage Region Name. View https://cloud.google.com/storage/docs/locations for more information.`;

const VALID_BUCKET_NAME = 'us-west1';
const VALID_FILE_NAME = '2mib.txt';
const INVALID_BUCKET_NAME = 'random_bucket_name';
const INVALID_FILE_NAME = 'random_file_name';

describe('downloads', () => {
    let downloads;

    sinon.stub(performance, 'now').callsFake(fakeDateNow);
    sinon.stub(axios, 'get').callsFake(fakeAxiosGet);

    beforeEach(() => {
        downloads = new Downloads();
    });

    describe('getDurationOfGetRequest', () => {
        it('should return -1 on failure of GET request', async () => {
            const URL = 'poorly_formed_URL';
            const result = await downloads.getDurationOfGetRequest(URL);
            assert.deepStrictEqual(result, -1);
        });

        it('should return 0 on success', async () => {
            const URL = 'https://storage.googleapis.com/gcsrbpa-us-west1/2mib.txt';
            const result = await downloads.getDurationOfGetRequest(URL);
            assert.deepStrictEqual(result, 0);
        });
    });

    describe('getDurationInSeconds', () => {
        it('should throw Error if bucketName is invalid', async () => {
            const fileName = '2mib.txt';
            const bucketName = 'random_bucket_name';

            await assert.rejects(downloads.getDurationInSeconds(fileName, bucketName), { message: ERR_MSG_INVALID_BUCKET });
        });

        it('should throw Error if fileName is invalid', async () => {
            const fileName = 'random_file_name';
            const bucketName = 'us-west1';

            await assert.rejects(downloads.getDurationInSeconds(fileName, bucketName), { message: ERR_MSG_INVALID_FILE });
        });

        // downloads.downloadFile() returns -1 on failure, which is divided by 1000 to 
        // convert from millisecs to seconds. -1/1000 = -0.001.
        it('should return -0.001 if GET request fails', async () => {
            const bucketName = 'wrongBucket';
            const fileName = 'wrongFile';

            let result = await downloads.getDurationInSeconds(fileName, bucketName);
            assert.deepStrictEqual(result, -0.001);
        });

        it('should return 0 on success', async () => {
            const fileName = '2mib.txt';
            const bucketName = 'us-west1';
            const result = await downloads.getDurationInSeconds(fileName, bucketName);
            assert.deepStrictEqual(result, 0);
        });

        it('should build URL correctly', async () => {
            const fileName = '2mib.txt';
            const bucketName = 'us-west1';
            await downloads.getDurationInSeconds(fileName, bucketName);
            assert.deepStrictEqual(downloads._builtURL, `https://storage.googleapis.com/gcsrbpa-us-west1/2mib.txt`);
        });
    });

    describe('benchmarkSingleDownload', () => {
        it('should return an Array of an Object on success', async () => {
            const fileName = '2mib.txt';
            const bucketName = 'us-west1';
            const result = await downloads.benchmarkSingleDownload(fileName, bucketName);

            // SpeedBps and SpeedMiBps are set to 'Infinity' because of the division by 0. 
            let expected = [{
                'bucketName': 'us-west1',
                'location': 'Oregon',
                'fileName': '2mib.txt',
                'timeTaken': '0.000',
                'fileSizeBytes': '2097152',
                'speedBps': 'Infinity', 
                'speedMiBps': 'Infinity',
            }];

            assert.deepStrictEqual(result, expected);
        });

        it('should throw Error if fileName is invalid', async () => {
            const fileName = 'random_file_name';
            const bucketName = 'us-west1';

            await assert.rejects(downloads.benchmarkSingleDownload(fileName, bucketName), { message: ERR_MSG_INVALID_FILE });
        });

        it('should throw Error if bucketName is invalid', async () => {
            const fileName = '2mib.txt';
            const bucketName = 'random_bucket_name';

            await assert.rejects(downloads.benchmarkSingleDownload(fileName, bucketName), { message: ERR_MSG_INVALID_BUCKET });
        });

        it('should return an Array of an Object with bad values if GET request fails', async () => {
            const fileName = 'wrongFile';
            const bucketName = 'wrongBucket';

            let result = await downloads.benchmarkSingleDownload(fileName, bucketName);

            let expected = [{
                'bucketName': 'wrongBucket',
                'fileName': 'wrongFile',
                'fileSizeBytes': 'wrongFile',
                'location': 'wrongBucket',
                'speedBps': '-1.000',
                'speedMiBps': '-1.000',
                'timeTaken': '-0.001',
            }];

            assert.deepStrictEqual(result, expected);
        })
    });
})
