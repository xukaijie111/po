

let {
    Compilation
} = require('../packages/pack/dist/pack.cjs')

let Path = require('path')

let comp = new Compilation({
    dist:Path.resolve(__dirname,'./dist')
});


comp.run();

console.log(1)
