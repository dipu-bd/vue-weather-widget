<template>
  <div id="app">
    <weather 
      api-key="6f4f5c469cd230cb0b90ca2a001cc57c"
      title="Weather for Dhaka, Bangaldesh"
      units="uk"
      :latitude="lat"
      :longitude="long"
      language="en"></weather>
  </div>
</template>

<script>
import Weather from '../../../src/index.js'

export default {
  name: 'app',
  components: {
    Weather
  },
  data: () => ({
    lat: '24.886436',
    long: '91.880722'
  })
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
