import vue from 'rollup-plugin-vue2';
import css from 'rollup-plugin-css-only';
import buble from 'rollup-plugin-buble';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';

const production = (process.env.NODE_ENV === 'production');

export default {
	moduleName: 'VueWeatherWidget',
	input: 'src/index.js',
	output: {
		file: 'dist/js/vue-weather-widget' + (production ? '.min.js' : '.js'),
		format: 'cjs'
	},
	format: 'umd',
	plugins: [
		vue(),
		css(),
		buble(),
		nodeResolve({ browser: true, jsnext: true, main: true }),
		commonjs(),
		(production && uglify())
	],
};
