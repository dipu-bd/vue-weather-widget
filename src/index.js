import VueWeatherWidget from "./VueWeatherWidget.vue";

export default {
  // export the widget
  VueWeatherWidget,

  // plugin
  install(Vue) {
    Vue.component("vue-weather", VueWeatherWidget);
  },
};
