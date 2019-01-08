import Helper from '../helper';
import Embed from '../assets/embed';

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

		// Use static skycons
		disableAnimation: {
			type: Boolean,
			default: false,
			required: false
		},

		// Auto update interval in seconds
		updateInterval: {
			type: Number,
			default: null,
			required: false
		}
	},

	data() {
		return {
			updater: null,
			embed: null,
		};
	},

	computed: {
		options() {
			let opts = {
				key: this.apiKey,
				lat: this.latitude,
				lon: this.longitude,
				lang: this.language,

				title: this.title,
				units: this.units.toLowerCase(),
				hide_header: this.hideHeader,
				color: this.barColor,
				text_color: this.textColor,
				static_skycons: this.disableAnimation,
			};
			if(window.ForecastEmbed && !ForecastEmbed.unit_labels[opts.units]) {
				opts.units = 'us';
			}
			if(!opts.lat || !opts.lon) {
				opts.title = 'Invalid Location';
			}
			if(!opts.title) {
				opts.hide_header = true;
			}
			return opts;
		}
	},

	watch: {
		options() {
			this.loadWeather();
		},
		updateInterval() {
			this.setAutoUpdate();
		}
	},

	mounted() {
		Embed();
		this.embed = new ForecastEmbed(this.options);
		this.embed.loading(true);
		this.loadWeather();
		this.setAutoUpdate();
	},

	destroyed() {
		this.stopUpdater();
	},

	methods: {
		loadWeather() {
			let opts = this.options;
			Helper.darkSkyApi(opts).then((f) => {
				this.embed.build(f);
				this.embed.loading(false);
			});
		},

		setAutoUpdate() {
			if(!this.updateInterval) return;
			this.stopUpdater();
			this.updater = setInterval(this.loadWeather, this.updateInterval * 1000);
		},

		stopUpdater() {
			if(this.updater) {
				clearInterval(this.updater);
				this.updater = null;
			}
		},
	}

};
