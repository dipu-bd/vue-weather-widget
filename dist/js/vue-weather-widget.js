(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.VuePopper = factory());
}(this, (function () { 'use strict';

var jQuery = require('jquery');

var Helper = {
	/**
  * Convert given object into query parameters
  * @param {*Object} data 
  */
	encodeQueryParam: function encodeQueryParam(data) {
		return Object.keys(data).map(function (key) {
			return [key, data[key]].map(encodeURIComponent).join('=');
		}).join('&');
	},
	darkSkyApi: function darkSkyApi(options) {
		// build api url
		var api = 'https://api.darksky.net/forecast/' + options.key + '/' + options.lat + ',' + options.lon + '?' + this.encodeQueryParam({
			units: options.units,
			lang: options.lang
		});
		// return jquery ajax promise
		return jQuery.ajax({
			type: 'GET',
			dataType: 'jsonp',
			url: api,
			crossDomain: true,
			xhrFields: {
				withCredentials: false
			}
		});
	}
};

var VueWeatherWidget$1 = { render: function render() {
		var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { attrs: { "id": "weather-view" } });
	}, staticRenderFns: [],
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
		options: function options() {
			return {
				key: this.key,
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
				static_skycons: true
			};
		}
	},

	mounted: function mounted() {
		require('./embed');
		setTimeout(loadWeather, 100);
	},


	methods: {
		loadWeather: function loadWeather() {
			if (!ForecastEmbed) return;

			var opts = this.options;
			if (!opts.lat || !opts.lon) {
				opts.title = 'Invalid Location';
			}

			if (!ForecastEmbed.unit_labels[opts.units]) {
				opts.units = 'us';
			}

			var embed = new ForecastEmbed(opts);
			embed.elem.prependTo(document.getElementsByTagName('weather-view'));
			embed.loading(true);

			Helper.darkSkyApi(opts).then(function (f) {
				embed.build(f);
				embed.loading(false);
			});
		}
	}

};

return VueWeatherWidget$1;

})));
