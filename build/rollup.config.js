import fs from 'fs';
import vue from 'rollup-plugin-vue';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import css from 'rollup-plugin-css-porter';

const production = (process.env.NODE_ENV === 'production');

export default {
	entry: 'src/index.js',
	dest: production ? 'dist/weather-widget.min.js' : 'dist/weather-widget.js',
	moduleName: 'VueWeatherWidget',
	format: 'umd',
	plugins: [
		css({
			minified: production
		}),
		vue({
			css (style) {
				if(!production) {
					fs.writeFileSync('dist/weather-widget.css', style.trim());
				} else {
					var minified = style.replace(/\s/g, ' ').trim();
					minified = minified.replace(/\s\s/g, ' ');
					fs.writeFileSync('dist/weather-widget.min.css', minified);
				}
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
