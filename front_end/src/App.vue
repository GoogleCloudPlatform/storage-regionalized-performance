<template>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400&display=swap"
    rel="stylesheet"
  />
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
  />

  <SiteHeader
    title="GCSRBPA"
    subtitle="Benchmark GCS download performance from buckets in different regions"
  />

  <nav>
    <router-link class="btn" to="/">Downloads</router-link>
    <router-link class="btn" to="/uploads">Uploads</router-link>
  </nav>
  <router-view class="container" />
</template>

<script>
import SiteHeader from "./components/SiteHeader";

export default {
  name: "app",
  components: {
    SiteHeader,
  },
  methods: {},
};
</script>

<style>
#app {
  font-family: "Open Sans", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  padding: 0px 30px;
}
.container {
  margin: 15px auto;
  margin-left: 15px auto;
  margin-right: 15px auto;
  overflow: auto;
  min-height: 150px;
  border: 1px solid rgb(214, 214, 214);
  padding: 30px;
  border-radius: 10px;
  background-color: whitesmoke;
}
nav {
  padding: 30px;
}
nav a {
  font-weight: bold;
  color: #2c3e50;
}
nav a.router-link-exact-active {
  color: #1a73e8;
  background: whitesmoke;
  border: 1px solid #1a73e8;
  box-shadow: inset 1px 1px 5px #75879e;
}
nav a.router-link-exact-active:hover {
  color: #1a73e8;
  background: whitesmoke;
  border: 1px solid #1a73e8;
  box-shadow: none;
}
.btn {
  display: inline-block;
  background: #1a73e8;
  color: #fff;
  border: none;
  padding: 10px 10px;
  margin: 5px;
  border-radius: 3px;
  cursor: pointer;
  text-decoration: none;
  /* font-size: 15px; */
  font-family: inherit;
  text-align: center;
  justify-content: space-between;
}
.btn:focus {
  outline: none;
}
.btn:hover {
  background: #1762c4;
  filter: drop-shadow(0 0 0.2rem #1762c4);
}
.btn:active {
  transform: scale(0.98);
}
.btn-block {
  display: block;
  width: 100%;
}
.subtitle {
  color: rgb(89, 101, 128);
}
b {
  color: gray;
}
table {
  justify-content: space-evenly;
  margin: 10px auto;
  border: 1px solid grey;
  padding: 10px;
  width: 100%;
  border-collapse: collapse;
}
th {
  padding: 7px;
  background-color: #1a73e8;
  color: white;
  border-bottom: 1px solid grey;
  text-align: start;
}
td {
  border-bottom: 1px solid grey;
  color: rgb(31, 36, 46);
  padding: 10px;
}
tr:hover {
  background-color: rgb(221, 221, 221);
}
</style>
