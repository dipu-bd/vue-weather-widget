<template>
  <section class="container">
    <h1>From Open Weather Map</h1>
    <vue-weather
      api-key="45aee2ef715cfa91ed7957e8cfd37a70"
      units="uk"
      :latitude="lat"
      :longitude="long"
      language="en"
    />

    <hr />

    <h1>From Dark Sky Api</h1>
    <vue-weather
      api-key="e20753dfcaae902ab091fbb4925d432a"
      units="uk"
      :latitude="lat"
      :longitude="long"
      language="en"
      use-dark-sky-api
    />
  </section>
</template>

<script>
import VueWeather from "vue-weather-widget";

export default {
  name: "app",
  components: {
    VueWeather,
  },
  data: () => ({
    lat: "24.886436",
    long: "91.880722",
  }),
};
</script>

<style>
.container {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 95vh;
}

h1 {
  color: teal;
  border-bottom: 1px solid #dddddd;
  padding: 10px 0;
}
</style>
