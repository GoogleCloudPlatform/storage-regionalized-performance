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
import { it } from 'mocha';

async function fakeAxiosGet(URL) {
    // If the URL does not match https://storage.googleapis.com/${bucketName}/${fileName}, throw an error.
    const URL_regex = 'https:\/\/storage\.googleapis\.com\/([a-zA-Z]+(-[a-zA-Z]+)+)[0-9]+\/[0-9]+([a-zA-Z]+(\.[a-zA-Z]+)+)';
    if (!URL.match(URL_regex)) {
        throw new Error('URL is not well defined');
    }
}

function fakeDateNow() {
    return 1;
}

let downloads = new Downloads();

describe('downloads', () => {
    sinon.stub(Date, "now").callsFake(fakeDateNow);
    sinon.stub(axios, "get").callsFake(fakeAxiosGet);

    describe('downloadFile', () => {
        it('should return -1 on failure', async () => {
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

            try {
                await downloads.timeDownload(fileName, bucketName);
            }
            catch (e) {
                assert.deepEqual(e, new Error("Invalid Bucket Name"));
            }

            // assert.throws(
            //     () => { downloads.timeDownload(fileName, bucketName) },
            //     "Error: Invalid Bucket Name",
            // );

        });

        it('should throw Error if fileName is invalid', async () => {
            const fileName = "random_file_name";
            const bucketName = "us-west1";

            try {
                await downloads.timeDownload(fileName, bucketName);
            }
            catch (e) {
                assert.deepEqual(e, new Error("Invalid File Name"));
            }
        });

        //  @TODO: How to force axios to fail even with correct inputs? 
        // Or should downloadFile be allowed to throw an error directly?
        // it('should return -0.001 if GET request fails', async () => {

        // })

        it('should return 0 on success', async () => {
            const fileName = "2mib.txt";
            const bucketName = "us-west1";
            const result = await downloads.timeDownload(fileName, bucketName);
            assert.equal(result, 0);
        });
    });

    describe('benchmarkSingleDownload', () => {
        it('should return a Map object on success', async () => {
            const fileName = "2mib.txt";
            const bucketName = "us-west1";
            const result = await downloads.benchmarkSingleDownload(fileName, bucketName);

            let expected = new Map();
            expected.set('bucketName', 'us-west1')
            expected.set('location', 'Oregon')
            expected.set('fileName', '2mib.txt')
            expected.set('timeTaken', 0)
            expected.set('fileSizeBytes', 2097152)
            expected.set('speedBps', 'Infinity')
            expected.set('speedMiBps', 'Infinity')

            assert.deepEqual(result, expected);
        });

        it('should throw Error if fileName is invalid', async () => {
            const fileName = "random_file_name";
            const bucketName = "us-west1";

            try {
                await downloads.benchmarkSingleDownload(fileName, bucketName);
            }
            catch (e) {
                assert.deepEqual(e, new Error("Invalid File Name"));
            }
        });

        it('should throw Error if bucketName is invalid', async () => {
            const fileName = "2mib.txt";
            const bucketName = "random_bucket_name";

            try {
                await downloads.benchmarkSingleDownload(fileName, bucketName);
            }
            catch (e) {
                assert.deepEqual(e, new Error("Invalid Bucket Name"));
            }
        });

        //@TODO: How to force axios to fail even with correct inputs?
        // it('should return a poorly formed Map if GET request fails', async() => {

        // })
    });

    describe('benchmarkDownload', () => {
        it('should throw Error if fileName is invalid', async () => {
            const fileName = "random_file_name";
            const bucketName = "us-west1";

            try {
                await downloads.benchmarkDownload(fileName, bucketName);
            }
            catch (e) {
                assert.deepEqual(e, new Error("Invalid File Name"));
            }
        });

        it('should throw Error if bucketName is invalid', async () => {
            const fileName = "2mib.txt";
            const bucketName = "random_bucket_name";

            try {
                await downloads.benchmarkDownload(fileName, bucketName);
            }
            catch (e) {
                assert.deepEqual(e, new Error("Invalid Bucket Name"));
            }
        });

        it('should return JSON String on success', async () => {
            const fileName = "2mib.txt";
            const bucketName = "us-west1";
            let result = await downloads.benchmarkDownload(fileName, bucketName);
            let expected = `[{"bucketName":"us-west1","location":"Oregon","fileName":"2mib.txt","timeTaken":0,"fileSizeBytes":2097152,"speedBps":"Infinity","speedMiBps":"Infinity"}]`
            assert.equal(result, expected)
        })
    });
})
