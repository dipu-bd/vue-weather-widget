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
				//font: this.font,
				//ff_name: this.fontFaceName,
				//ff_url: this.fontFaceUrl,
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

<style>
.fe_container {
	width: 100%;
	font-weight: 300;
	min-width: 500px;
	max-width: 1000px;
	color: #333;
	margin: 0 auto;
	height: 245px;
}
body.hide_daily .fe_container { min-width: 200px;}

.fe_container a { color: #333; }

.fe_container .fe_title {
	position: relative;
	height: 32px;
	border-bottom: 2px solid #444;
}

.fe_container .fe_title .fe_location {
	position: absolute;
	left: 10px;
	bottom: 6px;
	font-size: 18px;
	font-weight: bold;
}
body.hide_daily .fe_container .fe_title .fe_location { font-size: 14px; bottom: 8px; }
body.hide_daily .fe_container .fe_title .pre { display: none; }

.fe_container .fe_title .fe_forecast_link {
	position: absolute;
	right: 10px;
	bottom: 8px;
	font-size: 14px;
}

.fe_container .fe_forecast {
	margin-top: 14px;
}

.fe_container .fe_currently {
	float: left;
	position: relative;
	width: 35%;
	height: 100%;
	font-size: 14px;
	text-align: center;
	padding-top: 5px;
}
body.hide_daily .fe_container .fe_currently { width: 100%; }

.fe_container #fe_current_icon {
	display: inline-block;
	width: 80px;
	height: 80px;
}

.fe_container .fe_currently .fe_temp {
	display: inline-block;
	position: relative;
	top: -15px;
	margin-left: 5px;
	font-size: 50px;
	font-weight: bold;
	text-align: center;
	line-height: 0.65em;
}

.fe_container .fe_currently .fe_temp .fe_dir {
	display: block;
	position: relative;
	left: -5px;
	display: block;
	font-size: 14px;
	font-weight: normal;
}

.fe_container .fe_currently .fe_summary {
	font-size: 18px;
	font-weight: bold;
}

.fe_container .fe_currently .fe_wind {
	font-size: 14px;
}

.fe_container .fe_daily {
	float: left;
	display: table;
	width: 65%;
	height: 100%;
	font-size: 14px;
	text-align: center;
}
body.hide_daily .fe_container .fe_daily { display: none; }

.fe_container .fe_daily .fe_day {
	display: table-cell;
	text-align: center;
}

.fe_container .fe_daily .fe_day .fe_label {
	font-weight: bold;
	display: inline-block;
	width: 100%;
}

.fe_container .fe_daily .fe_icon {
	display: inline-block;
	width: 26px;
	height: 26px;
	margin-top: 2px;
}

.fe_container .fe_daily .fe_day .fe_temp_bar {
	position: relative;
	width: 20px;
	margin: 18px auto 0;
	font-size: 12px;
	border-radius: 200px;
}

.fe_container .fe_daily .fe_day .fe_high_temp {
	position: absolute;
	width: 100%;
	top: -16px;
	left: 2px;
}

.fe_container .fe_daily .fe_day .fe_low_temp {
	position: absolute;
	width: 100%;
	bottom: -16px;
	left: 2px;
}

.fe_alert {
	position: absolute;
	top: 205px;
	text-align: center;
	width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.fe_alert a {
	text-decoration: underline;
	text-overflow: ellipsis;
	font-style: italic;
	font-weight: bold;
	text-decoration: underline;
	color: #A00;
}

.fe_alert a .fe_icon {
	font-size: 20px;
}

.fe_loading {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	line-height: 240px;
	text-align: center;
	font-size: 18px;
	font-weight: bold;
}

#fe_loading_icon {
	position: relative;
	top: 15px;
	left: -5px;
}
</style>