import builtins from 'rollup-plugin-node-builtins'
import nodeGlobals from 'rollup-plugin-node-globals'
import replace from 'rollup-plugin-replace'
import resolve from 'rollup-plugin-node-resolve'
import rollupTypescript from 'rollup-plugin-typescript2'
import uglify from 'rollup-plugin-uglify'

const pkg = require('./package.json')
const fs = require('fs')
const external = Object.keys(pkg.dependencies)

export default {
  entry: 'src/client.ts',
  dest: 'examples/lib/live-server-p2p.js',
  moduleName: 'p2p',
  format: 'iife',
  //sourceMap: 'inline',
  globals: ['p2p'],
  external: ['SimpleWebRTC'],
  plugins: [
    nodeGlobals(),
    builtins(),
    rollupTypescript(),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    replace({
      exclude: 'node_modules/**',
      ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    (process.env.NODE_ENV === 'production' && uglify()),
  ],
}
