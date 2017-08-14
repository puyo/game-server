import builtins from 'rollup-plugin-node-builtins'
// import commonjs from 'rollup-plugin-commonjs'
// import livereload from 'rollup-plugin-livereload'
import nodeGlobals from 'rollup-plugin-node-globals'
import replace from 'rollup-plugin-replace'
import resolve from 'rollup-plugin-node-resolve'
import rollupTypescript from 'rollup-plugin-typescript2'
//import serve from 'rollup-plugin-serve'
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
    // commonjs({
    //   namedExports: {
    //     'node_modules/socket.io-client/lib/url.js': [ 'url' ],
    //     'node_modules/has-binary/index.js': ['hasBinary'],
    //     'node_modules/simplewebrtc/src/simplewebrtc.js': ['SimpleWebRTC'],
    //     'node_modules/lodash.clonedeep/index.js': 'cloneDeep',
    //     'node_modules/socket.io-parser/binary.js': ['deconstructPacket', 'reconstructPacket', 'removeBlobs'],
    //   }
    // }),
    // eslint(),
    replace({
      exclude: 'node_modules/**',
      ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    (process.env.NODE_ENV === 'production' && uglify()),
    // (process.argv.indexOf('--live') !== -1 && serve('examples')),
    // (process.argv.indexOf('--live') !== -1 && livereload('examples')),
  ],
}
