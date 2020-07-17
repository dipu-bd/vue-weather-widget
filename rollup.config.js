import vue from "rollup-plugin-vue2";
import buble from "rollup-plugin-buble";
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import scss from "rollup-plugin-scss";
import { uglify } from "rollup-plugin-uglify";

const production = process.env.NODE_ENV === "production";

export default {
  input: "src/index.js",
  output: {
    file: "dist/js/vue-weather-widget" + (production ? ".min.js" : ".js"),
    name: "VueWeatherWidget",
    format: "cjs", //'umd'
  },
  plugins: [
    vue(),
    scss({
      output: true,
      outputStyle: "compressed",
      dest: "dist/css/vue-weather-widget" + (production ? ".min.css" : ".css"),
    }),
    buble(),
    nodeResolve({ browser: true, jsnext: true, main: true }),
    commonjs(),
    production && uglify(),
  ],
  external: ["vue"],
  watch: {
    exclude: "node_modules/**",
    include: "src/**",
  },
};
