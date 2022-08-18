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
<!-- Progress Bar: https://css-tricks.com/css3-progress-bars/ -->
    <div class="progbar">
      <span :style="{width: progressWidth}"/>
    </div>
</template>

<script>
export default {
    name: "ProgressBarComponent",
    props: {
        progressWidth: String
    }
}
</script>

<style scoped>
.progbar {
  height: 10px;
  position: relative;
  background-color: rgb(89, 101, 128);
  border-radius: 3px;
}
.progbar > span {
  display: block;
  height: 100%;
  max-width: 100%;
  background-color: hsl(214, 100%, 65%);
  position: relative;
  border-radius: 3px;
  overflow: hidden;
}

</style>