if(window && require && !(window.$ || window.jQuery)) {
	window.$ = window.jQuery = require('jquery');
	require('./dist/css/vue-weather-widget.css');
}

import VueWeatherWidget from './components/vue-weather-widget.vue';
export default VueWeatherWidget;
