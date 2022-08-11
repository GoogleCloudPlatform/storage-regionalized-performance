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
import { Uploads } from '../src/backend/uploads';
import * as sinon from 'sinon';
import axios from 'axios';
import { describe, it } from 'mocha';
import { ERR_MSG_INVALID_BUCKET, ERR_MSG_INVALID_FILE, FILE_CONTENTS_2MIB, fakePerformanceNow } from './common.js';

const SUCCESSFUL_REQUEST = 'Successful Request!';
const ERR_MSG_AXIOS_FAILURE = 'Axios Request Failed';
const ERR_MSG_FAILED_TO_REACH_SERVER = 'Failed to reach server to get signedURL';

// Function that simulates success of an axios PUT or GET request
async function fakeAxiosSuccess() {
    return {
        data: SUCCESSFUL_REQUEST
    }
}

// Function that simulates failure of an axios PUT or GET request
async function fakeAxiosFailure() {
    throw new Error(ERR_MSG_AXIOS_FAILURE);
}

describe('uploads', () => {
    let uploads;
    beforeEach(() => {
        uploads = new Uploads();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getSignedURL', async () => {
        it('should form the source of the signed URL correctly', async () => {
            let spyAxiosGetMethod = sinon.stub(axios, 'get').callsFake(fakeAxiosSuccess);
            const fileName = 'random_file_name';
            const bucketName = 'random_bucket_name';

            await uploads.getSignedURL(fileName, bucketName);

            // NOTE: This test will change during deployment, when signedURL server is not hardcoded to localhost.
            assert.deepStrictEqual(spyAxiosGetMethod.args[0], [`http://localhost:3000/${bucketName}/${fileName}`]);
        });

        it('should throw an error when axios request fails', async () => {
            sinon.stub(axios, 'get').callsFake(fakeAxiosFailure);
            const fileName = 'random_file_name';
            const bucketName = 'random_bucket_name';

            await assert.rejects(uploads.getSignedURL(fileName, bucketName), { message: `${ERR_MSG_FAILED_TO_REACH_SERVER}: Error: ${ERR_MSG_AXIOS_FAILURE}` });
        });
    });


    describe('getDurationOfUpload', () => {
        it('should throw Error if bucketName is invalid', async () => {
            const fileName = '2mib.txt';
            const bucketName = 'random_bucket_name';

            await assert.rejects(uploads.getDurationOfUpload(fileName, bucketName), { message: ERR_MSG_INVALID_BUCKET });
        });

        it('should throw Error if fileName is invalid', async () => {
            const fileName = 'random_file_name';
            const bucketName = 'us-west1';

            await assert.rejects(uploads.getDurationOfUpload(fileName, bucketName), { message: ERR_MSG_INVALID_FILE });
        });

        // uploads.getDurationOfUpload defaults elapsed time to -1 in failure. This is divided by 1000
        // to convert from millisecs to seconds. -1/1000 = -0.001.
        it('should return -0.001 if PUT request fails', async () => {
            sinon.stub(axios, 'put').callsFake(fakeAxiosFailure);
            sinon.stub(axios, 'get').callsFake(fakeAxiosSuccess);

            const fileName = '2mib.txt';
            const bucketName = 'us-west1';

            let result = await uploads.getDurationOfUpload(fileName, bucketName);

            assert.deepStrictEqual(result, -0.001);
        });

        it('should form axiosOptions correctly', async () => {
            let spyAxiosPutMethod = sinon.stub(axios, 'put').callsFake(fakeAxiosSuccess);
            sinon.stub(axios, 'get').callsFake(fakeAxiosSuccess);

            const fileName = '2mib.txt';
            const bucketName = 'us-west1';

            await uploads.getDurationOfUpload(fileName, bucketName)

            const expectedArgs = [
                SUCCESSFUL_REQUEST,
                FILE_CONTENTS_2MIB,
                {
                    headers: {
                        'Content-Type': 'text/plain',
                        'Content-Md5': 'stEjbChqPAcEIk/kEF7KSQ==',
                        'x-goog-content-length-range': `2097152,2097152`,
                    },
                    maxBodyLength: Infinity,
                    maxContentLength: Infinity
                }
            ];

            assert.deepStrictEqual(spyAxiosPutMethod.args[0], expectedArgs);
        });

        it('should return 0 on success', async () => {
            sinon.stub(axios, 'put').callsFake(fakeAxiosSuccess);
            sinon.stub(axios, 'get').callsFake(fakeAxiosSuccess);
            sinon.stub(performance, 'now').callsFake(fakePerformanceNow);

            const fileName = '2mib.txt';
            const bucketName = 'us-west1';

            const timeTaken = await uploads.getDurationOfUpload(fileName, bucketName);

            assert.deepStrictEqual(timeTaken, 0);
        });

        it('should throw error when Get request for signed URL fails', async () => {
            sinon.stub(axios, 'get').callsFake(fakeAxiosFailure);
            sinon.stub(axios, 'put').callsFake(fakeAxiosSuccess);

            const fileName = '2mib.txt';
            const bucketName = 'us-west1';

            await assert.rejects(uploads.getDurationOfUpload(fileName, bucketName), { message: `${ERR_MSG_FAILED_TO_REACH_SERVER}: Error: ${ERR_MSG_AXIOS_FAILURE}` });
        });
    });

    describe('benchmarkSingleUpload', () => {
        it('should throw Error if fileName is invalid', async () => {
            const fileName = 'random_file_name';
            const bucketName = 'us-west1';

            await assert.rejects(uploads.benchmarkSingleUpload(fileName, bucketName), { message: ERR_MSG_INVALID_FILE });
        });

        it('should throw Error if bucketName is invalid', async () => {
            const fileName = '2mib.txt';
            const bucketName = 'random_bucket_name';

            await assert.rejects(uploads.benchmarkSingleUpload(fileName, bucketName), { message: ERR_MSG_INVALID_BUCKET });
        });

        it('should return an Array of an Object with bad values if PUT request fails', async () => {
            sinon.stub(axios, 'get').callsFake(fakeAxiosSuccess);
            sinon.stub(axios, 'put').callsFake(fakeAxiosFailure);

            let expected = [
                {
                    bucketName: 'us-west1',
                    location: 'Oregon',
                    fileName: '2mib.txt',
                    timeTaken: '-0.001',
                    fileSizeBytes: '2097152',
                    speedBps: '-2097152000.000',
                    speedMiBps: '-2000.000'
                }
            ];

            const fileName = '2mib.txt';
            const bucketName = 'us-west1';

            let actual = await uploads.benchmarkSingleUpload(fileName, bucketName);

            assert.deepStrictEqual(actual, expected);
        });

        it('should throw error when request for signed URL fails', async () => {
            sinon.stub(axios, 'get').callsFake(fakeAxiosFailure);
            sinon.stub(axios, 'put').callsFake(fakeAxiosSuccess);

            const fileName = '2mib.txt';
            const bucketName = 'us-west1';

            await assert.rejects(uploads.benchmarkSingleUpload(fileName, bucketName), { message: `${ERR_MSG_FAILED_TO_REACH_SERVER}: Error: ${ERR_MSG_AXIOS_FAILURE}` });
        });

        it('should return an Array of an Object on success', async () => {
            sinon.stub(axios, 'get').callsFake(fakeAxiosSuccess);
            sinon.stub(axios, 'put').callsFake(fakeAxiosSuccess);
            sinon.stub(performance, 'now').callsFake(fakePerformanceNow);

            // SpeedBps and SpeedMiBps are set to 'Infinity' because of the division by 0. 
            let expected = [
                {
                    bucketName: 'us-west1',
                    location: 'Oregon',
                    fileName: '2mib.txt',
                    timeTaken: '0.000',
                    fileSizeBytes: '2097152',
                    speedBps: 'Infinity',
                    speedMiBps: 'Infinity'
                }
            ];

            const fileName = '2mib.txt';
            const bucketName = 'us-west1';

            let actual = await uploads.benchmarkSingleUpload(fileName, bucketName);

            assert.deepStrictEqual(actual, expected);
        });
    });
});
