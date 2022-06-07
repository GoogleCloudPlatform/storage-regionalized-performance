<template>
  <div>
    <button class="btn" @click="reloadDownloads('2mib')">2MiB</button>
    <button class="btn" @click="reloadDownloads('64mib')">64MiB</button>
    <button class="btn" @click="reloadDownloads('256mib')">256MiB</button>
    <ProgressBar :progressWidth="progressBarWidth" />
    <ResultsTable :results="results" ref="resultsTable" />
  </div>
</template>


<script>
import ResultsTable from "@/components/ResultsTable";
import ProgressBar from "../components/ProgressBar";
const downloads = require("@/backend/downloads");

var currentFileSize = "2mib";
let regions_json = downloads.regions_json;
var progressBarCount = 0;

export default {
  name: "DownloadsView",
  data() {
    return {
      results: [],
      currentFileSize: currentFileSize,
      progressBarWidth: "0%",
    };
  },
  methods: {
    async reloadDownloads(fileSize = "2mib") {
      currentFileSize = fileSize.toString();

      //reset progress bar
      progressBarCount = 0;
      this.progressBarWidth = progressBarCount.toString() + "%";

      this.results = [];
      const fileName = currentFileSize + ".txt";

      for (var bucketName in regions_json) {
        try {
          var result = await downloads.benchmark_download(fileName, bucketName);
          this.results = this.results.concat(JSON.parse(result));
          this.results = this.results.sort((a, b) => {
            return a.timeTaken < b.timeTaken
              ? -1
              : a.timeTaken > b.timeTaken
              ? 1
              : 0;
          });

          //Updating progress bar
          let aux = new Object(regions_json);
          let increment_size = 100 * (1 / Object.keys(aux).length);
          progressBarCount += increment_size;
          this.progressBarWidth = progressBarCount.toString() + "%";

          console.log("Downloads Success! ^_^");
        } catch (e) {
          console.log(e);
          console.log("Downloads Failed! :(");
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

