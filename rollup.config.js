// @ts-nocheck
import path from 'path'
import ts from 'rollup-plugin-typescript2'
import replace from '@rollup/plugin-replace'
import json from '@rollup/plugin-json'


if (!process.env.TARGET) {
  throw new Error('TARGET package must be specified via --environment flag.')
}

const masterVersion = require('./package.json').version
const packagesDir = path.resolve(__dirname, 'packages')
const packageDir = path.resolve(packagesDir, process.env.TARGET)
const resolve = p => path.resolve(packageDir, p)
const pkg = require(resolve(`package.json`))

let packageFormats = [];
if (pkg.module) packageFormats.push('es')
if (pkg.main) packageFormats.push('cjs');
if (pkg.global) packageFormats.push('global')


let packageConfigs = packageFormats.map(format => createConfig(format))


export default packageConfigs

function createOuput(format) {

  let match = {
    "es": function () {
      return {
        file: resolve(pkg.module),
        format: `es`
      }
    },
    "cjs": function () {
      return {
        file: resolve(pkg.main),
        format: `cjs`
      }
    },

    "global":function () {
      return {
        file: resolve(pkg.global),
        format: `iife`
    }
  }

  }

  return match[format]();
}

function createConfig(format, plugins = []) {
  let output = createOuput(format);
  if (!output) {
    console.log(require('chalk').yellow(`invalid format: "${format}"`))
    process.exit(1)
  }

  output.sourcemap = true;
  output.externalLiveBindings = false

  if (format === "global") {
    output.name = pkg.buildOptions.name
  }


  const tsPlugin = ts({
    check:false,
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    tsconfigOverride: {
      compilerOptions: {
        rootDir:`${packageDir}/src`,
        target: 'es2015',
        declaration: true,
        emitDeclarationOnly: false,
        declarationMap: false,
      },
      include:[`${packageDir}/src/index.ts`],
      exclude: ['**/__tests__', 'test-dts']
    }
  })


  let entryFile = `src/index.ts`


  let external = []



    external = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ]
  





  const nodePlugins =
    (format === 'cjs' && Object.keys(pkg.devDependencies || {}).length)
      ? [
        // @ts-ignore
        require('@rollup/plugin-commonjs')({
          sourceMap: false,
          ignore: []
        }),
        ...(format === 'cjs'
          ? []
          : // @ts-ignore
          [require('rollup-plugin-polyfill-node')()]),
        require('@rollup/plugin-node-resolve').nodeResolve()
      ]
      : []

  return {

    input: resolve(entryFile),
    // Global and Browser ESM builds inlines everything so that they can be
    // used alone.
    external,
    plugins: [
      json({
        namedExports: false
      }),
      createReplacePlugin(),
      tsPlugin,
      ...nodePlugins,
      ...plugins
    ],
    output,
    treeshake:false,
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    }
  }
}

function createReplacePlugin(

) {
  const replacements = {

    __VERSION__: `"${masterVersion}"`,
    __DEV__: false,
    __BROWSER__:false,
    __TEST__:true
  }

  Object.keys(replacements).forEach(key => {

    if (key in process.env) {
      replacements[key] = process.env[key]
    }
  })

  return replace({
    // @ts-ignore
    values: replacements,
    preventAssignment: true
  })
}
