<template>
	<div id="weather-view"></div>
</template>

<script src="../assets/embed.js"></script>

<script>
import Helper from '../helper';
import Embed from '../assets/embed';
//import FlashCanvas from '../assets/flashcanvas';

export default {
	name: 'vue-weather-widget',

	props: {
		// Your Dark Sky secret key
		apiKey: {
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
		language: {
			type: String,
			default: 'en',
			required: false
		},

		// Return weather conditions in the requested units.
		// For list of supported units, visit https://darksky.net/dev/docs/forecast
		units: {
			type: String,
			default: 'us',
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

		font: {
			type: 'String',
			default: null,
			required: false
		},

		fontFaceName: {
			type: String,
			default: null,
			required: false
		},

		fontFaceUrl: {
			type: String,
			default: null,
			required: false
		}
	},

	computed: {
		options() {
			return {
				key: this.apiKey,
				lat: this.latitude,
				lon: this.longitude,
				lang: this.language,

				name: this.title,
				units: this.units.toLowerCase(),
				hide_header: this.hideHeader,
				color: this.barColor,
				text_color: this.textColor,
				font: this.font,
				ff_name: this.fontFaceName,
				ff_url: this.fontFaceUrl,
				static_skycons: true,
			};
		}
	},

	mounted() {
		Embed();
		//FlashCanvas();
		setTimeout(this.loadWeather, 100);
	},

	methods: {
		loadWeather() {
			if(!ForecastEmbed) return;

			let opts = this.options;
			if(!opts.lat || !opts.lon) {
				opts.title = 'Invalid Location';
			}

			if(!ForecastEmbed.unit_labels[opts.units]) {
				opts.units = 'us';
			}

			var embed = new ForecastEmbed(opts);
			embed.elem.prependTo(document.getElementsByTagName('weather-view'));
			embed.loading(true);

			Helper.darkSkyApi(opts).then((f) => {
				embed.build(f);
				embed.loading(false);
			});
		},
	}

}
</script>