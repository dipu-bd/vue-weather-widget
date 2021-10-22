<template>
  <section class="container">
    <h1>From Open Weather Map</h1>
    <vue-weather
      api-key="45aee2ef715cfa91ed7957e8cfd37a70"
      units="uk"
      language="en"
      :latitude="dhaka.lat"
      :longitude="dhaka.lng"
    >
      <span slot="title">Weather for {{ dhaka.name }}</span>
    </vue-weather>

    <hr />

    <h1>From Dark Sky Api</h1>
    <vue-weather
      use-dark-sky-api
      api-key="e20753dfcaae902ab091fbb4925d432a"
      units="uk"
      language="en"
      :latitude="sylhet.lat"
      :longitude="sylhet.lng"
    >
      <span slot="title">Weather for {{ sylhet.name }}</span>
    </vue-weather>
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
    dhaka: {
      name: "Dhaka, Bangladesh",
      lat: 23.8103,
      lng: 90.4125,
    },
    sylhet: {
      name: "Sylhet, Bangladesh",
      lat: 24.8949,
      lng: 91.8687,
    },
  }),
};
</script>

<style>
.container {
  font-family: Helvetica, Arial, sans-serif;
  color: #2c3e50;
  height: 95vh;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 700px;
}

h1 {
  color: teal;
  border-bottom: 1px solid #dddddd;
  padding: 10px 0;
}
</style>
