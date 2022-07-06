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
    <button class="btn" @click="reloadDownloads(FILESIZES_NAMES.small)">
      2MiB
    </button>
    <button class="btn" @click="reloadDownloads(FILESIZES_NAMES.medium)">
      64MiB
    </button>
    <button class="btn" @click="reloadDownloads(FILESIZES_NAMES.large)">
      256MiB
    </button>
    <ProgressBar :progressWidth="progressBarWidth" />
    <ResultsTable :results="results" ref="resultsTable" />
  </div>
</template>


<script>
import ResultsTable from '@/components/ResultsTable';
import ProgressBar from '../components/ProgressBar';
import { Downloads } from '@/backend/downloads';
import { REGIONS_MAP, FILESIZES_NAMES } from '@/backend/common';

let currentFileSize = FILESIZES_NAMES.small;
let progressBarCount = 0;

export default {
  name: 'DownloadsView',
  data() {
    return {
      results: [],
      currentFileSize: currentFileSize,
      progressBarWidth: '0%',
      FILESIZES_NAMES: FILESIZES_NAMES,
    };
  },
  methods: {
    async reloadDownloads(fileSize = FILESIZES_NAMES.small) {
      currentFileSize = fileSize.toString();
      //reset progress bar
      progressBarCount = 0;
      this.progressBarWidth = progressBarCount.toString() + '%';

      this.results = [];
      const fileName = currentFileSize;

      let downloads = new Downloads();
      for (let bucketName in REGIONS_MAP) {
        try {
          let result = await downloads.benchmarkDownload(fileName, bucketName);
          this.results = this.results.concat(JSON.parse(result));
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

          console.log('Downloads Success! ^_^');
        } catch (e) {
          console.log(e);
          console.log('Downloads Failed! :(');
        }
      }
    },
  },
  async created() {
    await this.reloadDownloads();
  },
  components: { ResultsTable, ProgressBar },
};
</script>
