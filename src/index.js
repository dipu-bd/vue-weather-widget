import VueWeatherWidget from "./VueWeatherWidget.vue";
import utils from "./utils";

export const VueWeather = VueWeatherWidget;
export const VueWeatherUtils = utils;

export default {
  install(Vue) {
    Vue.component("vue-weather", VueWeatherWidget);
  },
};
