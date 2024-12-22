import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { minify } from 'rollup-plugin-esbuild-minify';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import { fileURLToPath, URL } from 'url'
import fs from 'fs';

function config(inputName, outputName) {
   return [
      _config(inputName, outputName, false),
      _config(inputName, outputName, true)
   ];
}

function _config(inputName, outputName, minifyIt) {
   const plugins = [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      json(),
      {
         transform ( code, id ) {
           // console.log( 'id >>>', id );
           // console.log( code );
           // not returning anything, so doesn't affect bundle
         },

         buildEnd() {
            // console.log('\x1b[32m./dist/mod-core.css %s', Math.ceil(fs.statSync('./dist/mod-core.css').size / 1024) + ' kb');
            // console.log('\x1b[32m./dist/mod-core.min.css %s', Math.ceil(fs.statSync('./dist/mod-core.min.css').size / 1024) + ' kB');
         },

         writeBundle(options, bundle) {
            console.log(`\x1b[32m${options.file} %s`, Math.ceil(fs.statSync(options.file).size / 1024) + ' kb');
            // console.log('>>>>>>>> writeBundle.bundle:', bundle);
         }
      },
      alias({
         // resolve: ['scss', '.vue', '.js'],
         entries: [
            {
               find: '@',
               replacement: fileURLToPath(new URL('./src', import.meta.url))
            }
         ]
      })
   ];

   if (minifyIt) {
      outputName = `${outputName}.min`;
      plugins.push(minify({ logLevel: 'debug', logLimit: 100 }));
   }

   return {
      input: `${inputName}.js`,

      output: [
         {
            format: 'esm',
            file: `./dist/${outputName}.mjs`,
            sourcemap: true,
            compact: true
         },
         {
            format: 'cjs',
            file: `./dist/${outputName}.cjs`,
            sourcemap: true,
            compact: true
         }
      ],

      external: ['luxon'],
      plugins
   };
}

export default [
   ...config('libs/core', 'hs-core'),
   ...config('libs/utils', 'utils'),
   ...config('libs/formatter', 'formatter'),
   ...config('libs/dateutil', 'date-util'),
   ...config('libs/globalcache', 'global-cache'),
   ...config('libs/countryutil', 'country-util'),
   ...config('libs/imageutil', 'image-util'),
   ...config('libs/nodeutil', 'node-util')
];
