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
  
  import { ERR_MSG_INVALID_BUCKET, ERR_MSG_INVALID_FILE } from './common.js';
  
  //@TODO: Verify that we're correctly testing all behaviours, side effects and situations!
  describe('uploads', () => {
      beforeEach(() => {
  
      });
  
      afterEach(() => {
  
      });
  
      describe('getSignedURL', () => {
          it('should form the URL correctly', async () => {
  
          });
  
          it('should throw an error when axios request fails', async () => {
              //NOTE: is this something that makes sense to test?
          });
      });
  
      describe('getDurationOfPutRequest', () => {
          // @NOTE: what other behaviours needs to be tested here?
          it('should return -1 on failure of PUT request', async () => {
  
          });
  
          it('should return 0 on success', async () => {
  
          });
      });
  
      describe('getDurationOfUpload', () => {
          it('should throw Error if bucketName is invalid', async () => {
  
          });
  
          it('should throw Error if fileName is invalid', async () => {
  
          });
  
          it('should return -0.001 if PUT request fails', async () => {
  
          });
  
          it('should form axiosOptions correctly', async () => {
  
          });
  
          it('should form PUT request headers correctly', async () => {
  
          });
  
          it('should return 0 on success', async () => {
  
          });
  
          it('should throw error when request for signed URL fails', async () => {
  
          });
      });
  
      describe('benchmarkSingleUpload', () => {
          it('should throw Error if fileName is invalid', async () => {
  
          });
  
          it('should throw Error if bucketName is invalid', async () => {
  
          });
  
          it('should return an Array of an Object with bad values if PUT request fails', async () => {
  
          });
  
          it('should throw error when request for signed URL fails', async () => {
  
          });
  
          it('should return an Array of an Object on success', async () => {
  
          });
      });
  });
