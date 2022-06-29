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
import * as downloads from "../src/backend/downloads.js";
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
        it('should return -0.001 on failure', async () => {
            const fileName = "random_file_name";
            const bucketName = "random_bucket_name";
            const result = await downloads.timeDownload(fileName, bucketName);
            assert.equal(result, -0.001);
        });
        it('should return 0 on success', async () => {
            const fileName = "2mib.txt";
            const bucketName = "us-west1";
            const result = await downloads.timeDownload(fileName, bucketName);
            assert.equal(result, 0);
        });
        // @TODO:
        // should add another test here to spy and make sure that downloadFile 
        // is being called with the right URL - all the functions need to be wrapped in a class!
    });

    describe('benchmarkSingleDownload', () => {
        // this could fail if axios fails, or if the file name and bucket name do not exist. 
        // i set up this test very poorly bc multiple parts could fail INDEPENDENTLY, and axios could fail for multiple reasons (not just bad URL)
        // OR we need need less ambiguous formed REGEX. 
        // change the function to actually throw an error if any one of those are undefined!!
        it('should form object correctly when inputs are malformed', async () => {
            const fileName = "random_file_name";
            const bucketName = "random_bucket_name";
            const result = await downloads.benchmarkSingleDownload(fileName, bucketName);

            let expected = new Map();
            expected.set('bucketName', 'random_bucket_name');
            expected.set('location', 'location');
            expected.set('fileName', 'random_file_name');
            expected.set('timeTaken', -0.001);
            expected.set('fileSizeBytes', 0);
            expected.set('speedBps', '0.000');
            expected.set('speedMiBps', '0.000');

            assert.deepEqual(result, expected)
        });
    });

})
