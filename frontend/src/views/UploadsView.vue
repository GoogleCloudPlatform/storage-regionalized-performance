<!--
 Copyright 2022 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->

<template>
  <div>
    <button class="btn" @click="reloadUploads(FILESIZES_NAMES.small)">
      2MiB
    </button>
    <button class="btn" @click="reloadUploads(FILESIZES_NAMES.medium)">
      64MiB
    </button>
    <button class="btn" @click="reloadUploads(FILESIZES_NAMES.large)">
      256MiB
    </button>
    <ProgressBar :progressWidth="progressBarWidth" />
    <ResultsTable :results="results" ref="resultsTable" />
  </div>
</template>


<script>
import ResultsTable from '@/components/ResultsTable';
import ProgressBar from '../components/ProgressBar';
import { Uploads } from '@/backend/uploads';
import { REGIONS_MAP, FILESIZES_NAMES } from '@/backend/common';

let currentFileSize = FILESIZES_NAMES.small;
let progressBarCount = 0;

export default {
  name: 'UploadsView',
  data() {
    return {
      results: [],
      currentFileSize: currentFileSize,
      progressBarWidth: '0%',
      FILESIZES_NAMES: FILESIZES_NAMES,
    };
  },
  methods: {
    async reloadUploads(fileSize = FILESIZES_NAMES.small) {
      currentFileSize = fileSize.toString();
      //reset progress bar
      progressBarCount = 0;
      this.progressBarWidth = progressBarCount.toString() + '%';

      this.results = [];
      const fileName = currentFileSize;

      let uploads = new Uploads();
      for (let bucketName in REGIONS_MAP) {
        try {
          let result = await uploads.benchmarkSingleUpload(fileName, bucketName);
          this.results = this.results.concat(result);
          this.results = this.results.sort((a, b) => {
            if (a.timeTaken < b.timeTaken) {
              return -1;
            } else if (a.timeTaken > b.timeTaken) {
              return 1;
            }
            return 0;
          });

          //Updating progress bar
          progressBarCount =
            100 * (this.results.length / Object.keys(REGIONS_MAP).length);
          this.progressBarWidth = progressBarCount.toString() + '%';

        } catch (e) {
          // Error is logged without further handling for now - this will be extended with retries/other handling in the future.
          console.error(e);
        }
      }
    },
  },
  async created() {
    await this.reloadUploads();
  },
  components: { ResultsTable, ProgressBar },
};
</script>
