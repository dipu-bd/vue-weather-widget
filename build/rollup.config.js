import fs from 'fs';
import vue from 'rollup-plugin-vue';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

const production = (process.env.NODE_ENV === 'production');

export default {
	entry: 'src/index.js',
	dest: 'dist/js/vue-weather-widget' + (production ? '.min.js' : '.js'),
	moduleName: 'VueWeatherWidget',
	format: 'umd',
	plugins: [
		css({
			minified: production
		}),
		vue({
			css (style) {
				if(production) {
					style = style.replace(/\s/g, ' ').replace(/\s\s/g, ' ');
				}
				fs.writeFileSync('dist/css/vue-weather-widget'
					+ (production ? '.min.css' : '.css'), style.trim());
			}
		}),
		babel({
			babelrc: false,
			runtimeHelpers: true,
			externalHelpers: false,
			exclude: 'node_modules/**',
			presets: [['es2015', {'modules': false}]],
			plugins: [
				'transform-object-assign',
				'external-helpers'
			]
		}),
		(production && uglify())
	],
};
