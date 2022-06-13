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
    <header>
      <h1>{{ title }}</h1>
    
    <button class="btn" @click="onClick">About <i class="fa fa-question-circle" aria-hidden="true"/></button>
    </header>
    <h3 class="subtitle">{{ subtitle }}</h3>
  </div>
</template>

<script>
export default {
  name: "SiteHeader",
  props: ["title", "subtitle"],
  methods: {
      onClick(){
          console.log("About Page Button Clicked")
      }
  }
};
</script>

<style scoped>
div {
    padding: 10px 30px ;

}
i {
    padding-left: 10px;
    font-size: larger;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #1a73e8;
}
.fileSizes {
  display: flex;
  justify-content: right;
  align-items: center;
}
</style>