
const execa = require('execa')

const args = require('minimist')(process.argv.slice(2))
const targets = args._

if (!targets.length) {
    console.error(`dev must have target`)
    process.exit(1)
}


run()

async function run() {
    let target = targets[0]
    build(target)

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
        `__DEV__:true`
        ]
        .filter(Boolean)
        .join(',')
        ,
        '-w'
    ],
    { 
        stdio: 'inherit' 
    }
)
}

catch(err) {
    process.exit()
}
}

