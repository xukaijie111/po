const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const execa = require('execa')
const { gzipSync } = require('zlib')
const { compress } = require('brotli')
const { targets: allTargets, fuzzyMatchTarget } = require('./utils')

const args = require('minimist')(process.argv.slice(2))
const targets = args._
const buildAllMatching = args.all || args.a


run()

async function run() {
  if (!targets.length) {
    await buildAll(allTargets)
    checkAllSizes(allTargets)
  } else {
    await buildAll(fuzzyMatchTarget(targets, buildAllMatching))
    checkAllSizes(fuzzyMatchTarget(targets, buildAllMatching))
  }
}


async function buildAll(targets) {
    await runParallel(require('os').cpus().length, targets,build)
  }
  
  async function runParallel(maxConcurrency, source,iteratorFn) {

    const ret = []
    const executing = []
    for (const item of source) {
      const p = Promise.resolve().then(() => iteratorFn(item, source))
      ret.push(p)
  
      if (maxConcurrency <= source.length) {
        const e = p.then(() => executing.splice(executing.indexOf(e), 1))
        executing.push(e)
        if (executing.length >= maxConcurrency) {
          await Promise.race(executing)
        }
      }
    }
    return Promise.all(ret)
  }
  
  async function build(target) {

    try{
      await execa(
        'rollup',
        [
          '-c',
          '--environment',
          [
            `TARGET:${target}`,
          ]
            .filter(Boolean)
            .join(',')
        ],
        { 
          stdio: 'inherit' 
        }
    )
    }
   
    catch(err) {
      console.log(err)
      process.exit()
    }
  }

  
  function checkAllSizes(targets) {
    console.log()
    for (const target of targets) {
      checkSize(target)
    }
    console.log()
  }
  
  function checkSize(target) {
    const pkgDir = path.resolve(`packages/${target}`)
    let pkg = require(`${pkgDir}/package.json`)
    let lists = Object.keys(pkg).filter((key) => key === "main" || key === "module")
    lists.forEach((key) => {
      checkFileSize(`${pkgDir}/${pkg[key]}`)
    })
   
  }
  
  function checkFileSize(filePath) {
    if (!fs.existsSync(filePath)) {
      return
    }

    const file = fs.readFileSync(filePath)
    const minSize = (file.length / 1024).toFixed(2) + 'kb'
    const gzipped = gzipSync(file)
    const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb'
    const compressed = compress(file)
    const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb'
    console.log(
      `${chalk.gray(
        chalk.bold(path.basename(filePath))
      )} min:${minSize} / gzip:${gzippedSize} / brotli:${compressedSize}`
    )
  }
