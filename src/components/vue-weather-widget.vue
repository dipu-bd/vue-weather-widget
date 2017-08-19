<template>
	<iframe src="about:blank">
		
	</iframe>
</template>

<script>
import Helper from '../helper';

export default {
	name: 'vue-weather-widget',

	props: {
		// Your Dark Sky secret key
		key: {
			type: String,
			required: true
		},

		// The latitude of a location (in decimal degrees). 
		// Positive is north, negative is south.
		latitude: {
			type: String,
			required: true
		},

		// The longitude of a location (in decimal degrees).
		// Positive is east, negative is west.
		longitude: {
			type: String,
			required: true
		},

		// Return summary properties in the desired language.
		// For list of supported languages, visit https://darksky.net/dev/docs/forecast
		lang: {
			type: String,
			default: 'en',
			required: false
		},

		// Return weather conditions in the requested units.
		// For list of supported units, visit https://darksky.net/dev/docs/forecast
		units: {
			type: String,
			default: 'auto',
			required: false
		},

		// Color of the Temparature bar. Default: '#333'
		barColor: {
			type: String,
			default: '#333',
			required: false
		},

		// Color of the text. Default: '#333'
		textColor: {
			type: String,
			default: '#333',
			required: false
		},

		// Title of the widget. Default: 'Weather'
		title: {
			type: String,
			default: 'Weather',
			required: false
		},

		// Controls whether to show or hide the title bar.
		hideHeader: {
			type: Boolean,
			default: false,
			required: false
		},
	}
}
</script>