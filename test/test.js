


let {
    compilerSfc
} = require('../packages/compiler/dist/compiler.cjs.js')

let path = require('path')

let file = path.resolve(__dirname,'./components/index.pxml')


async function a(){
    let res = await compilerSfc(file)

    console.log(res.code)
}

a()


