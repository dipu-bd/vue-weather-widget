import vue from "rollup-plugin-vue2";
import css from "rollup-plugin-css-porter";
import buble from "@rollup/plugin-buble";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

const production = process.env.BUILD === "production";
const distDir = "examples/static/dist";

export default {
  input: "src/index.js",
  output: {
    file: `${distDir}/js/vue-weather-widget${production ? ".min.js" : ".js"}`,
    name: "VueWeatherWidget",
    exports: "default",
    format: "cjs", //'umd'
  },
  external: ["vue"],
  plugins: [
    vue(),
    css({
      minified: production,
      dest: `${distDir}/css/vue-weather-widget.css`,
    }),
    buble(),
    nodeResolve({
      browser: true,
      preferBuiltins: true,
    }),
    commonjs(),
    production && terser(),
  ],
};
