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

import { ERR_MSG_INVALID_BUCKET, ERR_MSG_INVALID_FILE, FILE_CONTENTS_2MIB } from './common.js';

async function FakeAxiosGetSuccess(axiosOptions) {
    return {
        data: 'http://www.fakeurl.com/'
    };
}

async function FakeAxiosGetFailure(axiosOptions) {
    throw new Error('Axios Get Request Failed');
}

async function FakeAxiosPutFailure(url, data, axiosOptions) {
    throw new Error('Axios Put Request Failed');
}

async function FakeAxiosPutSuccess(url, data, axiosOptions) {
    return {
        data: 'Successful Put Request!'
    }
}

function fakePerformanceNow() {
    return 1;
}

describe('uploads', () => {
    let uploads;
    beforeEach(() => {
        uploads = new Uploads();
        //@NOTE: Note all tests require this stub, take it out of the beforeEach()
        sinon.stub(performance, 'now').callsFake(fakePerformanceNow);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getSignedURL', async () => {
        it('should form the source of the signed URL correctly', async () => {
            let spyAxiosGetMethod = sinon.stub(axios, 'get').callsFake(FakeAxiosGetSuccess);
            const fileName = 'random_file_name';
            const bucketName = 'random_bucket_name';

            await uploads.getSignedURL(fileName, bucketName);

            assert.deepStrictEqual(spyAxiosGetMethod.args[0], [`http://localhost:3000/${bucketName}/${fileName}`]);
        });

        it('should throw an error when axios request fails', async () => {
            sinon.stub(axios, 'get').callsFake(FakeAxiosGetFailure);
            const fileName = 'random_file_name';
            const bucketName = 'random_bucket_name';

            await assert.rejects(uploads.getSignedURL(fileName, bucketName), { message: `Failed to reach server to get signedURL: Error: Axios Get Request Failed` });
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

        it('should return -0.001 if PUT request fails', async () => {
            sinon.stub(axios, 'put').callsFake(FakeAxiosPutFailure);
            sinon.stub(axios, 'get').callsFake(FakeAxiosGetSuccess);

            const fileName = '2mib.txt';
            const bucketName = 'us-west1';

            let result = await uploads.getDurationOfUpload(fileName, bucketName);

            assert.deepStrictEqual(result, -0.001);
        });

        it('should form axiosOptions correctly', async () => {
            let spyAxiosPutMethod = sinon.stub(axios, 'put').callsFake(FakeAxiosPutSuccess);
            sinon.stub(axios, 'get').callsFake(FakeAxiosGetSuccess);

            const fileName = '2mib.txt';
            const bucketName = 'us-west1';

            await uploads.getDurationOfUpload(fileName, bucketName)

            const expectedArgs = [
                'http://www.fakeurl.com/',
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
            ]

            assert.deepStrictEqual(spyAxiosPutMethod.args[0], expectedArgs);
        });

        it('should return 0 on success', async () => {
            sinon.stub(axios, 'put').callsFake(FakeAxiosPutSuccess);
            sinon.stub(axios, 'get').callsFake(FakeAxiosGetSuccess);

            const fileName = '2mib.txt';
            const bucketName = 'us-west1';

            const timeTaken = await uploads.getDurationOfUpload(fileName, bucketName);

            assert.deepStrictEqual(timeTaken, 0);
        });

        it('should throw error when Get request for signed URL fails', async () => {
            sinon.stub(axios, 'get').callsFake(FakeAxiosGetFailure);
            sinon.stub(axios, 'put').callsFake(FakeAxiosPutSuccess);

            const fileName = '2mib.txt';
            const bucketName = 'us-west1';

            await assert.rejects(uploads.getDurationOfUpload(fileName, bucketName), { message: 'Failed to reach server to get signedURL: Error: Axios Get Request Failed' });
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
            sinon.stub(axios, 'get').callsFake(FakeAxiosGetSuccess);
            sinon.stub(axios, 'put').callsFake(FakeAxiosPutFailure);

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
            sinon.stub(axios, 'get').callsFake(FakeAxiosGetFailure);
            sinon.stub(axios, 'put').callsFake(FakeAxiosPutSuccess);

            const fileName = '2mib.txt';
            const bucketName = 'us-west1';

            await assert.rejects(uploads.benchmarkSingleUpload(fileName, bucketName), { message: 'Failed to reach server to get signedURL: Error: Axios Get Request Failed' });
        });

        it('should return an Array of an Object on success', async () => {
            sinon.stub(axios, 'get').callsFake(FakeAxiosGetSuccess);
            sinon.stub(axios, 'put').callsFake(FakeAxiosPutSuccess);

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
