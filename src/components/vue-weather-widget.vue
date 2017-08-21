<template>
	<div id="forecast_embed" class="fe_container">
		<div class="fe_title" style="display:none">
			<span class="fe_location">
				<span></span>
			</span>
		</div>
		<div class="fe_forecast">
			<div class="fe_currently">
				<canvas id="fe_current_icon" width="160" height="160" style="width:80px; height:80px"></canvas>
				<div class="fe_temp"></div>
				<div class="fe_summary"></div>
				<div class="fe_wind"></div>
			</div>
			<div class="fe_daily"></div> 
			<div style="clear:left"></div>
		</div>
		<div class="fe_alert" style="display:none"></div>
		<div class="fe_loading" style="display:none">
			<canvas id="fe_loading_icon" width="100" height="100" style="width:50px; height:50px"></canvas>
			Loading...
		</div>
	</div>
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
		Vue.nextTick(this.loadWeather);
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
			
			embed.loading(true);
			Helper.darkSkyApi(opts).then((f) => {
				embed.build(f);
				embed.loading(false);
			});
		},
	}

}
</script>