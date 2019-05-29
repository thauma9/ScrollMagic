// import babel from 'rollup-plugin-babel';
import replace from "rollup-plugin-replace";
import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";
import { sizeSnapshot } from "rollup-plugin-size-snapshot";
import { uglify } from "rollup-plugin-uglify";

import pkg from "./package.json";

const input = "dev/src/ScrollMagic.js";
const globalName = "ScrollMagic";

function external(id) {
  return !id.startsWith(".") && !id.startsWith("/");
}

const baseReplacements = {
  __VERSION__: JSON.stringify(pkg.version)
};

const cjs = [
  {
    input,
    output: { file: `cjs/${pkg.name}.js`, format: "cjs" },
    external,
    plugins: [
      replace({
        ...baseReplacements
      })
    ]
  },

  {
    input,
    output: { file: `cjs/${pkg.name}.min.js`, format: "cjs" },
    external,
    plugins: [
      replace({
        ...baseReplacements
      }),
      uglify()
    ]
  }
];

const esm = [
  {
    input,
    output: { file: "esm/ScrollMagic.js", format: "esm" },
    external,
    plugins: [
      replace({
        ...baseReplacements
      }),
      sizeSnapshot()
    ]
  }
];

const umd = [
  {
    input,
    output: {
      file: `${pkg.name}/uncompressed/ScrollMagic.js`,
      format: "umd",
      name: globalName
    },
    plugins: [
      nodeResolve(),
      commonjs({
        include: /node_modules/
      }),
      replace({
        ...baseReplacements
      }),
      sizeSnapshot()
    ]
  },

  {
    input,
    output: {
      file: `${pkg.name}/minified/ScrollMagic.min.js`,
      format: "umd",
      name: globalName
    },
    plugins: [
      nodeResolve(),
      commonjs({
        include: /node_modules/
      }),
      replace({
        ...baseReplacements
      }),
      sizeSnapshot(),
      uglify()
    ]
  }
];

let config;
switch (process.env.BUILD_ENV) {
  case "cjs":
    config = cjs;
    break;
  case "esm":
    config = esm;
    break;
  case "umd":
    config = umd;
    break;
  default:
    config = cjs.concat(esm).concat(umd);
}

export default config;
