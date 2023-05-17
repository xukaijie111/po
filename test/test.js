


let {
    compilerSfc
} = require('../packages/compiler/dist/compiler.cjs.js')

let path = require('path')

let file = path.resolve(__dirname,'./components/index.pxml')


let res = compilerSfc(file)

console.log(res)
