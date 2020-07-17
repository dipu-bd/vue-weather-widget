import VueWeatherWidget from "./VueWeatherWidget.vue";

export default {
  install(Vue) {
    Vue.component("vue-weather", VueWeatherWidget);
  },
};
