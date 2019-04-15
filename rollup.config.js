// https://github.com/AndrewTBurks/json-summary v0.1.3 Copyright 2019 Andrew Burks

import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";

import pkg from "./package.json";

const copyright = `// ${pkg.homepage} v${pkg.version} Copyright ${(new Date).getFullYear()} ${pkg.author.name}`;


export default [
  // browser-friendly UMD build
  {
    input: "index",
    output: {
      name: "jsonSummary",
      file: pkg.browser,
      format: "umd",
      indent: false,
      banner: copyright
    },
    plugins: [
      resolve(), // so Rollup can find `ms`
      commonjs() // so Rollup can convert `ms` to an ES module
    ]
  },
  // browser-friendly minified UMD build
  {
    input: "index",
    output: {
      name: "jsonSummary",
      file: pkg.browserMin,
      format: "umd",
      indent: false
    },
    plugins: [
      resolve(), // so Rollup can find `ms`
      commonjs(), // so Rollup can convert `ms` to an ES module
      terser({ output: { preamble: copyright } }) // to minify
    ]
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: "index",
    external: ["ms"],
    output: [
      // { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "esm", banner: copyright }
    ]
  }
];
