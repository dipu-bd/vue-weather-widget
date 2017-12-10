try {
	window.$ = window.jQuery = require('jquery');
	require('../css/vue-weather-widget.css');
} catch (ex) {
	// ignore exceptions
}

import VueWeatherWidget from './components/vue-weather-widget.vue';
export default VueWeatherWidget;
